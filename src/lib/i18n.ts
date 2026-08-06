import { page } from '$app/state';

/**
 * Looks up `key` in the translations loaded by the root layout for the current language,
 * falling back to the key itself so a missing row degrades to a visible placeholder instead
 * of an empty string. `vars` fills `{name}` placeholders in the translated string.
 */
export function t(key: string, vars?: Record<string, string | number>): string {
	const translations = (page.data as { translations?: Record<string, string> }).translations;
	let value = translations?.[key] ?? key;
	if (vars) {
		for (const [name, replacement] of Object.entries(vars)) {
			value = value.replaceAll(`{${name}}`, String(replacement));
		}
	}
	return value;
}
