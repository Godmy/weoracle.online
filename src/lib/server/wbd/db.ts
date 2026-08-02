export function generateId(): string {
	return crypto.randomUUID();
}

export function generateToken(): string {
	return crypto.randomUUID();
}

export function nowIso(): string {
	return new Date().toISOString();
}

/** Maps a raw D1/SQLite constraint failure to an HTTP status + message. */
export function mapD1Error(err: unknown): { status: number; message: string } {
	const message = err instanceof Error ? err.message : String(err);
	if (message.includes('UNIQUE constraint failed')) {
		return { status: 409, message: 'Conflicts with an existing record' };
	}
	if (message.includes('FOREIGN KEY constraint failed')) {
		return { status: 400, message: 'References a record that does not exist' };
	}
	if (message.includes('CHECK constraint failed')) {
		return { status: 400, message: 'Value violates a field constraint' };
	}
	return { status: 500, message: 'Database error' };
}
