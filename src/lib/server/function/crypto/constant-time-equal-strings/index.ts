async function sha256(value: string): Promise<Uint8Array> {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
	return new Uint8Array(digest);
}

/**
 * Constant-time string equality via SHA-256 digest comparison. Hashing first means both
 * digests are always the same length, so the comparison loop can't short-circuit on length
 * or leak how many leading characters matched — unlike a plain `a === b` on secrets.
 */
export async function constantTimeEqualStrings(a: string, b: string): Promise<boolean> {
	const [digestA, digestB] = await Promise.all([sha256(a), sha256(b)]);
	let diff = 0;
	for (let i = 0; i < digestA.length; i++) diff |= digestA[i] ^ digestB[i];
	return diff === 0;
}
