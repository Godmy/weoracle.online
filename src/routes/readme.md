# `src/routes`

Этот документ описывает все роуты weoracle.online: что рендерит каждая страница, какую серверную логику выполняет, и — для страниц — какие компоненты `stylist-svelte` она использует и к какому архитектурному уровню (atom/molecule/organism/template) эти компоненты относятся.

Авторизованная область `/app/**` (сессии, вопросы, эксперты, аналитика, админка) кратко описана ниже — какой template/organism закрывает какую страницу меню; подробности по загрузке данных и действиям на каждой странице — в [`app/readme.md`](app/readme.md). Все остальные роуты и весь `api/wbd/**` описаны здесь полностью.

## Как устроен UI: atomic design в `stylist-svelte`

Все содержательные компоненты интерфейса weoracle.online не пишутся в этом пакете — они живут в `stylist-svelte/src/lib/wbd/**` и импортируются оттуда. Путь компонента в `stylist-svelte` кодирует его архитектурный уровень: `src/lib/<domain>/<cluster>/<joint>/<family>`.

- **domain** — предметная область (`wbd`, `theme`, `landing`, `image`, `svg`, …). Почти весь функционал weoracle.online держится на домене `wbd`.
- **cluster** — тип по языковой природе: `component`, `interface`, `type`, `const`, `function`, `data`, `class`.
- **joint** — для `component` это уровень atomic design: **atom → molecule → organism → template**, зависимости строго однонаправленные (template может использовать organism/molecule/atom, но не наоборот). Для `interface` это DSIAP: `behavior`/`slot` → `recipe` (recipe — типовой контракт пропсов конкретного компонента, собранный из поведений и слотов).
- **family** — конкретная сущность внутри joint, например `session-overview-page`, `admin-sidebar`, `wbd-landing-page`.

Практически для weoracle.online это означает:

- **atom** — самые мелкие визуальные единицы (`confidence-range-bar`, `estimator-badge`, `round-status-badge`, `discussion-alias-badge`, `estimate-three-point-input`, `pert-result-chip`).
- **molecule** — небольшие композиции атомов с собственным поведением (`estimate-input-row`, `participant-roster-list`, `round-summary-card`, `discussion-message-composer`/`-thread`, `disagreement-prompt-card`, `wbs-task-row`, `discussion-round-filter`, `session-selector-field`, `session-meta-chip-row`, `session-overview-card`, `discussion-overview-item`, `expert-invite-link-list`, `expert-summary-stats`, `estimate-metrics-summary`, `analytics-metrics-summary`/`-status-distribution-panel`/`-consensus-panel`).
- **organism** — самостоятельные функциональные блоки страницы, куда приложение передаёт реальные данные и обработчики (`wbd-edit-session`, `session-detail-layout`, `admin-sidebar`, `user-management-table`, `role-assignment-panel`, `audit-log-panel`, `permission-denied-panel`, `empty-state-panel`, `expert-questionnaire`, `consensus-review-board`, `round-snapshot-board`, `final-report-builder`, `export-results-panel`, `session-toolbar`, `session-overview-grid`, `discussion-overview-feed`, `estimate-overview-table`, `report-list-table`/`report-candidate-table` и ещё порядка 30 других). Основной уровень для страниц, у которых пока нет своего template (`/app/[id]`, `/app/[id]/round`, `/app/[id]/analytics`, `/app/new`), и строительный материал для template-ов остальных страниц.
- **template** — целая страница-каркас, собранная из organism/molecule/atom с плейсхолдер-пропами, без реальных данных и без серверной логики; приложение импортирует template и просто передаёт в него данные. В домене `wbd` их одиннадцать: `wbd-landing-page` (публичный лендинг) и `wbd-questionnaire-page` (экран прохождения раунда: desktop-грид с навигатором вопросов и mobile sticky-лента, композиция `ExpertSessionBriefing`/`ExpertQuestionNavigator`/`ExpertQuestionnaire`/`QuestionDiscussionPanel`) — а также девять template-ов, каждый из которых закрывает ровно одну страницу авторизованного меню `/app/**` (Sessions/Questions/Experts/Estimates/Analytics/Discussions/Reports и два экрана Settings): `session-overview-page`, `question-overview-page`, `expert-management-page`, `estimate-overview-page`, `analytics-overview-page`, `discussion-overview-page`, `report-overview-page`, `user-management-page`, `audit-log-page`. Для этих девяти `+page.svelte` — тонкая обёртка: маппинг snake_case-строк из API в camelCase Struct-формы (где нужно) плюс проброс данных/колбэков в template; вся разметка и стили живут внутри `stylist-svelte`.

