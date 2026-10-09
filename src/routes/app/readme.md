# Routes `/app` In WeOracle

This document describes the authenticated application routes under
`weoracle.online/src/routes/app`.

All routes except `/app/sign-in`, `/app/magic-link`, and `/app/verify` are
protected by `+layout.server.ts`. The layout reads the `wbd_user` cookie
through `getSessionUser`; unauthenticated users are redirected to
`/app/sign-in?next=...`.

`/app/sign-in` shows nothing but a "Sign in" gate by default; clicking it
reveals the admin (email + password) form via the `adminSignIn` action. It
also links to `/app/magic-link` for facilitators/coordinators.
`/app/magic-link` holds the passwordless name+email form (`requestLink`
action) — reached directly from public poll links on the landing page (a
specific poll's "open" CTA), so a facilitator invited into a given session
never has to see the admin gate.

The shared app shell lives in `+layout.svelte`. It renders the left navigation
with `AdminSidebar` from `stylist-svelte`:

- `Sessions` -> `/app`
- `Questions` -> `/app/questions`
- `Experts` -> `/app/experts`
- `Estimates` -> `/app/estimates`
- `Analytics` -> `/app/analytics`
- `Discussions` -> `/app/discussions`
- `Reports` -> `/app/reports`
- `Settings` -> `/app/admin`, visible only for users with role `admin`

The shell footer shows the current user name, theme toggle, language control,
and sign-out form. On `/app`, the header also renders two `ActionSegmentedControl`
filters (status, visibility) wired to `?status=`/`?visibility=` query params.

## Atomic design: template vs. organism pages

Nine of the pages below are built as a `stylist-svelte` **template**
(`$stylist/wbd/component/template/<family>/index.svelte`) — the page's
`+page.svelte` is a thin wrapper: it maps snake_case API rows into the
camelCase `Struct*` shape the template expects (where needed) and forwards
data/callbacks. All markup, styling, and internal composition (organism →
molecule → atom) live inside `stylist-svelte`, not in this repo.

| Menu item | Route | Template |
| --- | --- | --- |
| Sessions | `/app` | `session-overview-page` |
| Questions | `/app/questions` | `question-overview-page` |
| Experts | `/app/experts` | `expert-management-page` |
| Estimates | `/app/estimates` | `estimate-overview-page` |
| Analytics | `/app/analytics` | `analytics-overview-page` |
| Discussions | `/app/discussions` | `discussion-overview-page` |
| Reports | `/app/reports` | `report-overview-page` |
| Settings (users) | `/app/admin` | `user-management-page` |
| Settings (audit log) | `/app/admin/audit-log` | `audit-log-page` |

The remaining pages (`/app/new`, `/app/[id]`, `/app/[id]/analytics`,
`/app/[id]/round`) don't have a template yet — `+page.svelte` composes
`stylist-svelte` **organisms** directly, as described in their own sections
below.

## `/app`

`+page.server.ts` loads sessions through `GET /api/wbd/sessions` (`created_by`
filter for non-admins, unfiltered for admins).

`+page.svelte` filters `data.sessions` client-side by the `?visibility=` /
`?status=` query params (read via `page.url.searchParams`, filters are
rendered by the shell layout) and renders `SessionOverviewPage`
(`$stylist/wbd/component/template/session-overview-page`) with `{ sessions, hasActiveFilter }`.

The template is `SessionOverviewGrid` (organism) built from
`SessionOverviewCard` (molecule, one per session — thumbnail, round/expert/
question meta, status + visibility badges, links to `/app/{sessionId}`) with
an empty state that shows a "no sessions yet" CTA linking to `/app/new`, or a
"no sessions match this filter" message when a filter is active.

## `/app/questions`

The questions page is a per-session question bank (not a cross-session
overview — despite `ManagerOverview.questionOverview` existing, this page
does not call it).

`+page.server.ts` loads the available sessions through `GET /api/wbd/sessions`
(scoped by `created_by` for non-admins), resolves the selected session from
`?session={sessionId}` (falls back to the first session), and — if a session
is selected — loads its questions through `GET /api/wbd/sessions/{id}/questions`.

`+page.svelte` keeps the question-editing state (`localQuestions`,
per-question 400ms-debounced PATCH queue with in-flight/queued coalescing,
optimistic local updates) and renders `QuestionOverviewPage`
(`$stylist/wbd/component/template/question-overview-page`).

The template composes:

- `SessionSelectorField` (molecule) — session picker;
- `SessionMetaChipRow` (molecule) — three compact chips: session status,
  required-question count, total question count (shown only once a session
  is selected);
- `SessionQuestionEditor` (organism) — the actual question list/detail editor;
- `EmptyStatePanel` (organism) — shown instead of the editor when the user
  has no sessions yet, with a "Create session" action linking to `/app/new`.

## `/app/experts`

The experts page is a cross-session expert assignment screen.

`+page.server.ts` loads the available sessions through `GET /api/wbd/sessions`
(scoped by `created_by` for non-admins), resolves the selected session from
`?session={sessionId}`, and — if a session is selected — loads its experts
(with invite tokens) through `GET /api/wbd/sessions/{id}/experts`.

`+page.svelte` keeps session-switching (`goto`) and the invite/remove/resend
`fetch` calls, and renders `ExpertManagementPage`
(`$stylist/wbd/component/template/expert-management-page`).

The template composes:

- `SessionToolbar` (organism, built on `SessionSelectorField` molecule) —
  session picker plus a "Session settings" link to `/app/{sessionId}`;
- `ExpertSummaryStats` (molecule) — total / joined / invited counts;
- `SessionExpertInvitePanel` (organism) — invite form + expert list with
  remove/resend actions;
- `ExpertInviteLinkList` (molecule) — copyable invite links per expert
  (tracks its own "Copied!" feedback state, builds the link from
  `location.origin` client-side);
- `EmptyStatePanel` (organism) for the no-sessions-yet state.

## `/app/estimates`

The estimates page is a cross-session overview of expert answers.

`+page.server.ts` calls `ManagerOverview.estimateOverview(platform.env.DB, userId)`.

`+page.svelte` maps the snake_case rows into `StructWbdEstimateOverviewRow[]`
and renders `EstimateOverviewPage`
(`$stylist/wbd/component/template/estimate-overview-page`).

The template composes:

- `EstimateMetricsSummary` (molecule) — total / submitted / average-confidence
  tiles;
- `EstimateOverviewTable` (organism) — question (links to
  `/app/{sessionId}/round?round={roundNumber}`), session, expert alias/name,
  round, an O/M/P cell (raw numbers plus a `ConfidenceRangeBar` atom when all
  three values are present), and confidence.

## `/app/analytics`

The analytics page is an operational overview across sessions.

`+page.server.ts` calls `ManagerOverview.analyticsOverview(platform.env.DB, userId)`.

`+page.svelte` passes `data.analytics` straight through (already in the
`StructWbdAnalyticsOverview` shape) to `AnalyticsOverviewPage`
(`$stylist/wbd/component/template/analytics-overview-page`), together with
`t()`-localized labels.

The template composes:

- `AnalyticsMetricsSummary` (molecule) — sessions / active / completed /
  questions / answers / discussions tiles;
- `AnalyticsStatusDistributionPanel` (molecule) — session count per lifecycle
  status;
- `AnalyticsConsensusPanel` (molecule) — high/medium/low consensus counts
  plus average confidence.

## `/app/discussions`

The discussions page is a cross-session feed of expert discussion messages.

`+page.server.ts` calls `ManagerOverview.discussionOverview(platform.env.DB, userId)`.

`+page.svelte` maps the snake_case rows into `StructWbdDiscussionOverviewRow[]`
and renders `DiscussionOverviewPage`
(`$stylist/wbd/component/template/discussion-overview-page`), which wraps the
`DiscussionOverviewFeed` organism — one `DiscussionOverviewItem` (molecule)
per message, showing expert alias, session title + round, a link to the
question's round screen, the message body, and the timestamp.

## `/app/reports`

The reports page summarizes final reports and report candidates.

`+page.server.ts` calls `ManagerOverview.reportOverview(platform.env.DB, userId)`,
which returns `{ reports, candidates }` directly (the load function returns
that object as-is, not wrapped).

`+page.svelte` maps both arrays into `StructWbdReportOverviewRow[]` /
`StructWbdReportCandidateRow[]` and renders `ReportOverviewPage`
(`$stylist/wbd/component/template/report-overview-page`), which composes two
organisms:

- `ReportListTable` — generated reports (title, session link, status, format,
  created date);
- `ReportCandidateTable` — sessions eligible for a report (session link,
  status, question count, response count, completed date).

## `/app/new`

The new session page creates a Wideband Delphi session draft.

The page uses `WbdEditSession` (`mode="create"`) from `stylist-svelte` — the same
session settings organism used by `/app/[id]` for editing. On submit, it calls
`POST /api/wbd/sessions` with the title, description, image URL, visibility,
assumptions, and max round count. After successful creation it redirects to
`/app/{created.id}`.

## `/app/[id]`

The session detail page manages one Wideband Delphi session. It renders the same
`WbdEditSession` organism (`mode="edit"`) as `/app/new`, wired to
`PATCH /api/wbd/sessions/{id}`, plus lifecycle management (status, round actions,
reset, delete) below it.

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

`+page.server.ts` loads `GET /api/wbd/users` (empty array for non-admins,
checked via the parent layout's `isAdmin`).

`+page.svelte` keeps `selectedUserId` state and the role-update `fetch`, and
renders `UserManagementPage` (`$stylist/wbd/component/template/user-management-page`)
with `{ users, selectedUserId, onSelectUser, onUpdateUserRole, onAssignRole }`.

The template composes `UserManagementTable` (organism) and, once a user is
selected, `RoleAssignmentPanel` (organism) under an "Assign role" heading.
Role updates go through `PATCH /api/wbd/users/{userId}` followed by
`invalidateAll()`.

### `/app/admin/audit-log`

`+page.server.ts` loads `GET /api/wbd/audit-log`.

`+page.svelte` renders `AuditLogPage`
(`$stylist/wbd/component/template/audit-log-page`) with `{ entries: data.entries }`,
which composes a heading plus the `AuditLogPanel` organism.

## Shared Server Overview Manager

Cross-session pages use:

`weoracle.online/src/lib/server/class/manager/overview/index.ts` — `ManagerOverview`

It provides:

- `questionOverview` — defined, but currently unused (the Questions page
  loads per-session data through `GET /api/wbd/sessions/**` instead, see
  `/app/questions` above);
- `estimateOverview` — used by `/app/estimates`;
- `analyticsOverview` — used by `/app/analytics`;
- `discussionOverview` — used by `/app/discussions`;
- `reportOverview` — used by `/app/reports`.

Each method accepts the D1 binding and an optional `userId`. When `userId` is
present, data is scoped to sessions created by that user. When omitted, data is
global and intended for admin views.
