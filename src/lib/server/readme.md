# `src/lib/server` — `class/manager/<family>` + маппинг D1 → Struct на сервере (реализовано)

История в двух шагах:
1. Вся бизнес-логика из `routes/api/wbd/**/+server.ts` и 8 старых файлов (`auth.ts`, `experts.ts`, `i18n.ts`, `magic-link.ts`, `resend.ts`, `session-cleanup.ts`, `audit.ts`, `admin-overview.ts`) собрана в 14 manager-классов под `src/lib/server/class/manager/**` (без `wbd` в пути — первая версия ошибочно клала `class/manager` внутрь `lib/server/wbd/`, это исправлено).
2. То, что маппило D1-строки в camelCase Struct-форму под нужды `stylist-svelte` (`lib/wbd/types.ts` + `lib/wbd/map.ts`), перестало быть клиентской заботой — **маппинг теперь происходит внутри менеджеров**, и API отдаёт клиенту уже готовую Struct-форму. `lib/wbd/` больше не содержит ни типов, ни мапперов — только два `.svelte`-компонента.

## Почему маппинг переехал на сервер

Раньше `+page.svelte`/`+server.ts` получали сырые D1-строки (`WbdSessionRow`, `WbdQuestionRow`, ...) и сами звали `toStructSession`/`toStructQuestion`/... перед тем, как отдать данные organism-компонентам `stylist-svelte`. Это работало, но размазывало один и тот же маппинг по десятку клиентских файлов. Теперь менеджер сам вызывает `toStructX` перед `return`, и `+server.ts` просто прокидывает результат в `json(...)` — клиентский код получает готовую Struct-форму и никогда не видит `WbdXRow`.

**Жёсткое ограничение, из-за которого это вообще стало возможным одним куском:** `+server.ts`/`+page.server.ts` выполняются только на сервере, поэтому им можно было отдать типы/функции напрямую в менеджеры. А вот `.svelte`-файлы — потенциально клиентский код, SvelteKit не даёт им импортировать что-либо из `$lib/server/**`. Поэтому:
- Сырые D1-типы (`WbdSessionRow` и т.п.) и `to-struct-*`-функции переехали в `lib/server/interface/db/**` / `lib/server/function/transform/**` — их видят только менеджеры и `+server.ts`.
- Клиентские `.svelte`-файлы и `+page.server.ts` типизируют уже замапленные ответы API через `StructWbdX`-типы из `stylist-svelte` (`$stylist/wbd/type/object/*`), а не через что-либо в `$lib/server`.

## Где Struct-форма не подходит — и что сделано вместо неё

Не всё можно было слепо замаппить в общий Struct-тип `stylist-svelte`, потому что он рассчитан на отображение, а не на все серверные нужды:

- **`ManagerExpert.invite` / `resendInvite`** возвращают **сырую** строку (не Struct) — `/public/verify` берёт из неё `expert.token`, чтобы установить cookie публичного эксперта, а Struct-форма эксперта token сознательно не содержит.
- **`ManagerUser.upsertCoordinator`** тоже возвращает сырую строку — её JSON целиком становится содержимым cookie `wbd_user`, которую потом читает `ManagerAuth.getSessionUser` как `WbdUser`.
- **`ManagerExpert.listForSession`** и **`ManagerSnapshot.getRoundView`'s `experts`** возвращают Struct **расширенный** полем `token` — координатор-владелец сессии имеет право копировать инвайт-ссылки (страница `/app/experts` уже показывала токены и до этого рефакторинга).
- **`ManagerSnapshot.getRoundView`'s `answersByQuestion`** возвращает Struct-ответы, расширенные `id`/`roundNumber`/`expertToken` — странице `/app/[id]/round` они нужны для `RationaleDigest` (нужен `id`, `roundNumber`) и для сопоставления «кто из экспертов уже ответил» (`expertToken` против `expert.token`).
- **`ManagerSession.getDetail`** возвращает Struct-сессию, расширенную `createdBy` — `/app/[id]/analytics` проверяет им, имеет ли текущий пользователь право смотреть аналитику, а в общем Struct-типе поля владельца нет.