`stylist-svelte` — не часть этого проекта, а отдельный git-submodule (`packages/stylist-svelte` → `github.com/Godmy/stylist-svelte`), независимо версионируемая и публикуемая библиотека (`svelte-package`, `publint`, `prepublishOnly`). Формально его можно подключать двумя путями: через публичный API пакета (`import { X } from 'stylist-svelte'`, резолвится на собранный `dist/index.js`) или через alias `$stylist` (настроен в `vite.config.ts`/`svelte.config.js` на `../stylist-svelte/src/lib`, указывает прямо на исходники, минуя `dist`).

**В этом приложении используется только `$stylist`** — каждый компонент, тип и функция домена `wbd` (а также `ThemeProvider`/`ThemeModeToggle` из домена `theme`, `ActionSegmentedControl` из `control`, `Flag` из `svg`, `Tooltip` из `animation`) импортируются напрямую по полному пути: `import ComponentName from '$stylist/<domain>/component/<joint>/<family>/index.svelte'`, типы/функции — `import type { X } from '$stylist/<domain>/type/object/<family>'` / `import { fn } from '$stylist/<domain>/function/transform/<family>'` (без расширения, резолвится на `index.ts`). Так подключены, например, `AdminSidebar` (`$stylist/wbd/component/organism/admin-sidebar/index.svelte`), `WbdEditSession`, `ExpertSessionBriefing`, `SessionQuestionEditor`, все organism-и раунда/аналитики/админки, `WbdLandingPage` (template) и т.д. Причина — обязательная Development Server Policy из `packages/AGENTS.md`: hot-reload-связка рассчитана на потребление `stylist-svelte/src/**`, пересборка `dist` во время совместной работы над обоими пакетами запрещена (может рассинхронизировать запущенный dev-сервер). Это даёт мгновенный hot-reload на правки в `stylist-svelte`, но означает, что приложение зависит от внутренней структуры пакета (путей family-папок), а не от его публикуемого `exports`-контракта.

Каждый organism/template получает данные через свой `interface/recipe/<family>`-контракт; бизнес-состояние компонента (если есть) вынесено в соседний `state.svelte.ts` внутри самого `stylist-svelte`, а не в weoracle.online. Превращение строк D1 в ожидаемую recipe-форму происходит на сервере, внутри `lib/server/class/manager/**` (см. [`../lib/readme.md`](../lib/readme.md) и [`../lib/server/readme.md`](../lib/server/readme.md)) — страницы получают из API уже готовую Struct-форму, а не сырые строки.

## Карта роутов

```
/                                    — публичный лендинг
/application                         — форма заявки на пилот/внедрение
/wbd                                 — витрина estimation-компонентов (демо, не связана с БД)
/invite/[token]                      — приглашение эксперта по прямой ссылке
/public/invite/[ulid]                — публичное приглашение (email → magic link)
/public/verify                       — обработка magic-link для публичного участия
/public/band/[ulid]                  — публичное прохождение раунда
/app/**                              — авторизованная часть (см. app/readme.md)
/api/wbd/**                          — JSON API поверх D1
```

## Корневой layout

`+layout.server.ts` определяет язык (`lang`): cookie `wbd_lang`, иначе `Accept-Language`; грузит словарь `wbd_translations` под этот язык через `ManagerTranslation` (`$lib/server/class/manager/translation`) и отдаёт `{lang, translations}` в `page.data` для всего дерева роутов, включая `t()` из `$lib/i18n/function/translate`.

`+layout.svelte` — минимальный: импортирует `../app.css`, оборачивает всё дерево в `ThemeProvider` (`stylist-svelte`, domain `theme`, **atom**) с `themeScheme="weoracle"`, синхронизирует `document.documentElement.lang`. Тема (light/dark) читается из `localStorage` инлайн-скриптом в `app.html` до гидрации, чтобы избежать мигания.

## `/` — публичный лендинг

