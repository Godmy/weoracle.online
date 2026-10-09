# weoracle.online

**WeOracle** — платформа для сбора анонимного экспертного консенсуса по методу **Wideband Delphi**: независимые оценки экспертов в несколько раундов, разброс/расхождение мнений виден без раскрытия авторства, итог — диапазон значений и документ для принятия решения (CAPEX, сроки, бюджет, контрактные цены, техноготовность и т.п.).

SvelteKit-приложение, развёрнутое на Cloudflare Workers через `@sveltejs/adapter-cloudflare`. Весь UI собран из компонентов пакета [`stylist-svelte`](../stylist-svelte) (домен `wbd`) — `weoracle.online` сам по себе является тонким слоем роутинга, серверной логики и данных поверх этой библиотеки.

## Стек

- **SvelteKit 2** / **Svelte 5** (runes), TypeScript.
- **Cloudflare Workers** — среда исполнения (`wrangler`), деплой на кастомный домен `weoracle.online` / `www.weoracle.online`.
- **Cloudflare D1** (SQLite) — основное хранилище (сессии, вопросы, ответы, эксперты, обсуждения, снапшоты раундов, аудит-лог).
- **Cloudflare KV** — одноразовые токены passwordless-входа (magic link) и rate-limit неудачных попыток admin-логина.
- **Cloudflare R2** — бакет `weoracle-online` объявлен в `wrangler.jsonc` (binding `BUCKET`), но в коде приложения пока не используется; статические изображения на данный момент лежат в `static/`.
- **Resend** — исходящая почта (приглашения, magic-link, заявки с лендинга) через прямой HTTP-вызов Resend API, не через Cloudflare Email Sending binding (последний требует ручной верификации каждого адресата и не годится для писем произвольным пользователям).
- **stylist-svelte** — библиотека компонентов, потребляется как `workspace:*`; в разработке подключается напрямую по исходникам через alias `$stylist` (см. «Работа с `stylist-svelte`» ниже).

## Структура репозитория

- `src/routes/` — страницы и API-эндпоинты SvelteKit. Подробное описание всех роутов, их серверной логики и того, какие компоненты `stylist-svelte` и какого архитектурного уровня (atom/molecule/organism/template) они используют — в [`src/routes/readme.md`](src/routes/readme.md). Авторизованная часть `/app/**` дополнительно подробно описана в [`src/routes/app/readme.md`](src/routes/app/readme.md).
- `src/lib/` — серверные хелперы (`server/wbd/**`), клиентские wbd-компоненты и мапперы данных, i18n. Подробности — в [`src/lib/readme.md`](src/lib/readme.md).
- `migrations/` — SQL-миграции D1 (`wrangler d1 migrations apply`), схема `wbd_*`-таблиц.
- `static/` — статика: иконки, изображения лендинга (`landing/`), сгенерированные иллюстрации (`gen/`), скриншоты сессий.
- `wrangler.jsonc` / `wrangler.platform.jsonc` — конфигурация Cloudflare-биндингов (D1, KV, R2, assets, кастомные домены). `wrangler.platform.jsonc` — облегчённая версия (без `routes`/`assets`), которую использует Vite dev-сервер через `platformProxy` (см. `svelte.config.js`) для локальной эмуляции биндингов.

## Данные и авторизация

Схема D1 (миграции `0001`–`0008`): `wbd_users`, `wbd_sessions`, `wbd_session_experts`, `wbd_questions`, `wbd_answers`, `wbd_discussion_messages`, `wbd_round_snapshots`, `wbd_round_settings`, `wbd_final_reports`, `wbd_audit_log`, `wbd_translations`, `wbd_applications`.

В системе три роли (`wbd_users.role`): `admin`, `coordinator` (создаёт и ведёт сессии), `expert` (даёт оценки по приглашению). Работают три независимых способа попасть в приложение:

- **Admin sign-in** (`/app/sign-in`) — email + пароль из секретов `ADMIN_EMAIL`/`ADMIN_PASSWORD`, сравнение constant-time (`crypto.subtle.digest`), rate-limit неудачных попыток через KV (5 попыток / 15 минут блокировки).
- **Magic link для координаторов** (`/app/magic-link` → `/app/verify`) — одноразовый токен в KV (TTL 15 минут), письмо через Resend, роль всегда жёстко `coordinator` на сервере (клиент не может запросить себе роль).
- **Публичный вход эксперта** (`/public/invite/[ulid]` → magic link на email → `/public/verify` → `/public/band/[ulid]`) — участник самостоятельно присоединяется к публичной сессии по email, без пароля; отдельно от этого — приглашение по прямой ссылке с токеном (`/invite/[token]`) для экспертов, добавленных координатором вручную.

