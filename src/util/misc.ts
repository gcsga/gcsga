import { ItemType, SETTINGS, SYSTEM_NAME } from "@data"
import { LocalizeGURPS } from "./localize.ts"
import { StringBuilder } from "./string_builder.ts"
import { SkillResolver } from "./resolvers.ts"
// import uuid from "uuidv4"

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
 *
 */
function newUUID(): string {
	// TODO: fix
	return ""
	// return uuid()
}

/**
 *
 */
function getCurrentTime(): string {
	return new Date().toISOString()
}

/**
 *
 * @param value
 * @param base
 */
// function stringCompare(value?: string | string[] | null, base?: StringCriteria): boolean {
// 	if (!base) return true
// 	if (!value) value = ""
// 	if (typeof value === "string") value = [value]
// 	value = value.map(e => {
// 		return e.toLowerCase()
// 	})
// 	base.qualifier = base.qualifier?.toLowerCase()
// 	switch (base.compare) {
// 		case StringComparisonType.AnyString:
// 			return true
// 		case StringComparisonType.IsString:
// 			return base.qualifier !== undefined && value.includes(base.qualifier)
// 		case StringComparisonType.IsNotString:
// 			return base.qualifier !== undefined && !value.includes(base.qualifier)
// 		case StringComparisonType.ContainsString:
// 			for (const v of value) if (base.qualifier && v.includes(base.qualifier)) return true
// 			return false
// 		case StringComparisonType.DoesNotContainString:
// 			for (const v of value) if (base.qualifier && v.includes(base.qualifier)) return false
// 			return true
// 		case StringComparisonType.StartsWithString:
// 			for (const v of value) if (base.qualifier && v.startsWith(base.qualifier)) return true
// 			return false
// 		case StringComparisonType.DoesNotStartWithString:
// 			for (const v of value) if (base.qualifier && v.startsWith(base.qualifier)) return false
// 			return true
// 		case StringComparisonType.EndsWithString:
// 			for (const v of value) if (base.qualifier && v.endsWith(base.qualifier)) return true
// 			return false
// 		case StringComparisonType.DoesNotEndWithString:
// 			for (const v of value) if (base.qualifier && v.endsWith(base.qualifier)) return false
// 			return true
// 	}
// }

/**
 *
 * @param value
 * @param base
 */
// function numberCompare(value: number, base?: NumericCriteria): boolean {
// 	if (!base) return true
// 	switch (base.compare) {
// 		case NumericComparisonType.AnyNumber:
// 			return true
// 		case NumericComparisonType.EqualsNumber:
// 			return value === base.qualifier
// 		case NumericComparisonType.NotEqualsNumber:
// 			return value !== base.qualifier
// 		case NumericComparisonType.AtMostNumber:
// 			return value <= base.qualifier!
// 		case NumericComparisonType.AtLeastNumber:
// 			return value >= base.qualifier!
// 		default:
// 			return true
// 	}
// }

function extractTechLevel(str: string): number {
	return Math.min(Math.max(0, parseInt(str)), 12)
}

function dollarFormat(i: number): string {
	const formatter = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	})
	return formatter.format(i)
}

function toWord(n: number): string {
	switch (n) {
		case 1:
			return "one"
		case 2:
			return "two"
		case 3:
			return "three"
		case 4:
			return "four"
		case 5:
			return "five"
		case 6:
			return "six"
		default:
			return "d6"
	}
}

function removeAccents(str: string): string {
	return str
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "") // Remove accents
		.replace(/([^\w]+|\s+)/g, "-") // Replace space and other characters by hyphen
		.replace(/--+/g, "-") // Replaces multiple hyphens by one hyphen
		.replace(/(^-+|-+$)/g, "")
}

function capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1)
}

// function getAdjustedStudyHours(s: Study): number {
// 	switch (s.type) {
// 		case StudyType.Self:
// 			return s.hours * 0.5
// 		case StudyType.Job:
// 			return s.hours * 0.25
// 		case StudyType.Teacher:
// 			return s.hours
// 		case StudyType.Intensive:
// 			return s.hours * 2
// 	}
// }