`+page.svelte` рендерит один компонент: `WbdLandingPage` из `$stylist/wbd/component/template/wbd-landing-page/index.svelte` — domain `wbd`, **template**. Он собирает hero, определение метода, историческую справку, пять кейсов, секцию публичных опросов, CTA-блок заявки, workflow из 5 шагов и итоговый результат — все organism-компоненты этой сборки живут внутри `stylist-svelte` и здесь не видны напрямую.

Приложение передаёт в template:
- `content` — весь текст для текущего языка из `$lib/i18n/const/object/landing` (`ObjectLanding[currentLang]`, тип `RecipeLandingPage`);
- набор `*ImageSrc`/`*ImageAlt` для hero/definition/workflow/intro/result (файлы из `static/landing/` и `static/gen/`), включая alt-тексты, локализованные прямо в `+page.svelte` (объект `imageAlt`, отдельно от `ObjectLanding`);
- `publicPolls` — реальные публичные сессии, загруженные `+page.server.ts` (см. ниже), с фолбэком на статичные примеры из `content.publicPolls`/локального `fallbackPublicPolls`, если в БД нет ни одной публичной сессии;
- snippets `brand` (рендерит `BrandLogo` из `$lib/brand/component/molecule/logo/index.svelte`) и `languageControl` (рендерит `LanguageControl` из `$lib/i18n/component/molecule/language/index.svelte`) — единственные два места, где в лендинг подставляются локальные компоненты weoracle.online, а не `stylist-svelte`.

`+page.server.ts` — читает `SELECT ... FROM wbd_sessions WHERE is_public = 1 ORDER BY created_at DESC LIMIT 6` (с подзапросом числа вопросов), маппит в форму `PublicPoll` (заголовок/описание/картинка/ссылка `/public/invite/{id}`/локализованные «N вопросов» и статус вида «раунд 1 из 3»/«сбор экспертов»). Для трёх конкретных известных сессий (захардкоженные UUID) есть локализованный текст-заглушка на случай пустого `description` в БД. При отсутствии D1-биндинга (`platform.env.DB`) возвращает пустой список — рендер не падает, срабатывает клиентский фолбэк.

## `/application` — форма заявки

`+page.svelte`, без `+page.server.ts` — полностью клиентская страница со своей вёрсткой (не использует ни одного компонента `stylist-svelte`; локальные CSS-переменные с light/dark веткой через `:global(html.light)`). Импортирует только `BrandLogo` и `LanguageControl` из `$lib`. Текст — тот же `ObjectLanding[currentLang].applicationCta`, что и в блоке заявки на лендинге, с английским фолбэком на отсутствующие поля.

Форма — обычный `<form method="POST" action="/api/wbd/applications">` (не SvelteKit form actions), с radio-переключателем типа заявки (`private-session` / `public-poll` / `enterprise-setup`, синхронизирован с `?type=` в URL) и полями name/email/company/message. После сабмита сервер редиректит обратно сюда с `?submitted=1&type=...`, и страница показывает экран благодарности.

## `/wbd` — витрина estimation-компонентов

`+page.svelte`, без `+page.server.ts` — самостоятельная демо-страница с захардкоженными seed-данными, **не связана с реальными сессиями из D1**. Показывает синтетический пример «Q3 Roadmap Estimation»: дерево WBS из 5 эпиков / 22 задач, три вымышленных участника с детерминированно сгенерированными (`seededEstimate`) трёхточечными оценками.

Использует напрямую (все — из `stylist-svelte`, domain `wbd`): `SessionHeader`, `ParticipantRosterList`, `RoundCollectionPanel`, `FacilitatorControlPanel`, `RoundSummaryTable`, `EstimateRangeChart`, `ConvergenceChart`, `DiscussionThread`, `WbsTree`, `FinalEstimateReport` (organism/molecule-уровни), плюс чистые функции `calculateWbdPert`/`calculateWbdSpread` (`function/transform/**`) и типы `StructWbdTask`/`StructWbdEstimate`/`StructWbdRoundSummary`/`StructWbdPertResult`. Локальная функция `rollupFor()` рекурсивно агрегирует PERT-результаты по дереву WBS снизу вверх.