Во всех случаях итоговая сессия — httpOnly-cookie (`wbd_user` для координаторов/админов, `wbd_public_expert_{sessionId}` для публичных экспертов), проверяемая на сервере (`ManagerAuth`, `$lib/server/class/manager/auth`).

## Локализация

Три языка: `en` (по умолчанию), `ru`, `es`. Язык определяется в `+layout.server.ts` (кука `wbd_lang`, иначе заголовок `Accept-Language`) и прокидывается в `page.data`. Переводы UI (кнопки, статические подписи) хранятся в таблице `wbd_translations` и читаются функцией `t()` из `$lib/i18n.ts`; развёрнутый контент лендинга (заголовки, кейсы, тексты воронки заявки) захардкожен по языкам в `$lib/i18n/const/object/landing/index.ts`.

## Setup

Выполняется из корня монорепозитория (`yarn install` там же линкует `stylist-svelte` как workspace-зависимость):

```bash
yarn install
```

## Development

```bash
yarn workspace weoracle-online dev
```

Локальные секреты (Resend API key, admin-логин) — в `.dev.vars` (не коммитится). Cloudflare-биндинги (D1/KV) на dev-сервере эмулируются через `platformProxy`, настроенный в `svelte.config.js` на `wrangler.platform.jsonc`, с персистентным локальным состоянием (`persist: true`).

## Build & deploy

```bash
yarn workspace weoracle-online build     # vite build -> .svelte-kit/cloudflare (worker + assets)
yarn workspace weoracle-online deploy    # build + wrangler deploy
```

`wrangler deploy` требует авторизации (`npx wrangler login`) и использует `wrangler.jsonc` в этой директории (полная конфигурация — с D1/KV/R2-биндингами, кастомными доменами и Workers-ассетами).

Миграции D1 применяются отдельно (`wrangler d1 migrations apply weoracle --remote` для продакшена / без `--remote` для локальной базы).

## Работа с `stylist-svelte`

`stylist-svelte` — не папка этого проекта, а отдельный git-submodule (`packages/stylist-svelte` → `github.com/Godmy/stylist-svelte`), независимо версионируемая библиотека компонентов со своим публикационным пайплайном (`svelte-package`, `publint`, `prepublishOnly`). Формально возможны два способа его подключения:

- **Публичный API пакета** (`import { X } from 'stylist-svelte'`) — резолвится через `node_modules/stylist-svelte` (симлинк на пакет, yarn workspaces) и его `exports`/`svelte`-поле на собранный `dist/index.js`. Требует пересборки `dist` (`yarn workspace stylist-svelte build`) при каждой правке компонента.
- **Alias `$stylist`** (указывает напрямую на `../stylist-svelte/src/lib`, настроен в `vite.config.ts` и `svelte.config.js`, с добавлением корня `stylist-svelte` в `server.fs.allow`) — обходит `dist`, резолвится прямо на исходный `.svelte`/`.ts`-файл конкретного компонента: `$stylist/<domain>/component/<joint>/<family>/index.svelte`, типы/функции — `$stylist/<domain>/type/object/<family>` или `$stylist/<domain>/function/transform/<family>` (без расширения, резолвится на `index.ts`).

**В этом приложении используется только `$stylist`** — каждый импорт из `stylist-svelte` в `src/` указывает на конкретный файл в `../stylist-svelte/src/lib/**`. Это соответствует обязательной Development Server Policy из `packages/AGENTS.md`: hot-reload-связка рассчитана на потребление `stylist-svelte/src/**`, и пересборка `dist` во время работы над `weoracle.online`/`stylist-svelte` явно запрещена (может рассинхронизировать уже запущенный dev-сервер). Правка organism-компонента в `stylist-svelte` подхватывается hot-reload'ом сразу, без `yarn lib:build`. Обратная сторона: приложение опирается на внутреннюю структуру пакета напрямую, а не на его публикуемый `exports`-контракт — при переименовании/переносе family-папки в `stylist-svelte` импорт в weoracle.online нужно поправить руками (типизация всё равно ловит расхождение через `svelte-check`).

После изменения биндингов в `wrangler.jsonc` нужно перегенерировать типы: `yarn cf-typegen` (пишет `worker-configuration.d.ts`, тип `Env`, используемый в `src/app.d.ts` как `App.Platform.env`).
