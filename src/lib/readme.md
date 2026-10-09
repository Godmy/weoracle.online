# `src/lib`

Всё, что не является страницей/эндпоинтом SvelteKit: серверные хелперы для работы с Cloudflare-биндингами (D1/KV), клиентские компоненты приложения (не путать с organism-компонентами из `stylist-svelte`, которые лежат в другом пакете) и i18n. Импортируется через alias `$lib` (стандартный для SvelteKit).

Для контраста: компоненты уровня atom/molecule/organism/template домена `wbd` живут в `stylist-svelte/src/lib/wbd/**` (отдельный git-submodule) и подключаются в приложение через alias `$stylist` напрямую на исходники пакета (`import { ComponentName } from '$stylist/<domain>/component/<joint>/<family>'`) — публичный npm-контракт пакета (`import ... from 'stylist-svelte'`, собранный `dist/`) в этом приложении не используется вовсе. См. [`../routes/readme.md`](../routes/readme.md) про эту схему.

## `brand/`

### `brand/component/molecule/logo/index.svelte`
Логотип «WeOracle» (экспортируется как `BrandLogo`) — light/dark PNG-маркер (`/dark.png`, `/light.png` в `static/`) плюс текст с акцентированным «Oracle», переключается по `html.light`-селектору темы. Пропсы: `href` (опциональная ссылка), `size` (размер маркера), `subtitle` (подпись «Online»), `class`. Используется в шапке лендинга (`routes/+page.svelte`), в форме заявки (`routes/application/+page.svelte`) и в шелле `/app` (`routes/app/+layout.svelte`).

Путь следует той же domain/cluster/joint/family-номенклатуре, что и `stylist-svelte`: домен `brand` — своя предметная область в этом приложении (не деталь домена `wbd`), `component/molecule` — единственный компонент здесь, но по сложности (не голый атом, есть логика темы/варианта) это молекула, а не атом.

## `i18n/`

### `i18n/component/molecule/language/index.svelte`
Переключатель языка (en/es/ru, экспортируется как `LanguageControl`) с флагами, использует `Flag`/`Tooltip` из `stylist-svelte`. Источник текущего языка — SSR-данные (`page.data.lang`, из cookie `wbd_lang` + `Accept-Language`), не `localStorage`. При выборе языка пишет cookie (год) и вызывает `invalidateAll()`, чтобы все `load`-функции (включая перевод `wbd_translations`) пересчитались для нового языка. Используется в шапке лендинга, в форме заявки и в футере `/app`.

### `i18n/function/translate/index.ts`
Функция `t(key, vars?)` — точка входа для переводов статических UI-строк (кнопки, лейблы форм и т.п., в отличие от развёрнутого контента лендинга, который живёт в `i18n/const/object/landing`). Берёт словарь из `page.data.translations` (загружен в `routes/+layout.server.ts` из таблицы `wbd_translations` для текущего языка), при отсутствии ключа возвращает сам ключ как заметный плейсхолдер вместо пустой строки. `vars` подставляет значения в плейсхолдеры вида `{name}` через `replaceAll`. Импортируется как `import { t } from '$lib/i18n/function/translate'`.

### `i18n/const/object/landing/{ru,en,es}/index.ts`
Три отдельных файла, по одному на язык: `ObjectLandingRu`/`ObjectLandingEn`/`ObjectLandingEs`, каждый — `RecipeLandingPage`. Это весь текстовый контент публичного лендинга (`routes/+page.svelte`) и формы заявки (`routes/application/+page.svelte`) для своего языка: мета-теги, навигация, hero, метрики, блок «что такое Wideband Delphi» со сравнительной таблицей, историческая справка (RAND Corporation, 1951), пять кейсов применения, секция публичных опросов, форма заявки (`applicationCta` — с тремя вариантами запуска: публичный опрос / закрытая сессия / корпоративное внедрение, каждый со своим списком фич и сравнением), блок workflow (5 шагов метода), итоговый результат. Тип `RecipeLandingPage` импортируется из `$stylist/wbd/interface/recipe/landing-page` — контент здесь специально типизирован под recipe-контракт organism/template-компонентов `stylist-svelte`, а не описан ad hoc.