Смысловое отличие от `/app/[id]/round`: там прогоняются реальные экспертные прогнозы величины (D1, API, консенсус по Wideband Delphi), здесь — витрина другой предметной области того же домена `wbd` в `stylist-svelte`: оценка трудозатрат задач (WBS-эстимация), с полностью статичными данными, без сервера.

## `/invite/[token]` — приглашение эксперта по прямой ссылке

Для экспертов, добавленных координатором вручную в приватную (не публичную) сессию — в отличие от `/public/invite/[ulid]`, здесь нет шага email/magic-link: токен уже выдан напрямую.

Эта страница и `/public/band/[ulid]` — единственное место, где weoracle.online полностью на server-side load + form actions вместо клиентского `fetch()` к `/api/wbd/**`: никакого промежуточного локального компонента с собственным `fetch`, вся логика — в `+page.server.ts` через `ManagerQuestionnaire` (`$lib/server/class/manager/questionnaire`, фасад над `ManagerAnswer`/`ManagerDiscussion`), а `+page.svelte` рендерит template `WbdQuestionnairePage` (`$stylist/wbd/component/template/wbd-questionnaire-page`) напрямую.

`+page.server.ts`:
- `load` — вызывает `ManagerExpert.resolveByToken(db, params.token)` напрямую (без внутреннего HTTP-запроса к `/api/wbd/experts/{token}`; 404 → `error(404, 'Invalid invite token')` внутри менеджера); читает выбранные `?question=`/`?round=` из `url.searchParams` (по умолчанию — первый вопрос и `session.currentRound`); догружает `discussionMessages` для этой пары через `ManagerQuestionnaire.loadDiscussion`; отдаёт `{token, expert, session, questions, answers, currentQuestionId, discussionRound, discussionMessages}`.
- `actions.submitAnswer`/`actions.submitMessage` — читают `FormData`, вызывают `ManagerQuestionnaire.submitAnswer`/`.submitDiscussionMessage` с `expert_token = params.token` (токен берётся из URL, не из тела формы).

`+page.svelte` — три состояния, переключаемые локально:
1. `declined` — эксперт отказался от участия (сообщение, без формы);
2. `session.status === 'draft'` — сессия ещё не запущена координатором: `ExpertSessionBriefing` (`stylist-svelte`, organism) + текст ожидания;
3. иначе, до принятия приглашения — `ExpertInviteLanding` (organism, экран принять/отклонить); факт принятия кешируется в `localStorage` (`wbd-invite-accepted-{token}`), чтобы не спрашивать повторно при возврате на страницу;
4. после принятия — `WbdQuestionnairePage` (template, `stylist-svelte`) с сессией/вопросами/ответами/обсуждением — основной экран прохождения раунда. Выбор вопроса/раунда обсуждения (`onSelectQuestion`/`onSelectDiscussionRound`) обновляет `?question=`/`?round=` через `goto()` (мягкая клиентская навигация, перезапускающая `load`, без полной перезагрузки страницы); отправка ответа/сообщения (`onSubmitAnswer`/`onSubmitMessage`) вручную постит `FormData` на `?/submitAnswer`/`?/submitMessage` (тот же паттерн, что использует `use:enhance` под капотом — `deserialize()` из `$app/forms` + `invalidateAll()` при успехе), поскольку organism-и template отдают колбэки, а не голый `<form>`.

## `/public/invite/[ulid]` — публичное приглашение

Точка входа для того, кто хочет присоединиться к публичной сессии (`is_public = 1`) со страницы `/{id}` лендинга.

`+page.server.ts`:
- `load` — проверяет `wbd_sessions WHERE id=?1 AND is_public=1` (404 иначе); если у пользователя уже есть cookie `wbd_public_expert_{ulid}` (уже участвует) — редирект на `/public/band/{ulid}`;
- `actions.join` — form action, принимает `email`+`name` (400 через `fail`, если пусто); создаёт magic-link токен в KV (`createMagicLinkToken`, payload включает `sessionId`); формирует ссылку `{origin}/public/verify?token=...`; отправляет письмо через Resend (без `RESEND_API_KEY` — 500; ошибка отправки — `fail(502, ...)`); возвращает `{sent: true, email}`.

