/* eslint-disable @typescript-eslint/no-explicit-any */
// import { StaticCharacterGURPS, StaticTrait } from "@actor/index.ts"
// import { StaticItemGURPS } from "@item/index.ts"
// import { getProperty } from "types/foundry/common/utils/helpers.js"

import { StaticCharacterGURPS } from "@actor"
import { StaticTrait } from "@actor/static/components.ts"
import { StaticItemGURPS } from "@item"
import { objectHasKey } from "./misc.ts"

// /**
//  *
//  * @param list
//  * @param fn
//  * @param parentKey
//  * @param depth
//  */
export function recurseList(
	list: {
		[key: string]: any
	},
	fn: (value: any, key: string, depth: number) => boolean | void | Promise<boolean | void>,
	parentKey = "",
	depth = 0,
): void {
	if (list)
		for (const [key, value] of Object.entries(list)) {
			if (fn(value, parentKey + key, depth) !== false) {
				recurseList(value.contains, fn, `${parentKey + key}.contains`, depth + 1)
				recurseList(value.collapsed, fn, `${parentKey + key}.collapsed`, depth + 1)
			}
		}
}

// /**
//  *
//  * @param actor
//  * @param sname
//  */
export function findAdDisad(actor: StaticCharacterGURPS, sname: string): StaticTrait | null {
	let t: StaticTrait | null = null
	if (!actor) return t
	sname = makeRegexPatternFrom(sname, false)
	const regex = new RegExp(sname, "i")
	recurseList(actor.system.ads, s => {
		if (s.name.match(regex)) {
			t = s
		}
	})
	return t
}

// /**
//  *
//  * @param text
//  * @param end
//  * @param start
//  */
export function makeRegexPatternFrom(text: string, end = true, start = true): string {
	// Defaults to exact match
	const pattern = text
		.split("*")
		.join(".*?")
		.replaceAll(/\(/g, "\\(")
		.replaceAll(/\)/g, "\\)")
		.replaceAll(/\[/g, "\\[")
		.replaceAll(/\]/g, "\\]")
	return `${start ? "^" : ""}${pattern.trim()}${end ? "$" : ""}`
}

// /**
//  *
//  * @param string
//  */
export function extractP(string: string): string {
	let v = ""
	if (string) {
		const s = string.split("\n")
		for (let b of s) {
			if (b) {
				if (b.startsWith("@@@@")) {
					b = b.substring(4)
					// V += atou(b) + '\n'
					v += `${b}\n`
				} else v += `${b}\n`
			}
		}
	}
	// Maybe a temporary fix? There are junk characters at the start and end of
	// this string after decoding. Example: ";p&gt;Heavy Mail Hauberk↵/p>↵"
	return v
		.replace(/^;p&gt;/, "")
		.replace(/\n$/, "")
		.replace(/\/p>$/, "")
}

// /**
//  *
//  * @param text
//  */
export function convertRollStringToArrayOfInt(text: string): number[] {
	const elements = text.split("-")
	const range = elements.map(it => parseInt(it))

	if (range.length === 0) return []

	for (let i = 0; i < range.length; i++) {
		if (typeof range[i] === "undefined" || isNaN(range[i])) return []
	}

	const results = []
	for (let i = range[0]; i <= range[range.length - 1]; i++) results.push(i)

	return results
}

// /**
//  *
//  * @param obj
//  * @param value
//  * @param index
//  */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function put(obj: any, value: unknown, index = -1): string {
	if (index === -1) {
		index = 0
		while (obj[zeroFill(index)]) index += 1
	}
	const k = zeroFill(index)
	obj[k] = value
	return k
}

// /**
//  *
//  * @param number
//  * @param width
//  */
export function zeroFill(number: number, width = 5): string {
	width -= number.toString().length
	if (width > 0) {
		return new Array(width + (/\./.test(number.toString()) ? 2 : 1)).join("0") + number
	}
	return `${number}` // Always return a string
}