Эти «расширенные» формы не оформлены как отдельные именованные типы (в `stylist-svelte` для них и так нет экспортируемых `StructWbdExpert`/`StructWbdSnapshot` — только анонимные inline-типы внутри каждого `Recipe*`), поэтому на клиенте они описаны маленькими локальными интерфейсами прямо в потребляющем `+page.server.ts` (`ExpertWithToken`, `RoundAnswer`, `Snapshot`, `SessionDetail`, `RoundView` и т.п.) — без переиспользуемого файла, чтобы не плодить инфраструктуру ради 3-4 мест использования.

## Реализованное дерево `lib/server/`

```
weoracle.online/src/lib/server/
├── class/manager/
│   ├── session/index.ts        # ManagerSession — list, create, getDetail, update, advanceRound, reset, delete
│   ├── question/index.ts       # ManagerQuestion — listForSession, create, update, delete
│   ├── answer/index.ts         # ManagerAnswer — listForQuestion, submit
│   ├── discussion/index.ts     # ManagerDiscussion — listForQuestion(...,ownToken?), post
│   ├── questionnaire/index.ts  # ManagerQuestionnaire — фасад над ManagerAnswer/ManagerDiscussion для /invite/[token] и /public/band/[ulid] (load + actions)
│   ├── expert/index.ts         # ManagerExpert — listForSession, invite, remove, resendInvite, resolveByToken, publicCookieName
│   ├── snapshot/index.ts       # ManagerSnapshot — getRoundView, get, compute, listAll
│   ├── user/index.ts           # ManagerUser — list, upsertCoordinator, updateRole
│   ├── audit-log/index.ts      # ManagerAuditLog — list, record
│   ├── application/index.ts    # ManagerApplication — create
│   ├── auth/index.ts           # ManagerAuth — getSessionUser, requireRole, requireSessionOwner, requireQuestionOwner, isExpertOnQuestion, requireQuestionAccess
│   ├── magic-link/index.ts     # ManagerMagicLink — create, consume, emailHtml, emailText
│   ├── email/index.ts          # ManagerEmail — send
│   ├── translation/index.ts    # ManagerTranslation — isSupported, detectFromHeader, load
│   └── overview/index.ts       # ManagerOverview — questionOverview, estimateOverview, discussionOverview, reportOverview, analyticsOverview
│
├── interface/db/                          # сырые D1-строки + серверные структурные типы — видны только менеджерам
│   ├── d1-like/index.ts                   # D1Like
│   ├── round-stats/index.ts               # WbdRoundStats
│   ├── session/index.ts                   # WbdSessionRow
│   ├── question/index.ts                  # WbdQuestionRow
│   ├── expert/index.ts                    # WbdExpertRow
│   ├── answer/index.ts                    # WbdAnswerRow
│   ├── snapshot/index.ts                  # WbdSnapshotRow
│   ├── discussion-message/index.ts        # WbdDiscussionMessageRow
│   ├── round/index.ts                     # WbdRoundView (импортирует пять типов выше)
│   ├── user/index.ts                      # WbdUser — объединяет бывшие WbdUser (cookie) и WbdUserRow (D1), created_at теперь опционален
│   └── audit-log/index.ts                 # WbdAuditLogRow
│
├── function/generate/
│   ├── id/index.ts                        # generateId (заменил и бывший generateToken — были идентичны)
│   └── ulid/index.ts                      # generateUlid
│
├── function/time/
│   └── now-iso/index.ts                   # nowIso
│
├── function/crypto/
│   └── constant-time-equal-strings/index.ts   # используется только в app/sign-in, вне менеджеров
│
├── function/transform/
│   ├── map-d1-error/index.ts
│   ├── compute-round-stats/index.ts       # + приватные quantile/computeBooleanConsensus внутри
│   ├── to-struct-session/index.ts
│   ├── to-struct-question/index.ts
│   ├── to-struct-expert/index.ts
│   ├── to-struct-answer/index.ts
│   ├── to-struct-snapshot/index.ts
│   ├── to-struct-user/index.ts
│   ├── to-struct-audit-log-entry/index.ts # + приватный ENTITY_TYPE_MAP внутри
│   └── to-struct-discussion-message/index.ts  # принимает ownToken? для вычисления isOwn
│
└── const/value/
    └── experts-by-session-sql/index.ts
```

`lib/wbd/` (тот композиционный `expert-round-experience.svelte`, что упоминается ниже) с тех пор удалён целиком: экран раунда теперь — template `WbdQuestionnairePage` из `stylist-svelte`, рендерящийся напрямую из `+page.svelte` `/invite/[token]`/`/public/band/[ulid]`, а весь fetch/post — через `ManagerQuestionnaire` (выше) из `+page.server.ts` этих же роутов (`load` + `actions`), а не из `.svelte`-компонента.

