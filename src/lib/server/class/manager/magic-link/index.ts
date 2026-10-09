const TTL_SECONDS = 15 * 60;
const KEY_PREFIX = 'magic-link:';

interface MagicLinkPayload {
	email: string;
	name: string;
	/** Present only for public-poll self-serve joins — which session the link grants access to. */
	sessionId?: string;
}

// Structural subset of the real (ambient, unimported) KVNamespace type — see note in
// src/lib/server/wbd/db.ts about why bindings are accessed without importing global Workers types.
interface KVLike {
	get(key: string): Promise<string | null>;
	put(key: string, value: string, options?: { expirationTtl?: number }): Promise<unknown>;
	delete(key: string): Promise<unknown>;
}

export class ManagerMagicLink {
	static async create(kv: KVLike, payload: MagicLinkPayload): Promise<string> {
		const token = crypto.randomUUID();
		await kv.put(KEY_PREFIX + token, JSON.stringify(payload), { expirationTtl: TTL_SECONDS });
		return token;
	}

	/** One-time use: returns the payload and deletes the token, or null if missing/expired. */
	static async consume(kv: KVLike, token: string): Promise<MagicLinkPayload | null> {
		const raw = await kv.get(KEY_PREFIX + token);
		if (!raw) return null;
		await kv.delete(KEY_PREFIX + token);
		return JSON.parse(raw) as MagicLinkPayload;
	}

	static emailHtml(link: string): string {
		return `
			<div style="font-family: sans-serif; max-width: 32rem; margin: 0 auto;">
				<h1 style="font-size: 1.25rem;">Sign in to WeOracle</h1>
				<p>Click the button below to sign in. This link expires in 15 minutes and can only be used once.</p>
				<p><a href="${link}" style="display:inline-block; padding: 0.625rem 1rem; background: #3b82f6; color: #fff; border-radius: 0.375rem; text-decoration: none;">Sign in</a></p>
				<p style="color: #64748b; font-size: 0.8125rem;">If you didn't request this, you can ignore this email.</p>
			</div>
		`;
	}

	static emailText(link: string): string {
		return `Sign in to WeOracle\n\n${link}\n\nThis link expires in 15 minutes and can only be used once. If you didn't request this, you can ignore this email.`;
	}
}