function prepareFormData(formData: Record<string, unknown>, object: object): Record<string, unknown> {
	for (const aKey of Object.keys(formData)) {
		if (formData[aKey] === null) formData[aKey] = "0"
		if (aKey.includes(".halve_")) {
			const tKey = aKey.replace(/\.halve_.*$/, "")
			const tOp = aKey.split(".").at(-1)
			formData[`${tKey}.ops`] ??= []
			if (formData[aKey]) (formData[`${tKey}.ops`] as unknown[]).push(tOp)
			delete formData[aKey]
		}
	}
	for (const aKey of Object.keys(formData)) {
		if (aKey.startsWith("array.") && aKey.match(/\d/)) {
			const key = aKey.replace(/^array./g, "")
			const arrayKey = key.split(/.\d+./)[0]
			let array: object[] = (formData[arrayKey] as object[]) || (fu.getProperty(object, arrayKey) as object[])
			const index = parseInt(key.match(/.(\d+)./)![1])
			const prop = key.replace(new RegExp(`^${arrayKey}.${index}.`), "")
			array = setArrayProperty(array, index, prop, formData[aKey])
			formData[arrayKey] = array
			delete formData[aKey]
		} else if (aKey.startsWith("array.")) {
			formData[aKey.replace("array.", "")] = formData[aKey]
			delete formData[aKey]
			// HACK: stupid exception for static resource trackers only. remove in 2.0
		} else if (aKey.startsWith("sarray.") && aKey.match(/\d/)) {
			const key = aKey.replace(/^sarray./g, "")
			const arrayKey = `${key.split(/thresholds.\d+./)[0]}thresholds`
			const array: object[] = fu.getProperty(object, arrayKey) as object[]
			const index = parseInt(key.match(/thresholds.(\d+)./)![1])
			const prop = key.replace(new RegExp(`^${arrayKey}.${index}.`), "")
			setArrayProperty(array, index, prop, formData[aKey])
			formData[arrayKey] = array
			delete formData[aKey]
		}
	}
	return formData
}

/**
 *
 * @param a
 * @param index
 * @param prop
 * @param value
 */
function setArrayProperty(a: object[], index: number, prop: string, value: unknown): object[] {
	if (prop.match(/.\d+./)) {
		const inArrayKey = prop.split(/.\d+./)[0]
		const inArrayArray = fu.getProperty(a[index], inArrayKey) as object[]
		const inArrayIndex = parseInt(prop.match(/.(\d+)./)![1])
		const inArrayProp = prop.replace(`${inArrayKey}.${inArrayIndex}.`, "")
		fu.setProperty(a[index], inArrayKey, setArrayProperty(inArrayArray, inArrayIndex, inArrayProp, value))
		return a
	}
	fu.setProperty(a[index], prop, value)
	return a
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

async function urlToBase64(imageUrl: string): Promise<string> {
	const format = imageUrl.split(".").at(-1) || ""
	if (!["png", "webp", "jpg", "jpeg"].includes(format)) return ""
	const img: Blob = await fetch(imageUrl).then(v => v.blob())
	const bitmap = await createImageBitmap(img)
	const canvas = document.createElement("canvas")
	const ctx = canvas.getContext("2d")
	canvas.width = bitmap.width
	canvas.height = bitmap.height
	ctx?.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height)
	switch (format) {
		case "webp":
			return canvas.toDataURL("image/webp").replace("data:image/webp;base64,", "")
		case "png":
			return canvas.toDataURL("image/png").replace("data:image/png;base64,", "")
		case "jpeg":
		case "jpg":
			return canvas.toDataURL("image/jpeg").replace("data:image/png;base64,", "")
	}
	return ""
}

// function setInitiative(): void {
// 	let formula = game.settings.get(SYSTEM_NAME, SETTINGS.INITIATIVE_FORMULA)
// 	if (!formula) formula = DEFAULT_INITIATIVE_FORMULA
// 	if (game.user?.isGM) game.settings.set(SYSTEM_NAME, SETTINGS.INITIATIVE_FORMULA, formula)
// 	CONFIG.Combat.initiative.formula = formula
// }

function pick<T extends object, K extends keyof T>(obj: T, keys: Iterable<K>): Pick<T, K> {
	return [...keys].reduce(
		(result, key) => {
			if (key in obj) {
				result[key] = obj[key]
			}
			return result
		},
		{} as Pick<T, K>,
	)
}