`+page.svelte` — публичная карточка опроса: изображение сессии + `ExpertSessionBriefing` (`stylist-svelte`, organism) с заголовком/описанием/допущениями/раундом/числом вопросов. Три состояния: `status === 'draft'` (текст ожидания), `form?.sent` (экран «проверьте почту» — текст собирается через `t('signIn.check.body').split('{email}')` с ручной интерполяцией вместо `{@html}`, чтобы email пользователя не мог стать XSS-вектором), иначе — форма join (name+email) на `?/join`. Локальная вёрстка, из `stylist-svelte` использует только `ExpertSessionBriefing`.

## `/public/verify` — обработка magic-link

`+page.server.ts` — чисто серверный редирект-эндпоинт: `consumeMagicLinkToken` из KV (одноразово); 400 при невалидном/просроченном токене или отсутствии `sessionId` в payload; проверяет, что сессия всё ещё публична; вызывает `createSessionExpert` (get-or-create эксперта по email/name в этой сессии), пишет `recordAuditEvent('expert_self_joined', ...)`; ставит httpOnly cookie `wbd_public_expert_{sessionId}` (30 дней, `path: '/public'`) со свежим токеном; 303-редирект на `/public/band/{sessionId}`.

`+page.svelte` — только текст «Joining the poll…»: `load()` либо кидает ошибку, либо всегда редиректит на успех, так что эта разметка видна лишь на долю секунды между навигацией и завершением редиректа.

## `/public/band/[ulid]` — публичное прохождение раунда

`+page.server.ts` — проверяет публичность сессии (как в `/public/invite`); если cookie `wbd_public_expert_{ulid}` отсутствует — редирект на `/public/invite/{ulid}` (участник ещё не идентифицирован); иначе резолвит токен из cookie через `ManagerExpert.resolveByToken` напрямую (404 внутри менеджера → редирект обратно на invite-страницу); дальше — тот же `?question=`/`?round=` + `ManagerQuestionnaire.loadDiscussion` load-паттерн, что на `/invite/[token]`. `actions.submitAnswer`/`actions.submitMessage` берут `expert_token` из той же cookie (не из формы).

`+page.svelte` — минимальна: сразу рендерит `WbdQuestionnairePage` (тот же template, что и на `/invite/[token]`, с теми же колбэками через `goto`/form actions) без промежуточных экранов принятия — публичный участник уже прошёл идентификацию на предыдущем шаге.

## `/app/**` — авторизованная область

Детально по каждой странице — что грузит `+page.server.ts` и какие действия доступны — описано в [`app/readme.md`](app/readme.md) (на момент написания этот документ ещё не обновлён под структуру ниже — актуальны только сами страницы и `stylist-svelte`, а не его текст). Структура шелла — `AdminSidebar` (organism) в `app/+layout.svelte`. Список разделов: `Sessions`, `Questions`, `Experts`, `Estimates`, `Analytics`, `Discussions`, `Reports`, `Settings`.

Девять из них рендерятся через собственный template (`+page.svelte` только маппит API-ответ в Struct-форму и пробрасывает данные/колбэки, вся сборка — внутри `stylist-svelte`):

| Раздел меню | Роут(ы) | Template |
| --- | --- | --- |
| Sessions | `/app` | `session-overview-page` |
| Questions | `/app/questions` | `question-overview-page` |
| Experts | `/app/experts` | `expert-management-page` |
| Estimates | `/app/estimates` | `estimate-overview-page` |
| Analytics | `/app/analytics` | `analytics-overview-page` |
| Discussions | `/app/discussions` | `discussion-overview-page` |
| Reports | `/app/reports` | `report-overview-page` |
| Settings | `/app/admin` | `user-management-page` |
| Settings | `/app/admin/audit-log` | `audit-log-page` |

Остальные страницы раздела — `/app/[id]` (детали и редактирование сессии), `/app/[id]/round` (экран раунда для координатора), `/app/[id]/analytics` (аналитика одной сессии), `/app/new` (создание сессии) — template ещё не выделен, `+page.svelte` собирает их напрямую из organism-ов (`WbdEditSession`, `SessionDetailLayout`, `ConsensusReviewBoard`, `DisagreementPromptCard`, `ConfidenceDistributionChart`, `ResponseDistributionChart`, `RationaleDigest`, `DiscussionThread`, `QuestionConsensusMatrix`, `MedianTrendChart`, `RoundComparisonPanel`, `PermissionDeniedPanel` и др.).