### `i18n/const/record/landing/index.ts`
`RecordLandingTranslation: Record<string, RecipeLandingPage>` — объединяет три языковых объекта выше в один словарь по коду языка (`{ ru: ObjectLandingRu, en: ObjectLandingEn, es: ObjectLandingEs }`). Именно этот record импортируют `routes/+page.svelte` и `routes/application/+page.svelte`, обращаясь к нему как `RecordLandingTranslation[currentLang] ?? RecordLandingTranslation.en`.

## `server/` — серверные хелперы (Cloudflare Workers, доступны только в `+page.server.ts` / `+server.ts` — SvelteKit не пускает `$lib/server/**` в клиентский код)

Подробно расписано в [`server/readme.md`](server/readme.md). Коротко:

- **`server/class/manager/**`** — 15 manager-классов (`ManagerSession`, `ManagerQuestion`, `ManagerAnswer`, `ManagerDiscussion`, `ManagerQuestionnaire`, `ManagerExpert`, `ManagerSnapshot`, `ManagerUser`, `ManagerAuditLog`, `ManagerApplication`, `ManagerAuth`, `ManagerMagicLink`, `ManagerEmail`, `ManagerTranslation`, `ManagerOverview`) — вся бизнес-логика API-роутов, включая маппинг D1-строк в camelCase Struct-форму для `stylist-svelte` перед тем, как отдать ответ клиенту. `ManagerQuestionnaire` — фасад над `ManagerAnswer`/`ManagerDiscussion` для экспертного флоу раунда (`/invite/[token]`, `/public/band/[ulid]`): используется напрямую из `+page.server.ts` (`load`/`actions`) этих двух страниц, а не только из `/api/wbd/questions/**`.
- **`server/interface/db/**`** — сырые типы D1-строк (`WbdSessionRow`, `WbdQuestionRow`, ...) и структурные типы биндингов (`D1Like`, `WbdRoundStats`) — видны только менеджерам.
- **`server/function/{generate,time,crypto,transform}/**`** — `generateId`/`generateUlid`, `nowIso`, `constantTimeEqualStrings`, `mapD1Error`, `computeRoundStats`, восемь `toStruct*`-мапперов (`toStructSession`, `toStructQuestion`, `toStructExpert`, `toStructAnswer`, `toStructSnapshot`, `toStructUser`, `toStructAuditLogEntry`, `toStructDiscussionMessage`).
- **`server/const/value/experts-by-session-sql/index.ts`** — общий SQL-фрагмент (join `wbd_session_experts`+`wbd_users`).

## Связь с `stylist-svelte`

`src/lib` в этом проекте — не место для UI-компонентов «уровня организма» (тех, что относятся к переиспользуемой библиотеке): такие компоненты (список сессий, форма редактирования сессии, панели приглашения экспертов, таблицы аналитики и т.д.), а с ними и целые page-level template'ы (`wbd-landing-page`, `wbd-questionnaire-page`) находятся в отдельном пакете `stylist-svelte/src/lib/wbd/component/**` и импортируются через alias `$stylist` напрямую на исходники (см. [`../routes/readme.md`](../routes/readme.md) про эту схему). Экран прохождения раунда (`/invite/[token]`, `/public/band/[ulid]`) раньше жил здесь как локальный композиционный компонент `wbd/expert-round-experience.svelte`; теперь composition — это готовый template `WbdQuestionnairePage` из `stylist-svelte`, рендерящийся напрямую из `+page.svelte` каждого из двух роутов, а весь fetch/post — на сервере, в `ManagerQuestionnaire` (см. выше и [`server/readme.md`](server/readme.md)). В `src/lib` weoracle.online остаются только: (1) вещи, специфичные для *этого* приложения и его Cloudflare-окружения (авторизация, D1/KV-доступ, magic-link, email, маппинг D1 → Struct), и (2) очень тонкий клиентский слой без бизнес-логики (переключатель языка, логотип) — организованный по тому же domain/cluster/joint/family принципу, что и сам `stylist-svelte`.
