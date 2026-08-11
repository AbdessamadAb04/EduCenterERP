# Plan: Wiring EduCenter ERP Frontend to Supabase (CRUD cut-over)

## 1. Context & current state

**Already on Supabase (via `src/api/supabaseService.ts`):**
- Auth: `LoginPage` / `SignupPage` (`supabase.auth`), `ProtectedRoute`, `PostSignupPage`
- Establishments: `MesEtablissements`, `NouvelEtablissement` (`create_establishment` RPC), `MonEtablissement` (update)
- Profile: `MonProfil` (users update)
- **Students**: `StudentsList`, `StudentsByClass` → `studentsService` / `classesService`
- **Finance**: `FinanceManager` + `PaymentDataContext` → `paymentsService`
- **Dashboard**: `Dashboard.tsx` → `dashboardService.getStats`

**Still on localStorage (the gap):**
- **Classes module** — `ClassesList.tsx` + `ScheduleCalendar.tsx` persist classes + schedule sessions under `classes_<etab>` / `scheduleEvents_<etab>` with **numeric** ids and camelCase fields. `scheduleService` exists in `supabaseService.ts` but is imported nowhere.
- `CenterContext` persists the active establishment under `etablissement` (localStorage).
- `StudentsList.tsx:109` has a localStorage fallback for the class dropdown (`classes_<etab>`).
- Dead code: `src/pages/students/mockServices.ts`, `src/pages/compte/MonCompte.tsx`.

**Schema reality (from `supabase/DB_config/*` + migration):**
- DB rows use `uuid` ids, snake_case columns (`max_capacity`, `tarif_amount`, `tarif_period`, `class_id`, ...).
- `schedule_classes` requires `class_id` (NOT NULL FK) and has **no status/archived column**.
- `schedule_classes.day` is `smallint` with a CHECK (`schedule_events_day_check`) — the 0–6 (Monday=0) mapping is unverified.
- RLS: reads for any member; writes OWNER/ADMIN (+SECRETARY for students/payments); **deletes OWNER/ADMIN only**; establishment creation only via `create_establishment` RPC.
- `updated_at` is stamped by a DB trigger; the service also sends it (redundant).

## 2. Agreed scope
1. Port Classes module to `classesService` + `scheduleService` (full CRUD, archive, restore, schedule sessions).
2. One-time seed of existing localStorage demo data into Supabase.
3. Every schedule session must link to a class (standalone sessions are dropped during seed; UI prevents creating new ones).
4. Cleanup: remove all localStorage business data, dead files, and the StudentsList fallback.
5. Verify with `npm run lint` + `npm run build`.

## 3. Required schema change (only one)
`schedule_classes` has no archive flag. Add one so the existing "archive session" UI survives the cut-over:

```sql
ALTER TABLE public.schedule_classes
  ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;
```

- New migration file `supabase/migrations/<date>_schedule_archived_column.sql`.
- No RLS change needed (already class-scoped). Class archive → also flag its sessions (`archived=true`); class delete → `scheduleService.removeByClass`.

## 4. Execution steps