## `/api/wbd/**` — JSON API

Все эндпоинты — файлы `+server.ts`, тонкие адаптеры над manager-классами из `$lib/server/class/manager/**` (`ManagerSession`, `ManagerQuestion`, `ManagerAnswer`, `ManagerDiscussion`, `ManagerExpert`, `ManagerSnapshot`, `ManagerUser`, `ManagerAuditLog`, `ManagerApplication`), которые и работают напрямую с D1 через `platform.env.DB`, без промежуточного ORM — SQL, валидация и маппинг D1 → Struct-форма для `stylist-svelte` живут внутри них, а не в `+server.ts`. Авторизация — через `ManagerAuth` (`$lib/server/class/manager/auth`: `requireRole`, `requireSessionOwner`, `requireQuestionOwner`, `requireQuestionAccess`); мутации сопровождаются записью в `wbd_audit_log` через `ManagerAuditLog.record` (см. [`../lib/readme.md`](../lib/readme.md) и [`../lib/server/readme.md`](../lib/server/readme.md)).

### Сессии

- **`sessions` `GET`/`POST`** — `requireRole(['coordinator','admin'])`. `GET`: список сессий с подзапросами `expert_count`/`question_count`/`response_count` (ответы текущего раунда); координаторы всегда видят только свои (`created_by` из query игнорируется), админы могут передать `?created_by=` или получить все. `POST`: создаёт сессию, `created_by` всегда берётся из сессии актора (не из тела запроса — защита от подмены), нормализует `image_url` (абсолютный `http(s)` или app-relative путь, ≤2048 символов) и `is_public` (0/1), `max_rounds` по умолчанию 3; аудит `session_created`.
- **`sessions/[id]` `GET`/`PATCH`/`POST`/`DELETE`** — все под `requireSessionOwner`. `GET`: сессия + вопросы + эксперты (`EXPERTS_BY_SESSION_SQL`) одним ответом. `PATCH`: белый список полей (title, description, image_url, is_public, max_rounds, assumptions, status, current_round, started_at, completed_at) с валидацией; аудит `session_updated`. `POST` (без тела) — продвижение раунда: `current_round + 1`; если превышает `max_rounds` → `status='completed'` + `completed_at`; иначе `status = round_N` (N ≤ 3) либо `active`; `started_at` проставляется один раз через `COALESCE`; аудит `round_advanced` либо `session_completed`. `DELETE`: каскадное удаление через `deleteSessionTree`; аудит `session_deleted`.
- **`sessions/[id]/reset` `POST`** — `requireSessionOwner`. Вызывает `deleteSessionProgressData` (чистит ответы/обсуждения/снапшоты/настройки раундов/отчёты, но не саму сессию/вопросы/экспертов) и сбрасывает сессию в `status='draft', current_round=0, started_at=NULL, completed_at=NULL`; аудит `session_reset`.
- **`sessions/[id]/questions` `GET`/`POST`** — `requireSessionOwner`. `GET`: вопросы по `order_index`. `POST`: обязательны `text`+`type` (numeric/percentage/boolean), опционально category/unit/min_value/max_value/required (default `true`); `order_index = MAX(order_index)+1`.
- **`sessions/[id]/experts` `GET`/`POST`** — `requireSessionOwner`. `GET`: список экспертов сессии. `POST`: обязателен `email`; вызывает `createSessionExpert`; аудит `expert_invited`.
- **`sessions/[id]/experts/[expertId]` `DELETE`/`POST`** — `requireSessionOwner`. `DELETE`: удаляет эксперта из сессии; аудит `expert_removed`. `POST` (resend) — перегенерирует `token` эксперта (старая ссылка перестаёт работать).
- **`sessions/[id]/round-view` `GET`** — `requireSessionOwner`, обязателен `?round=`. «One-shot read model» (комментарий в коде — сознательно избегает N+1): параллельно грузит session, questions, experts, answers и snapshots за раунд, группирует answers/snapshots по `question_id`. Отдаёт ровно то, что рендерит `/app/[id]/round`.
- **`sessions/[id]/snapshot` `GET`/`POST`** — `requireSessionOwner`. `GET`: сохранённые снапшоты по `?round=`. `POST`: обязателен `round_number` в теле — считает статистику (`computeRoundStats`) по всем вопросам сессии на основе `realistic`-значений ответов раунда, апсертит в `wbd_round_snapshots`. Это шаг «завершить раунд и посчитать консенсус».
- **`sessions/[id]/snapshots` `GET`** — `requireRole(['coordinator','admin'])` + ручная проверка владения сессией для не-админов (403 иначе). В отличие от `.../snapshot` — история снапшотов по всем раундам сессии сразу, используется на `/app/[id]/analytics`.