async function getDefaultSkills(): Promise<void> {
	const skills: SkillResolver[] = []
	const skillPacks = game.settings.get(SYSTEM_NAME, SETTINGS.COMPENDIUM_BROWSER_PACKS).skill
	for (const s in skillPacks)
		if (skillPacks[s]?.skillDefault) {
			const pack = game.packs.get(s) as CompendiumCollection<Item<null>>
			;(await pack.getDocuments()).forEach(e => {
				skills.push(e as unknown as SkillResolver)
			})
		}
	CONFIG.GURPS.skillDefaults = skills
}

// function flatten(obj: object, flatObj: Record<string, object> = {}, key = ""): Record<string, object> | null {
//   if (obj === null) return null
//   for (const k of Object.keys(obj)) {
//     let valKey = key === "" ? k : `${key}.${k}`
//     if (typeof obj[k] === "object") {
//       if (Array.isArray(obj[k]) && !valKey.startsWith("array.")) valKey = `array.${valKey}`
//       flatten(obj[k], flatObj, valKey)
//     } else flatObj[valKey] = obj[k]
//   }
//   return flatObj
// }

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

function isContainer(item: { type: ItemType }): boolean {
	return [
		ItemType.TraitContainer,
		ItemType.SkillContainer,
		ItemType.SpellContainer,
		ItemType.EquipmentContainer,
		ItemType.TraitModifierContainer,
		ItemType.EquipmentModifierContainer,
		ItemType.NoteContainer,
	].includes(item.type as ItemType)
}

// function sheetSettingsFor(actor: CharacterResolver): SheetSettings {
// 	if (!actor) return
// }

function sheetDisplayNotes(
	s: string,
	options: { unsatisfied?: string; unready?: boolean } = { unsatisfied: "", unready: false },
): string {
	const buffer = new StringBuilder()
	if (options.unsatisfied && options.unsatisfied !== "")
		buffer.push(
			`<div class='unsatisfied' data-tooltip='${options.unsatisfied}' data-tooltip-direction='DOWN'>` +
				`<i class='gcs-triangle-exclamation'></i>${LocalizeGURPS.translations.gurps.prereq.unsatisfied}` +
				"</div>",
		)
	if (options.unready)
		buffer.push(
			"<div class='unsatisfied'>" +
				`<i class='gcs-triangle-exclamation'></i>${LocalizeGURPS.translations.gurps.weapon.unready}` +
				"</div>",
		)
	buffer.appendToNewLine(s)
	return `<div class="item-notes">${buffer.toString()}</div>`
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
			throw Error("I don't think that's a real camel.")
	}
}

type SlugCamel = "dromedary" | "bactrian" | null

function ErrorGURPS(message: string): Error {
	return Error(`GURPS | ${message}`)
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

/** Check if a value is present in the provided array. Especially useful for checking against literal tuples */
function tupleHasValue<const A extends readonly unknown[]>(array: A, value: unknown): value is A[number] {
	return array.includes(value)
}

/** Check if an element is present in the provided set. Especially useful for checking against literal sets */
function setHasElement<T extends Set<unknown>>(set: T, value: unknown): value is SetElement<T> {
	return set.has(value)
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

/** Short form of type and non-null check */
function isObject<T extends object>(value: unknown): value is DeepPartial<T>
function isObject<T extends string>(value: unknown): value is { [K in T]?: unknown }
function isObject(value: unknown): boolean {
	return typeof value === "object" && value !== null
}

export {
	ErrorGURPS,
	capitalize,
	d6ify,
	dollarFormat,
	extractTechLevel,
	fontAwesomeIcon,
	getCurrentTime,
	getDefaultSkills,
	getNewAttributeId,
	isContainer,
	isObject,
	newUUID,
	objectHasKey,
	pick,
	prepareFormData,
	removeAccents,
	sanitize,
	sanitizeId,
	setArrayProperty,
	setHasElement,
	// setInitiative,
	sheetDisplayNotes,
	sluggify,
	toWord,
	tupleHasValue,
	urlToBase64,
}