### Phase 0 — Pre-flight
- Confirm `.env` has `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (both present).
- Verify in the live DB the `schedule_events_day_check` expression (0–6 vs 1–7); align `ScheduleCalendar`/service accordingly.
- Confirm an authenticated user with OWNER/ADMIN membership exists for the etab (required by RLS for class/schedule writes and for seeding).

### Phase 1 — Harden the API layer (`src/api/supabaseService.ts`)
- Add `ClassRow` / `ScheduleRow` types + `classeDbToUi` / `classeUiToDb` / `scheduleDbToUi` / `scheduleUiToDb` mappers.
- Add `scheduleService.archive(id)` (sets `archived=true`); reuse `listByEtablissement` + filter for archived lists.
- Add minimal `etablissementsService.getById(id)` (for CenterContext) — keeps direct-call pages untouched (out of scope).
- Remove client-side `updated_at` from update payloads (trigger owns it).
- `classesService.list` already returns raw rows — keep; ClassesList will consume the mapped shape.

### Phase 2 — Classes module cut-over (`ClassesList.tsx`, `ScheduleCalendar.tsx`)
- Replace `StoredClass` / `ScheduleEvent` (number ids, camelCase) with `uuid` / snake_case-backed types; `ScheduleCalendar` becomes purely presentational with `id: string` events (name/subject/teacher/color hydrated via the `classes` join).
- Replace `useLocalStorage` state with React state loaded from `classesService.list(etab)` + `scheduleService.listByEtablissement(etab)`.
- Rewire every handler:
  - create / edit / archive / restore / delete class → `classesService.{create,update,archive,remove}`
  - delete class also → `scheduleService.removeByClass`
  - create session → `scheduleService.create` (requires a class; open class picker, block otherwise)
  - edit session → `scheduleService.update` (single row only — fixes toFix #1/#2: no more mass regeneration, archived rows preserved)
  - archive session → `scheduleService.archive`; delete session → `scheduleService.remove`; delete all archived → loop removes
  - class archive/delete → also flag/remove its sessions (fixes toFix #6 semantics)
  - fix 24:00 leak and cross-midnight clipping while touching handlers (toFix #3/#4)

### Phase 3 — One-time data seed (`src/utils/seed.ts`, new)
- On ClassesList mount, if `classesService.list(etab)` returns empty and localStorage `classes_<etab>` / `scheduleEvents_<etab>` have data:
  1. Insert each class via `classesService.create` (capture returned uuid; use `crypto.randomUUID()` for an id-map in case `.select()` is unavailable).
  2. Insert each schedule event **that has a `classId`** via `scheduleService.create` against the mapped uuid; **drop standalone sessions** (per agreed model).
  3. On success, `removeItem` both keys + set a `ec_seeded_<etab>` flag to avoid re-running.
- Guard: only run for an authenticated OWNER/ADMIN (RLS insert requirement).

### Phase 4 — Cleanup
- Delete `src/pages/students/mockServices.ts`.
- Delete `src/pages/compte/MonCompte.tsx` (verify no imports first).
- `StudentsList.tsx:109`: remove `getItem<ClassRow[]>(classes_...)` fallback — rely on `classesService.list`.
- `ClassesList.tsx:175-188`: remove the legacy global-key migration effect.
- `CenterContext.tsx`: load the establishment from `etablissementsService.getById` (fall back to empty default), keep `setEtablissement` for the `MonEtablissement` save flow; drop `useLocalStorage`.
- Keep `utils/auth.ts` token persistence (legit auth state).

### Phase 5 — Verification
- `npm run lint`, `npm run build` (tsc + vite).
- Manual QA checklist per module: classes CRUD, archive/restore, schedule create/edit/archive/delete, seed run, students+finance still working, cross-etab data isolation.

## 5. Files touched
| File | Change |
|---|---|
| `src/api/supabaseService.ts` | types, mappers, `scheduleService.archive`, `etablissementsService.getById`, drop client `updated_at` |
| `src/pages/classes/ClassesList.tsx` | biggest rewrite: supabase state + handlers |
| `src/pages/classes/ScheduleCalendar.tsx` | `id: string` event type |
| `src/pages/students/StudentsList.tsx` | remove localStorage fallback |
| `src/context/CenterContext.tsx` | supabase-backed establishment |
| `src/utils/seed.ts` (new) | one-time localStorage → Supabase seed |
| `supabase/migrations/<date>_schedule_archived_column.sql` (new) | `archived` column |
| `src/pages/students/mockServices.ts` | delete |
| `src/pages/compte/MonCompte.tsx` | delete |

## 6. Risks / gotchas
- `payments.method` is a French-string enum (`Espèces`, `CIH`, ...) — already matched by FinanceManager; do not "normalize".
- `classe_id` (students) vs `class_id` (schedules) naming inconsistency.
- RLS: seed and class writes require OWNER/ADMIN; deletes are OWNER/ADMIN-only (UI must gate delete buttons by role for non-owners).
- Standalone sessions are intentionally lost during seed.
- `.env` holds secrets — never commit/print values.