### Вопросы, ответы, обсуждение

- **`questions/[id]` `PATCH`/`DELETE`** — `requireQuestionOwner`. `PATCH`: белый список патчибл-колонок (text, category, type, unit, min_value, max_value, required), валидация `type`. `DELETE`: удаление по id.
- **`questions/[id]/answers` `GET`/`POST`** — `GET`: обязателен `?round=`, `requireQuestionAccess` (владелец сессии ИЛИ эксперт по `?expert_token=`). `POST`: без cookie-авторизации — проверяет `isExpertOnQuestion` по `expert_token` (403 при несовпадении); апсертит ответ (`ON CONFLICT(question_id, round_number, expert_token) DO UPDATE`, сохраняя исходный `submitted_at` при повторной отправке). Ту же логику (`ManagerAnswer.submit`) вызывает и `ManagerQuestionnaire.submitAnswer` из form action `/invite/[token]`/`/public/band/[ulid]` — этот REST-эндпоинт остаётся общим JSON API, но с этих двух страниц больше не вызывается через `fetch`.
- **`questions/[id]/discussion` `GET`/`POST`** — `GET`: обязателен `?round=`, `requireQuestionAccess`; используется координаторским `/app/[id]/round`. `POST`: без cookie-авторизации — резолвит alias эксперта по `expert_token`+`question.id` через join (403, если токен не относится к вопросу — alias никогда не доверяется клиенту напрямую); вставляет сообщение с опциональным `parent_id` (треды). Та же логика (`ManagerDiscussion.listForQuestion`/`.post`) переиспользована в `ManagerQuestionnaire.loadDiscussion`/`.submitDiscussionMessage`, которые вызывают `load`/`actions.submitMessage` на `/invite/[token]` и `/public/band/[ulid]` — эти две страницы больше не ходят сюда через `fetch`.

### Пользователи и админка

- **`users` `GET`/`POST`** — `GET`: только `admin`, список пользователей. `POST`: **без cookie-авторизации по дизайну** — это серверная точка входа magic-link-логина координатора (вызывается из `/app/verify`); get-or-create по email, роль всегда жёстко `coordinator` на сервере (комментарий в коде: разрешить клиенту передавать роль — значит разрешить самозарегистрироваться админом).
- **`users/[id]` `PATCH`** — только `admin`. Меняет `role` (coordinator/expert/admin); аудит `role_changed` (from/to/email в metadata).
- **`audit-log` `GET`** — только `admin`. Опциональный `?sessionId=`; `LEFT JOIN wbd_users` для имени/email актора; сортировка по `created_at DESC`, лимит 200.

### Публичные и вспомогательные

- **`experts/[token]` `GET`** — без cookie-авторизации (сам токен — ключ доступа). Резолвит invite-токен: находит эксперта по `token` (404 иначе), при первом визите проставляет `joined_at`; параллельно грузит сессию, вопросы (по `order_index`) и ответы эксперта за текущий раунд. Основной read-эндпоинт для флоу `/invite/[token]` и `/public/band/[ulid]`.
- **`applications` `POST`** — без авторизации. Принимает `FormData` формы `/application` (requestType, name, email, company, message; 400 при отсутствии обязательных); при настроенных `RESEND_API_KEY`+`CONTACT_EMAIL`/`ADMIN_EMAIL` шлёт уведомление (ошибка отправки не блокирует сохранение, только логируется); пишет строку в `wbd_applications`; 303-редирект на `/application?submitted=1&type=...`.
- **`public-polls/notify` `POST`** — без авторизации. Принимает `pollId`+`email` (400 при отсутствии); если настроен Resend — уведомляет админа о запросе на публичный опрос; редирект на `/?submitted=poll-notification#public-polls`.
