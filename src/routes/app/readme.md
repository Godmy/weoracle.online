# Routes `/app` In WeOracle

This document describes the authenticated application routes under
`weoracle.online/src/routes/app`.

All routes except `/app/sign-in` and `/app/verify` are protected by
`+layout.server.ts`. The layout reads the `wbd_user` cookie through
`getSessionUser`; unauthenticated users are redirected to
`/app/sign-in?next=...`.

The shared app shell lives in `+layout.svelte`. It renders the left navigation
with `AdminSidebar` from `stylist-svelte`:

- `Sessions` -> `/app`
- `Questions` -> `/app/questions`
- `Estimates` -> `/app/estimates`
- `Analytics` -> `/app/analytics`
- `Discussions` -> `/app/discussions`
- `Reports` -> `/app/reports`
- `Settings` -> `/app/admin`, visible only for users with role `admin`

The shell footer shows the current user name, theme toggle, language control,
and sign-out form.

## `/app`

The sessions page shows the main session list with `SessionList`.

`+page.server.ts` loads sessions through `GET /api/wbd/sessions`.
For regular users it filters by `created_by={user.id}`. For admins it omits the
filter so admins can see all sessions.

The page supports:

- opening a session via `/app/{sessionId}`;
- creating a new session via `/app/new`;
- showing session counts already returned by the session API.

## `/app/questions`

The questions page is a cross-session question bank.

`+page.server.ts` calls `loadQuestionOverview(platform.env.DB, userId)` from
`$lib/server/wbd/admin-overview`.

The page shows:

- total questions for the current filter;
- submitted answer count for the current filter;
- discussion note count for the current filter;
- a session selector for filtering questions by session;
- a table with question text, session title, type, answer count, and discussion count.

For admins, the loader passes no `userId`, so the list includes all sessions.
For non-admin users, the list is scoped to sessions created by the current user.

## `/app/estimates`

The estimates page is a cross-session overview of expert answers.

`+page.server.ts` calls `loadEstimateOverview(platform.env.DB, userId)`.

The page shows:

- total estimate rows;
- submitted rows;
- average confidence;
- a table with question, session, expert alias/name, round, O/M/P values, and confidence.

Rows link back to the corresponding round screen:
`/app/{sessionId}/round?round={roundNumber}`.

## `/app/analytics`

The analytics page is an operational overview across sessions.

`+page.server.ts` calls `loadAnalyticsOverview(platform.env.DB, userId)`.

The page shows:

- session totals;
- active and completed session counts;
- total questions, answers, and discussion messages;
- session status distribution;
- high/medium/low consensus counts from round snapshots;
- average confidence.

## `/app/discussions`

The discussions page is a cross-session feed of expert discussion messages.

`+page.server.ts` calls `loadDiscussionOverview(platform.env.DB, userId)`.

The page shows each message with:

- expert alias;
- session title;
- round number;
- question text;
- message body;
- creation timestamp.

Each item links back to the corresponding round screen.

## `/app/reports`

The reports page summarizes final reports and report candidates.

`+page.server.ts` calls `loadReportOverview(platform.env.DB, userId)`.

The page shows:

- generated reports from `wbd_final_reports`;
- session title, report status, format, created date, and publish date when available;
- report candidates from `wbd_sessions` with question and response counts.

## `/app/new`

The new session page creates a Wideband Delphi session draft.

The page uses `SessionSetupWizard` from `stylist-svelte`. On submit, it calls
`POST /api/wbd/sessions` with the title, description, assumptions, and max round
count. After successful creation it redirects to `/app/{created.id}`.

## `/app/[id]`

The session detail page manages one Wideband Delphi session.

`+page.server.ts` loads:

- the session through `GET /api/wbd/sessions/{id}`;
- questions and experts included in the session payload;
- the current round view when `current_round > 0`.

The page contains:

- `SessionDetailLayout`;
- lifecycle controls;
- round progress;
- question editor;
- expert invitation panel;
- links to `/app/[id]/round` and `/app/[id]/analytics`.

Main actions include starting or advancing rounds, finalizing the session,
creating/updating/deleting questions, inviting experts, removing experts,
resending invites, and copying invite links.

## `/app/[id]/analytics`

The session analytics page shows analytics for a single session.

It loads snapshots through `GET /api/wbd/sessions/{id}/snapshots` after checking
that the current user is either admin or the session owner.

The page renders:

- consensus matrix;
- median trend;
- round comparison;
- permission denied state for unauthorized users.

## `/app/[id]/round`

The round page shows the results for a specific session round.

It loads `GET /api/wbd/sessions/{id}/round-view?round={round}` and renders:

- consensus review;
- disagreement prompts;
- confidence distribution;
- response distribution;
- rationale digest;
- discussion thread;
- CSV and JSON export actions.

## `/app/admin`

The admin area is protected by `admin/+layout.server.ts`.

The layout returns `isAdmin: user?.role === 'admin'`. Non-admin users see
`PermissionDeniedPanel`; admins see admin navigation with:

- `Users` -> `/app/admin`
- `Audit log` -> `/app/admin/audit-log`

### `/app/admin`

The users page loads `GET /api/wbd/users` and renders:

- `UserManagementTable`;
- selected-user state;
- `RoleAssignmentPanel`;
- role updates through `PATCH /api/wbd/users/{userId}`;
- `invalidateAll()` after role updates.

### `/app/admin/audit-log`

The audit log page loads `GET /api/wbd/audit-log` and renders `AuditLogPanel`.

Rows are mapped through `toStructAuditLogEntry`.

## Shared Server Overview Helper

Cross-session pages use:

`weoracle.online/src/lib/server/wbd/admin-overview.ts`

It provides:

- `loadQuestionOverview`
- `loadEstimateOverview`
- `loadAnalyticsOverview`
- `loadDiscussionOverview`
- `loadReportOverview`

Each function accepts the D1 binding and an optional `userId`. When `userId` is
present, data is scoped to sessions created by that user. When omitted, data is
global and intended for admin views.
