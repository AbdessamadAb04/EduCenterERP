# EduCenterERP — resumable memory

## User preferences / scope
- Work step by step and give a short “bilan” after each update.
- Commit and tag locally only when asked; **never push** without explicit approval.
- Current task is Jalon 04 of Google Drive Jalons 00→06. Jalon 07 is out of scope.
- **Client-side work is out of scope: treat it as nonexistent. Do not run or report client-side checks.**

## Repository / git state
- Root: `C:\Users\Dell\Desktop\I-Stock\My Projects\repo-workstation\EduCenterERP`
- Current HEAD: `080fdcc feat: add centralized Config Server`
- Last local tag: `v3.0`
- Local tags: `v0.0`, `v0.1`, `v1.0`, `v2.0`, `v3.0`
- Worktree is dirty with all Jalon 04 changes; **no commit and no `v4.0` tag yet**.
- Nothing has been pushed.
- `documentation/memory.md` is currently untracked; include it in the final Jalon 04 commit if keeping this memory in the repo.

## Jalon 04 objective
- Add Feign-based cross-service validation.
- Enrich payment views with établissement label.
- Add idempotency keys to writer endpoints.
- Map remote failures to `502`, unknown remote entities to `404`, and idempotency key reuse with a different payload to `409`.

## Implemented — backend
### Common
- Added `educenter-backend/common/src/main/java/com/educentererp/common/RemoteServiceException.java`
- Added `educenter-backend/common/src/main/java/com/educentererp/common/IdempotencyHash.java`
- Updated `ApiExceptionHandler.java` to map `RemoteServiceException` → `502 Bad Gateway`.
- Updated `PaymentResponse.java` with `etablissement_id` and `etablissement_name`.

### Feign wiring
- Added `spring-cloud-starter-openfeign` to finance and formation poms.
- Added `@EnableFeignClients(basePackages = "com.educentererp")` to `FinanceServiceApplication.java` and `FormationServiceApplication.java`.
- All `@FeignClient` annotations use unique `contextId` values to avoid duplicate `FeignClientSpecification` beans:
  - `financeFormationStudentClient`
  - `financeFormationClassClient`
  - `financeEtablissementClient`
  - `formationPaymentClient`
  - `formationEtablissementClient`
- Finance clients:
  - `StudentFeignClient` + `StudentClient` wrapper → formation
  - `ClassFeignClient` + `ClassClient` wrapper → formation
  - `EtablissementFeignClient` + `EtablissementClient` wrapper → établissement
- Formation clients:
  - `PaymentFeignClient` + `PaymentClient` wrapper → finance
  - `EtablissementFeignClient` + `EtablissementClient` wrapper → établissement
- Wrapper behavior:
  - `FeignException.NotFound` → `NoSuchElementException` → `404`
  - other `FeignException` → `RemoteServiceException` → `502`

### Idempotency
- Added per-service `idempotency_keys` entity/repository/service:
  - `educenter-backend/finance-service/src/main/java/com/educentererp/module/idempotency/`
  - `educenter-backend/formation-service/src/main/java/com/educentererp/module/idempotency/`
- `Idempotency-Key` is optional on:
  - `POST /api/payments`
  - `POST /api/classes`
  - `POST /api/students`
  - `POST /api/sessions`
  - `POST /api/sessions/classes/{classId}`
- Same key + same body returns the first response without a duplicate write.
- Same key + different body returns `409`.

### Validation / enrichment
- `PaymentService.apply(...)`:
  - validates student via formation
  - validates class via formation
  - resolves établissement via établissement-service
  - stores `etablissementId`, `etablissementName`
  - `PaymentResponse` now returns `etablissement_id` / `etablissement_name`
- `ClasseService.apply(...)` validates `etablissement_id` via Feign.
- `StudentService.apply(...)` validates the class’s `etablissement_id` via Feign.
- `StudentService.delete(...)` keeps the finance payment-count guard via Feign.
- `ScheduleService.create(...)` and `createForClass(...)` support idempotency.

## Implemented — documentation
- `README.md` now describes Jalon 04, Feign calls, 404/502 behavior, and idempotency headers.
- `documentation/postman/EduCenterERP.postman_collection.json`:
  - renamed to `EduCenterERP - Jalon 04`
  - added variable `idempotencyKey`
  - added folder `Idempotency & Feign validation`
  - includes idempotent class/payment create + replay, unknown établissement → 404, unknown student payment → 404
- JSON parsed successfully.
- `git diff --check` passed with only expected LF→CRLF warnings.

## Verification already done
- Maven build passed after fixes:
  ```powershell
  $env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-25.0.4.101-hotspot"
  & "C:\Users\Dell\Desktop\I-Stock\My Projects\repo-workstation\EduCenterERP\educenter-backend\mvnw.cmd" -q -f "C:\Users\Dell\Desktop\I-Stock\My Projects\repo-workstation\EduCenterERP\educenter-backend\pom.xml" install -rf :finance-service
  ```
- Expected Config Server fallback warnings appear during tests; they are not failures.
- Fixed compile/test issues encountered along the way:
  - missing `PaymentResponse` import in `PaymentService.java`
  - restored `findPaid()`, `findPending()`, public `toResponse(...)`, and public `getEntity(...)` used by `DashboardService`
  - duplicate Feign bean name fixed with unique `contextId`

