import { generateKeyBetween, generateNKeysBetween } from "fractional-indexing";

/**
 * Generate a key between two keys.
 * Pass null for start or end to generate at the beginning or end.
 */
export function generateKey(
	before: string | null,
	after: string | null,
): string {
	try {
		return generateKeyBetween(before, after);
	} catch {
		if (before && after) {
			try {
				return generateKeyBetween(before, null);
			} catch {}
			try {
				return generateKeyBetween(null, after);
			} catch {}
		}
		return generateKeyBetween(null, null);
	}
}

/**
 * Generate a key after a given key.
 */
export function generateKeyAfter(key: string | null): string {
	return generateKeyBetween(key, null);
}

/**
 * Generate a key before a given key.
 */
export function generateKeyBefore(key: string | null): string {
	return generateKeyBetween(null, key);
}

/**
 * Generate multiple keys between two keys.
 */
export function generateKeysBetween(
	before: string | null,
	after: string | null,
	count: number,
): string[] {
	return generateNKeysBetween(before, after, count);
}

/**
 * Generate multiple keys after a given key.
 */
export function generateKeysAfter(key: string | null, count: number): string[] {
	return generateNKeysBetween(key, null, count);
}

/**
 * Generate multiple keys before a given key.
 */
export function generateKeysBefore(
	key: string | null,
	count: number,
): string[] {
	return generateNKeysBetween(null, key, count);
}
