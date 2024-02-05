import Fuse from "fuse.js"

// Temporary options
const defaultOptions = {
	includeMatches: true,
	includeScore: true,
	keys: ["name", "system.notes", "system.tags"],
}

/**
 *
 * @param list
 * @param pattern
 * @param options
 */
export function fSearch(list: object[], pattern: string, options: object = defaultOptions): object[] {
	const fuse = new Fuse(list, options)
	return fuse.search(pattern)
}