## Verification completed (2026-11-23)
- Full `mvnw -q clean install` passed from `educenter-backend/` with JDK 25; all 7 JARs rebuilt, no `[ERROR]`/`BUILD FAILURE` in the log.
- Targeted `finance-service`/`formation-service` `*ApplicationTests` passed with `-Dsurefire.failIfNoSpecifiedTests=false`; Config Server fallback warnings are harmless.
- Postman JSON parses successfully; `git diff --check` is clean apart from expected LF→CRLF warnings.
- Final smoke run passed: config health UP, config/gateway routes served, 3 `lb://` routes, 9 GET checks 200, CORS 200, class and payment idempotent replay (same ids, no duplicates), enriched payment `etablissement_id=1` + label, unknown établissement/student -> 404, same idempotency key with different body -> 409.
- Remote communication error verified separately by stopping `formation-service`: POST `/api/payments` through gateway returned `502` with `{"error":"Formation service indisponible"}`.
- `documentation/postman/EduCenterERP.postman_collection.json` now includes explicit 409 different-body and manual 502 communication-error cases; fixed unknown-student payment case by adding required `method`.
- No commit and no `v4.0` tag have been created; nothing has been pushed.

## Smoke harness state
- Temp scripts:
  - `C:\Users\Dell\AppData\Local\Temp\opencode\jalon04-smoke.ps1`
  - `C:\Users\Dell\AppData\Local\Temp\opencode\jalon04-run-smoke.ps1`
- Earlier fix retained: retry cleanup matches `*$appName-0.0.1-SNAPSHOT.jar*` instead of the generic backend path.
- Three harness fixes applied this session (temp file only, no repo change):
  - `Start-Process` gained `-WindowStyle Hidden`; without it child JVMs received `STATUS_CONTROL_C_EXIT` (-1073741510) and died with empty logs.
  - `badPaymentBody` now includes `method = 'Virement'` so the unknown-student POST reaches Feign validation instead of failing `@NotBlank` with 400.
  - `Get-CollectionCount` now flattens `ConvertFrom-Json` with `ForEach-Object { $_ }`; otherwise the array was counted as 1.
- Final run printed `SMOKE PASS` with: CONFIG HEALTH UP, gateway/datasource config served, 3 `lb://` routes, 9 GET checks 200, CORS 200, class and payment idempotent replay (same ids, no duplicates), `etablissement_id=1` + label on payment, and both unknown-établissement / unknown-student cases returning 404.
- Cleanup ran and printed `CLEANUP complete`; H2 `*.mv.db` files removed.

## Next steps
1. Re-read this file.
2. Jalon 04 verification is done (clean install + smoke PASS); worktree is still dirty with no commit/tag.
3. On explicit user request only: commit Jalon 04 (include `documentation/memory.md`) and tag `v4.0`.
4. Do not push.
5. Known follow-ups, deliberately not done in this session: idempotency race (no `@Transactional`, non-atomic `replay`/`store`), Feign timeouts absent from local fallback properties, receipt script path wrong for documented launch CWD, no dedicated Jalon 04 automated tests beyond context-load tests.

## Dirty files at stop time
Modified:
- `README.md`
- `documentation/postman/EduCenterERP.postman_collection.json`
- `educenter-backend/common/src/main/java/com/educentererp/common/ApiExceptionHandler.java`
- `educenter-backend/common/src/main/java/com/educentererp/common/dto/PaymentResponse.java`
- `educenter-backend/finance-service/pom.xml`
- `educenter-backend/finance-service/src/main/java/com/educentererp/finance/FinanceServiceApplication.java`
- `educenter-backend/finance-service/src/main/java/com/educentererp/finance/client/StudentClient.java`
- `educenter-backend/finance-service/src/main/java/com/educentererp/module/finance/Payment.java`
- `educenter-backend/finance-service/src/main/java/com/educentererp/module/finance/PaymentController.java`
- `educenter-backend/finance-service/src/main/java/com/educentererp/module/finance/PaymentService.java`
- `educenter-backend/formation-service/pom.xml`
- `educenter-backend/formation-service/src/main/java/com/educentererp/formation/FormationServiceApplication.java`
- `educenter-backend/formation-service/src/main/java/com/educentererp/formation/client/PaymentClient.java`
- `educenter-backend/formation-service/src/main/java/com/educentererp/module/classe/ClasseController.java`
- `educenter-backend/formation-service/src/main/java/com/educentererp/module/classe/ClasseService.java`
- `educenter-backend/formation-service/src/main/java/com/educentererp/module/schedule/ScheduleController.java`
- `educenter-backend/formation-service/src/main/java/com/educentererp/module/schedule/ScheduleService.java`
- `educenter-backend/formation-service/src/main/java/com/educentererp/module/student/StudentController.java`
- `educenter-backend/formation-service/src/main/java/com/educentererp/module/student/StudentService.java`

Untracked:
- `documentation/memory.md`
- `documentation/toprepare.md`
- `educenter-backend/common/src/main/java/com/educentererp/common/IdempotencyHash.java`
- `educenter-backend/common/src/main/java/com/educentererp/common/RemoteServiceException.java`
- `educenter-backend/finance-service/src/main/java/com/educentererp/finance/client/ClassClient.java`
- `educenter-backend/finance-service/src/main/java/com/educentererp/finance/client/ClassFeignClient.java`
- `educenter-backend/finance-service/src/main/java/com/educentererp/finance/client/EtablissementClient.java`
- `educenter-backend/finance-service/src/main/java/com/educentererp/finance/client/EtablissementFeignClient.java`
- `educenter-backend/finance-service/src/main/java/com/educentererp/finance/client/StudentFeignClient.java`
- `educenter-backend/finance-service/src/main/java/com/educentererp/module/idempotency/`
- `educenter-backend/formation-service/src/main/java/com/educentererp/formation/client/EtablissementClient.java`
- `educenter-backend/formation-service/src/main/java/com/educentererp/formation/client/EtablissementFeignClient.java`
- `educenter-backend/formation-service/src/main/java/com/educentererp/formation/client/PaymentFeignClient.java`
- `educenter-backend/formation-service/src/main/java/com/educentererp/module/idempotency/`
