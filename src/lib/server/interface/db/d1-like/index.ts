// Structural subset of the real (ambient, unimported) D1Database type — covers the
// prepare().bind().first()/.all()/.run() shape used throughout src/lib/server and
// src/routes/api/wbd. `platform.env.*` bindings (D1Database, KVNamespace, R2Bucket, SendEmail, ...)
// are accessed untyped (or via small local structural interfaces) rather than importing the real
// ambient types. Both `@cloudflare/workers-types` and including `worker-configuration.d.ts` in the
// TS program redeclare global `Request`/`Response`/etc. in a way that conflicts with lib.dom, making
// `request.json()` untypeable across the whole app (see git history around removing
// `@cloudflare/workers-types`). Don't reintroduce either.
export interface D1Like {
	prepare(query: string): {
		bind(...values: unknown[]): {
			first<T = unknown>(): Promise<T | null>;
			all<T = unknown>(): Promise<{ results: T[] }>;
			run(): Promise<unknown>;
		};
	};
}
