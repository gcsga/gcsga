function trimS(str: string, substring: string): string {
	if (!substring || !str.includes(substring)) {
		return str
	}

	while (str.startsWith(substring)) {
		str = str.slice(substring.length)
	}

	while (str.endsWith(substring)) {
		str = str.slice(0, -substring.length)
	}

	return str
}

function generateId(): string {
	const buffer = Array.from({ length: 12 }, () => Math.floor(Math.random() * 256))
	return btoa(String.fromCharCode.apply(null, buffer)).replaceAll("+", "-").replaceAll("/", "_")
}

/**
 * Given an array, adds a certain amount of elements to it
 * until the desired length is being reached
 */
function padArray<T>(array: T[], requiredLength: number, padWith: T): T[] {
	const result = [...array]
	for (let i = array.length; i < requiredLength; i += 1) {
		result.push(padWith)
	}
	return result
}

/**
 * Sanitize IDs to ones used by the GCS attribute system
 */
function sanitizeId(id: string, permit_leading_digits: boolean, reserved: string[]): string {
	const buffer: string[] = []
	for (let ch of id.split("")) {
		if (ch.match("[A-Z]")) ch = ch.toLowerCase()
		if (ch === "_" || ch.match("[a-z]") || (ch.match("[0-9]") && (permit_leading_digits || buffer.length > 0)))
			buffer.push(ch)
	}
	if (buffer.length === 0) buffer.push("_")
	let ok = true
	while (ok) {
		ok = true
		id = buffer.join("")
		for (const r of reserved) {
			if (r === id) {
				buffer.push("_")
				ok = false
				break
			}
		}
		if (ok) return id
	}
	// Cannot reach
	return ""
}

/**
 * Sanitize text, getting rid of any non-standard characters or HTML-escaped characters
 */