Импорт менеджера отовсюду: `import { ManagerX } from '$lib/server/class/manager/x'`. Импорт замапленного типа на клиенте: `import type { StructWbdSession } from '$stylist/wbd/type/object/session'`.

## Пример: как это меняет `+server.ts`

`routes/api/wbd/sessions/[id]/reset/+server.ts` — не изменился внешне (маппинг спрятан внутри менеджера):

```ts
import { ManagerAuth } from '$lib/server/class/manager/auth';
import { ManagerSession } from '$lib/server/class/manager/session';

export const POST: RequestHandler = async ({ params, cookies, platform }) => {
	const db = platform!.env.DB;
	await ManagerAuth.requireSessionOwner(cookies, db, params.id);
	const session = await ManagerSession.reset(db, params.id); // уже StructWbdSession
	return json(session);
};
```

## Пример: как это упрощает клиента

`lib/wbd/expert-round-experience.svelte` (с тех пор удалён, см. выше) раньше принимал сырые `WbdSessionRow`/`WbdQuestionRow[]`/`WbdAnswerRow[]` и сам звал `toStructQuestion`/`toStructAnswer`/`toStructDiscussionMessage` в трёх местах. Пропсы стали типизированы как `StructWbdSession`/`StructWbdQuestion[]`/`StructWbdExpertAnswer[]` напрямую — этот шаг и остался: `+page.server.ts` `/invite/[token]`/`/public/band/[ulid]` возвращают Struct-форму как есть, `+page.svelte` просто передаёт `data.*` в `WbdQuestionnairePage`, ни одного вызова `toStructX` на клиенте.

Похожая чистка прошла в `app/[id]/round/+page.svelte`: раньше страница вручную конвертировала `snapshot.consensus_level`/`.count_responses`/`.min_value`/`.max_value` в camelCase и вручную пересобирала объекты для `RoundSnapshotBoard`. Теперь `snapshotByQuestion`/`answersByQuestion` уже в Struct-форме, и `RoundSnapshotBoard` получает `{snapshots}` напрямую без промежуточного `.map(...)`.

## Правила, применённые при переносе логики из `+server.ts` в менеджеры

- Разбор `Request`/`URL` (тело, query-параметры) и базовая проверка формы запроса остаются в `+server.ts` — менеджеры не знают о `Request`.
- Доменные проверки (404, допустимые значения статуса/типа, нормализация `image_url`/`is_public`) и Struct-маппинг — внутри менеджеров, вместе с SQL.
- Запись аудит-лога (`ManagerAuditLog.record`) осталась в `+server.ts`/`+page.server.ts`, а не внутри менеджеров — одна и та же операция (например, `ManagerExpert.invite`) вызывается из разных мест с разным `action` (`expert_invited` из `/api/wbd/sessions/[id]/experts`, `expert_self_joined` из `/public/verify`), и это решает вызывающий код.
- Дублирующаяся ручная проверка прав в `sessions/[id]/snapshots/+server.ts` заменена на прямой вызов `ManagerAuth.requireSessionOwner`.

## Что сделано

- 14 manager-классов под `class/manager/**`, все методы, чей результат уходит в UI, мапят D1 → Struct перед `return`.
- Всё, что не мапится «в лоб» (`invite`/`resendInvite`/`upsertCoordinator` — сырые; `listForSession`/`getRoundView`'s experts — Struct+`token`; `getRoundView`'s answers — Struct+`id`/`roundNumber`/`expertToken`; `getDetail` — Struct+`createdBy`), задокументировано и обосновано выше.
- `lib/wbd/types.ts`, `lib/wbd/map.ts`, `lib/server/wbd/{db,crypto,stats}.ts` разобраны по `interface/db/**` / `function/**` / `const/value/**` и удалены; `lib/server/wbd/` и `lib/wbd/type|function/` как папки больше не существуют.
- Обновлены все ~40 потребителей (менеджеры, все 19 `+server.ts`, все `+page.server.ts`/`+page.svelte`, `expert-round-experience.svelte`), `svelte-check` — 0 ошибок.

## Твои правки

<!-- пиши сюда -->