// /**
//  *
//  * @param context
//  * @param level
//  * @param parentkey
//  * @param data
//  * @param isCollapsed
//  * @param actorToCheckEquipment
//  */
// export function flatList(
// 	context: any,
// 	level: number,
// 	parentkey: string,
// 	data: any,
// 	isCollapsed: boolean,
// 	actorToCheckEquipment?: StaticCharacterGURPS,
// ) {
// 	if (!context) return data
//
// 	for (const key in context) {
// 		const item = context[key]
// 		let display = true
// 		if (actorToCheckEquipment) {
// 			// If we have been given an actor,
// 			// then check to see if the melee or ranged item is equipped in the inventory
// 			let checked = false
// 			recurseList(actorToCheckEquipment.system.equipment.carried, e => {
// 				// Check
// 				if (item.name.startsWith(e.name)) {
// 					checked = true
// 					if (!e.equipped) display = false
// 				}
// 			})
// 			if (!checked)
// 				recurseList(actorToCheckEquipment.system.equipment.other, e => {
// 					if (item.name.startsWith(e.name)) display = false
// 				})
// 		}
// 		if (display) {
// 			const newKey = parentkey + key
//
// 			const newItem: any = { indent: level }
// 			for (const propertyKey in item) {
// 				if (!["contains", "collapsed", "indent"].includes(propertyKey)) {
// 					newItem[propertyKey] = item[propertyKey]
// 				}
// 			}
// 			newItem.hasCollapsed = !!item?.collapsed && Object.values(item?.collapsed).length > 0
// 			newItem.hasContains = !!item?.contains && Object.values(item?.contains).length > 0
// 			newItem.isCollapsed = isCollapsed
//
// 			data[newKey] = newItem
//
// 			if (newItem.hasContains) flatList(item.contains, level + 1, `${newKey}.contains.`, data, isCollapsed)
// 			if (newItem.hasCollapsed) flatList(item.collapsed, level + 1, `${newKey}.collapsed.`, data, true)
// 		}
// 	}
// 	return data
// }

// /**
//  *
//  * @param actor
//  * @param path
//  * @param newobj
//  */
export async function insertBeforeKey(actor: StaticCharacterGURPS, path: string, newobj: object): Promise<void> {
	let i = path.lastIndexOf(".")
	const objpath = path.substring(0, i)
	const key = path.substring(i + 1)
	i = objpath.lastIndexOf(".")
	const parentpath = objpath.substring(0, i)
	const objkey = objpath.substring(i + 1)
	const object = fu.getProperty(actor, objpath) as any
	const t = `${parentpath}.-=${objkey}`
	await actor.update({ [t]: null }) // Delete the whole object
	const start = parseInt(key)

	i = start + 1
	while (Object.prototype.hasOwnProperty.call(object, zeroFill(i))) i += 1
	i = i - 1
	for (let z = i; z >= start; z--) {
		object[zeroFill(z + 1)] = object[zeroFill(z)]
	}
	object[key] = newobj
	const sorted = Object.keys(object)
		.sort()
		.reduce((a: any, v) => {
			a[v] = object[v]
			return a
		}, {}) // Enforced key order
	await actor.update({ [objpath]: sorted }, { diff: false })
}

// /**
//  * Convolutions to remove a key from an object and fill in the gaps, necessary
//  * because the default add behavior just looks for the first open gap
//  * @param {GurpsActor} actor
//  * @param {string} path
//  */
export async function removeKey(actor: StaticCharacterGURPS | StaticItemGURPS, path: string): Promise<void> {
	let i = path.lastIndexOf(".")
	const objpath = path.substring(0, i)
	let key = path.substring(i + 1)
	i = objpath.lastIndexOf(".")
	const parentpath = objpath.substring(0, i)
	const objkey = objpath.substring(i + 1)
	const object = decode(actor, objpath)
	const t = `${parentpath}.-=${objkey}`
	await actor.update({ [t]: null }, { render: false }) // Delete the whole object
	delete object[key]
	i = parseInt(key)

	i = i + 1
	while (objectHasKey(object, zeroFill(i))) {
		const k = zeroFill(i)
		object[key] = object[k]
		delete object[k]
		key = k
		i += 1
	}
	const sorted = Object.keys(object)
		.sort()
		.reduce((a: any, v) => {
			a[v] = object[v]
			return a
		}, {}) // Enforced key order
	await actor.update({ [objpath]: sorted }, { diff: false, render: true })
}

// /**
//  *
//  * @param obj
//  * @param path
//  * @param all
//  */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function decode(obj: any, path: string, all = true): any {
	const p = path.split(".")
	let end = p.length
	if (!all) end = end - 1
	for (let i = 0; i < end; i++) {
		const q = p[i]
		obj = obj[q]
	}
	return obj
}