function sanitize(text: string): string {
	text = text.replace(/%(?![0-9][0-9a-fA-F]+)/g, "%25")
	text = decodeURIComponent(text) // convert % (not followed by 2 digit hex) to %25, unicode characters into html format
	text = text.replace(/&nbsp;/g, " ") // we need to convert non-breaking spaces into regular spaces for parsing
	text = text.replace(/&amp;/g, "&") // we need to convert to & for easier parsing
	text = text.replace(/&minus;/g, "-") // we need to convert to - for easier parsing
	text = text.replace(/&plus;/g, "+") // we need to convert to - for easier parsing
	text = text.replace(/(&#215;|&#xD7;|&times)/g, "x") // we need to convert the multiplication symbol to x for easier parsing
	text = text.replace(/(<([^>]+)>)/gi, "") // remove <html> tags
	text = text.replace(/(\u201c|\u201d)/g, '"') // double quotes
	text = text.replace(/&quot;/g, '"') // double quotes
	text = text.replace(/&#x27;/g, "'") // single quotes
	text = text.replace(/\u2011/g, "-") // replace non-breaking hyphon with a minus sign
	text = text.replace(/\u2212/g, "-") // unicode minus to minus
	return text
}

/**
 * Generate an Attribute ID given a list of taken IDs
 */
function getNewAttributeId(list: { id: string }[]): string {
	let base = ""
	for (let i = 0; i < 5; i++) {
		for (let n = 0; n < 26; n++) {
			const attempt = `${base}${String.fromCharCode(97 + n)}`
			if (!list.some(e => e.id === attempt)) return attempt
		}
		base += "a"
	}
	ui.notifications?.error("Ran out of valid IDs. How did you manage this?")
	throw new Error("Error generating new attribute ID, ran out of possible auto-generated IDs.")
}

/**
 * Check if a key is present in a given object in a type safe way
 *
 * @param obj The object to check
 * @param key The key to check
 */
function objectHasKey<O extends object>(obj: O, key: unknown): key is keyof O {
	return (typeof key === "string" || typeof key === "number") && key in obj
}

/** Check if a value is present in the provided array. Especially useful for checking against literal tuples */
function tupleHasValue<const A extends readonly unknown[]>(array: A, value: unknown): value is A[number] {
	return array.includes(value)
}

/** Check if an element is present in the provided set. Especially useful for checking against literal sets */
function setHasElement<T extends Set<unknown>>(set: T, value: unknown): value is SetElement<T> {
	return set.has(value)
}

let intlNumberFormat: Intl.NumberFormat
/**
 * Return an integer string of a number, always with sign (+/-)
 * @param value The number to convert to a string
 * @param options.emptyStringZero If the value is zero, return an empty string
 * @param options.zeroIsNegative Treat zero as a negative value
 */
function signedInteger(value: number, { emptyStringZero = false, zeroIsNegative = false } = {}): string {
	if (value === 0 && emptyStringZero) return ""
	const nf = (intlNumberFormat ??= new Intl.NumberFormat(game.i18n.lang, {
		maximumFractionDigits: 0,
		signDisplay: "always",
	}))
	const maybeNegativeZero = zeroIsNegative && value === 0 ? -0 : value

	return nf.format(maybeNegativeZero)
}

const wordCharacter = String.raw`[\p{Alphabetic}\p{Mark}\p{Decimal_Number}\p{Join_Control}]`
const nonWordCharacter = String.raw`[^\p{Alphabetic}\p{Mark}\p{Decimal_Number}\p{Join_Control}]`
const nonWordCharacterRE = new RegExp(nonWordCharacter, "gu")

const wordBoundary = String.raw`(?:${wordCharacter})(?=${nonWordCharacter})|(?:${nonWordCharacter})(?=${wordCharacter})`
const nonWordBoundary = String.raw`(?:${wordCharacter})(?=${wordCharacter})`
const lowerCaseLetter = String.raw`\p{Lowercase_Letter}`
const upperCaseLetter = String.raw`\p{Uppercase_Letter}`
const lowerCaseThenUpperCaseRE = new RegExp(`(${lowerCaseLetter})(${upperCaseLetter}${nonWordBoundary})`, "gu")

const nonWordCharacterHyphenOrSpaceRE = /[^-\p{White_Space}\p{Alphabetic}\p{Mark}\p{Decimal_Number}\p{Join_Control}]/gu
const upperOrWordBoundariedLowerRE = new RegExp(`${upperCaseLetter}|(?:${wordBoundary})${lowerCaseLetter}`, "gu")

/**
 * The system's sluggification algorithm for labels and other terms.
 * @param text The text to sluggify
 * @param [options.camel=null] The sluggification style to use
 */
function sluggify(text: string, { camel = null }: { camel?: SlugCamel } = {}): string {
	// Sanity check
	if (typeof text !== "string") {
		console.warn("Non-string argument passed to `sluggify`")
		return ""
	}

	// A hyphen by its lonesome would be wiped: return it as-is
	if (text === "-") return text

	switch (camel) {
		case null:
			return text
				.replace(lowerCaseThenUpperCaseRE, "$1-$2")
				.toLowerCase()
				.replace(/['’]/g, "")
				.replace(nonWordCharacterRE, " ")
				.trim()
				.replace(/[-\s]+/g, "-")
		case "bactrian": {
			const dromedary = sluggify(text, { camel: "dromedary" })
			return dromedary.charAt(0).toUpperCase() + dromedary.slice(1)
		}
		case "dromedary":
			return text
				.replace(nonWordCharacterHyphenOrSpaceRE, "")
				.replace(/[-_]+/g, " ")
				.replace(upperOrWordBoundariedLowerRE, (part, index) =>
					index === 0 ? part.toLowerCase() : part.toUpperCase(),
				)
				.replace(/\s+/g, "")
		default:
			throw ErrorGURPS("I don't think that's a real camel.")
	}
}

type SlugCamel = "dromedary" | "bactrian" | null

/** Parse a string containing html */
function parseHTML(unparsed: string): HTMLElement {
	const fragment = document.createElement("template")
	fragment.innerHTML = unparsed
	const element = fragment.content.firstElementChild
	if (!(element instanceof HTMLElement)) throw ErrorGURPS("Unexpected error parsing HTML")

	return element
}

function ErrorGURPS(message: string): Error {
	return Error(`GURPS Game Aid | ${message}`)
}

/** Generate and return an HTML element for a FontAwesome icon */
type FontAwesomeStyle = "solid" | "regular" | "duotone"

function fontAwesomeIcon(
	glyph: string,
	{ style = "solid", fixedWidth = false }: { style?: FontAwesomeStyle; fixedWidth?: boolean } = {},
): HTMLElement {
	const styleClass = `fa-${style}`
	const glyphClass = glyph.startsWith("fa-") ? glyph : `fa-${glyph}`
	const icon = document.createElement("i")
	icon.classList.add(styleClass, glyphClass)
	if (fixedWidth) icon.classList.add("fa-fw")

	return icon
}

/** Short form of type and non-null check */
function isObject<T extends object>(value: unknown): value is DeepPartial<T>
function isObject<T extends string>(value: unknown): value is { [K in T]?: unknown }
function isObject(value: unknown): boolean {
	return typeof value === "object" && value !== null
}

/** Create a localization function with a prefixed localization object path */
function localizer(prefix: string): (...args: Parameters<Localization["format"]>) => string {
	return (...[suffix, formatArgs]: Parameters<Localization["format"]>) =>
		formatArgs ? game.i18n.format(`${prefix}.${suffix}`, formatArgs) : game.i18n.localize(`${prefix}.${suffix}`)
}

/** Get the current time as an ISO string (standard for the system) */
function getCurrentTime(): string {
	return new Date().toISOString()
}

/// ** Disgusting hack to get arrays and attribute threshold op boolean values working with prepareFormData */
// function prepareFormData(formData: Record<string, unknown>, object: object): Record<string, unknown> {
//	function setArrayProperty(a: object[], index: number, prop: string, value: unknown): object[] {
//		if (prop.match(/.\d+./)) {
//			const inArrayKey = prop.split(/.\d+./)[0]
//			const inArrayArray = fu.getProperty(a[index], inArrayKey) as object[]
//			const inArrayIndex = parseInt(prop.match(/.(\d+)./)![1])
//			const inArrayProp = prop.replace(`${inArrayKey}.${inArrayIndex}.`, "")
//			fu.setProperty(a[index], inArrayKey, setArrayProperty(inArrayArray, inArrayIndex, inArrayProp, value))
//			return a
//		}
//		fu.setProperty(a[index], prop, value)
//		return a
//	}
//
//	for (const aKey of Object.keys(formData)) {
//		if (formData[aKey] === null) formData[aKey] = "0"
//		if (aKey.includes(".halve_")) {
//			const tKey = aKey.replace(/\.halve_.*$/, "")
//			const tOp = aKey.split(".").at(-1)
//			formData[`${tKey}.ops`] ??= []
//			if (formData[aKey]) (formData[`${tKey}.ops`] as unknown[]).push(tOp)
//			delete formData[aKey]
//		}
//	}
//	for (const aKey of Object.keys(formData)) {
//		if (aKey.startsWith("array.") && aKey.match(/\d/)) {
//			const key = aKey.replace(/^array./g, "")
//			const arrayKey = key.split(/.\d+./)[0]
//			let array: object[] = (formData[arrayKey] as object[]) || (fu.getProperty(object, arrayKey) as object[])
//			const index = parseInt(key.match(/.(\d+)./)![1])
//			const prop = key.replace(new RegExp(`^${arrayKey}.${index}.`), "")
//			array = setArrayProperty(array, index, prop, formData[aKey])
//			formData[arrayKey] = array
//			delete formData[aKey]
//		} else if (aKey.startsWith("array.")) {
//			formData[aKey.replace("array.", "")] = formData[aKey]
//			delete formData[aKey]
//			// HACK: stupid exception for static resource trackers only. remove in 2.0
//		} else if (aKey.startsWith("sarray.") && aKey.match(/\d/)) {
//			const key = aKey.replace(/^sarray./g, "")
//			const arrayKey = `${key.split(/thresholds.\d+./)[0]}thresholds`
//			const array: object[] = fu.getProperty(object, arrayKey) as object[]
//			const index = parseInt(key.match(/thresholds.(\d+)./)![1])
//			const prop = key.replace(new RegExp(`^${arrayKey}.${index}.`), "")
//			setArrayProperty(array, index, prop, formData[aKey])
//			formData[arrayKey] = array
//			delete formData[aKey]
//		}
//	}
//	return formData
// }

/** Get a Tech Level as a number, given a string */
function extractTechLevel(str: string): number {
	return Math.min(Math.max(0, parseInt(str)), 12)
}

function rgbToHex(input: string): string {
	const [r, g, b] = input.split(", ").map(e => parseInt(e))
	return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)
}

// // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
// function isContainer(item: { type: ItemType }): boolean {
// 	return [
// 		ItemType.TraitContainer,
// 		ItemType.SkillContainer,
// 		ItemType.SpellContainer,
// 		ItemType.EquipmentContainer,
// 		ItemType.TraitModifierContainer,
// 		ItemType.EquipmentModifierContainer,
// 		ItemType.NoteContainer,
// 	].includes(item.type)
// }

function localeDate(str: string): string {
	const date = new Date(str)
	const options: Intl.DateTimeFormatOptions = {
		dateStyle: "medium",
		timeStyle: "short",
	}
	options.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
	return date.toLocaleString("en-US", options)
}

/**
 * Prounounced "dee six if eye" Convert a GURPS dice roll to Foundry dice roll (e.g. 1d => 1d6, 2d-1 => 2d6-1)
 * @param {string} str
 * @param {string | null} flavor
 * @returns {string}
 */
function d6ify(str: string, flavor: string | null = ""): string {
	const w = str.replace(/d([^6])/g, `d6${flavor || ""}$1`) // Find 'd's without a 6 behind it, and add it.
	return w.replace(/d$/g, `d6${flavor || ""}`) // And do the same for the end of the line.
}

export {
	ErrorGURPS,
	d6ify,
	extractTechLevel,
	fontAwesomeIcon,
	generateId,
	getCurrentTime,
	getNewAttributeId,
	// isContainer,
	isObject,
	localeDate,
	localizer,
	objectHasKey,
	padArray,
	parseHTML,
	rgbToHex,
	sanitize,
	sanitizeId,
	setHasElement,
	signedInteger,
	sluggify,
	tupleHasValue,
	trimS,
	type SlugCamel,
}
