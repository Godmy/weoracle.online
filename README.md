# weoracle.online

SvelteKit app deployed to Cloudflare Workers via `@sveltejs/adapter-cloudflare`, built with [`stylist-svelte`](../stylist-svelte) components.

## Setup

Run from the monorepo root (`yarn install` there links `stylist-svelte` as a workspace dependency):

```bash
yarn install
```

## Development

```bash
yarn workspace weoracle-online dev
```

## Build & deploy

```bash
yarn workspace weoracle-online build     # vite build -> .svelte-kit/cloudflare (worker + assets)
yarn workspace weoracle-online deploy    # build + wrangler deploy
```

`wrangler deploy` requires being logged in (`npx wrangler login`) and picks up `wrangler.jsonc` in this directory.

## Notes

- `stylist-svelte` is consumed as `workspace:*` through its packaged `dist/` (the published `svelte`/`main`/`types` entry points) — no special alias wiring needed here.
- After changing bindings in `wrangler.jsonc`, regenerate types with `yarn cf-typegen` (writes `worker-configuration.d.ts`).
