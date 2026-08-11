Findings worth attention
Likely bugs
1. Editing a recurring session silently deletes that class's archived sessions. handleSave for scheduleContext === 'event' removes all events with that classId, then regenerates from the form (ClassesList.tsx:395-403) — archived sessions of the class get wiped.
2. Edit vs. archive asymmetry: clicking edit on one session regenerates every session of the class (with new generateId() ids), while archive only soft-archives that single session. Inconsistent, and ids change on edit.
3. 24:00 leak: creating from the 23:00 cell produces endTime: "24:00" (ScheduleCalendar.tsx:147-155) which is shown in the modal/time fields.
4. Cross-midnight overflow: sessions like 22:00→01:00 are supported by resolveEndMinutes but render beyond the grid height and clip (ScheduleCalendar.tsx:132-144).
5. Dead code: opacity: event.status === 'ARCHIVED' ? 0.55 : 1 (ScheduleCalendar.tsx:328) — archived events never appear in the grid (visibleEvents filters them at line 61).
6. Cl   ass archive = hard delete of its sessions (ClassesList.tsx:611), while session archive is soft — inconsistent semantics.
7. Print preview buckets times by string comparison (e.startTime <= '10:00', ClassesList.tsx:1748) — fragile and the preview ignores the export selection (only dims unselected events), unlike the PDF path.
8. localStorage keys are global (classes, scheduleEvents) — not scoped per établissement, so data leaks across establishments of the same browser.