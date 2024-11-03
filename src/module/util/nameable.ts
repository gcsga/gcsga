interface NameableFiller {
	fillWithNameableKeys(m: Map<string, string>, existing?: Map<string, string>): void
}

interface NameableAccesser {
	get nameableReplacements(): Map<string, string>
}

interface NameableApplier extends NameableAccesser, NameableFiller {
	applyNameableKeys(m: Map<string, string>): void
}

function extract(str: string, m: Map<string, string | null>, existing: Map<string, string>): void {
	for (const key of [...str.matchAll(/@([^@]+)@/g)].map(e => e[1])) {
		if (existing.has(key)) m.set(key, existing.get(key)!)
		else m.set(key, key)
	}
}

function apply(str: string, m: Map<string, string>): string {
	for (const [key, value] of m.entries()) {
		str = str.replaceAll(`@${key}@`, value)
	}
	return str
}

function applyToElement(str: string, m: Map<string, string>): string {
	for (const [key, value] of m.entries()) {
		str = str.replaceAll(`@${key}@`, `<span class="replaced-text" data-tooltip="@${key}@">${value}</span>`)
	}
	return str
}

function applyToList(inputList: string[], m: Map<string, string>): string[] {
	if (inputList.length === 0) return []
	const list: string[] = new Array(inputList.length)
	for (let i = 0; i < list.length; i++) {
		list[i] = apply(inputList[i], m)
	}
	return list
}

function reduce(needed: Map<string, string>, replacements: Map<string, string>): Map<string, string> {
	const ret = new Map()
	for (const [key, value] of replacements.entries()) {
		if (needed.has(key)) ret.set(key, value)
	}
	return ret
}

function isFiller(e: unknown): e is NameableFiller {
	return typeof e === "object" && e !== null && "fillWithNameableKeys" in e
}

function isAccesser(e: unknown): e is NameableAccesser {
	return typeof e === "object" && e !== null && "nameableReplacements" in e
}

function isApplier(e: unknown): e is NameableApplier {
	return typeof e === "object" && e !== null && "applyNameableKeys" in e
}

export const Nameable = {
	apply,
	applyToElement,
	applyToList,
	extract,
	isAccesser,
	isApplier,
	isFiller,
	reduce,
}
