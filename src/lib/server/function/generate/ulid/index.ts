const ULID_ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford base32, no I/L/O/U

/** ULID: 48-bit timestamp + 80-bit randomness, Crockford base32 — sortable and URL-safe. */
export function generateUlid(): string {
	let time = Date.now();
	const timeChars = new Array<string>(10);
	for (let i = 9; i >= 0; i--) {
		timeChars[i] = ULID_ENCODING[time % 32];
		time = Math.floor(time / 32);
	}

	const randomBytes = crypto.getRandomValues(new Uint8Array(10));
	let randomChars = '';
	for (let i = 0; i < 16; i++) {
		const byteIndex = Math.floor((i * 5) / 8);
		const bitOffset = (i * 5) % 8;
		let value = (randomBytes[byteIndex] << 8) | (randomBytes[byteIndex + 1] ?? 0);
		value = (value >> (11 - bitOffset)) & 0x1f;
		randomChars += ULID_ENCODING[value];
	}

	return timeChars.join('') + randomChars;
}
