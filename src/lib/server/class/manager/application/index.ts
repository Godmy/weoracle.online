import { error } from '@sveltejs/kit';
import type { D1Like } from '$lib/server/interface/db/d1-like';
import { generateId } from '$lib/server/function/generate/id';
import { mapD1Error } from '$lib/server/function/transform/map-d1-error';

export interface CreateApplicationInput {
	requestType: string;
	name: string;
	email: string;
	company: string;
	message: string;
	emailSent: boolean;
}

export class ManagerApplication {
	static async create(db: D1Like, input: CreateApplicationInput): Promise<void> {
		try {
			await db
				.prepare(
					`INSERT INTO wbd_applications (id, request_type, name, email, company, message, email_sent)
					 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`
				)
				.bind(
					generateId(),
					input.requestType,
					input.name,
					input.email,
					input.company || null,
					input.message,
					input.emailSent ? 1 : 0
				)
				.run();
		} catch (err) {
			const { status, message } = mapD1Error(err);
			error(status, message);
		}
	}
}
