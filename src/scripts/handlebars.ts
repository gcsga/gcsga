import { CharacterGURPS } from "@actor"
import { ItemGURPS, SkillGURPS } from "@item"
import { ItemType } from "@module/data/constants.ts"
import { DiceGURPS } from "@module/dice/index.ts"
import { Study } from "@system"
import { LocalizeGURPS, isContainer, localeDate, objectHasKey, rgbToHex, study } from "@util"
import { pageRef } from "@util/page-ref.ts"
import { SafeString } from "handlebars"

class HandlebarsHelpersGURPS {
	static rgbToHex(s: string): string {
		return rgbToHex(s)
	}

	static camelcase(s: string): string {
		let n = ""
		for (const word of s.split(" ")) {
			n = `${n}<span class="first-letter">${word.substring(0, 1)}</span>${word.substring(1)} `
		}
		return n
	}

	static isContainer(item: ItemGURPS): boolean {
		return isContainer(item)
	}

	static signed(n: number, replaceMinus = true): string {
		if (replaceMinus) return n >= 0 ? `+${n}` : `${String(n).replace("-", "−")}`
		return n >= 0 ? `+${n}` : `${String(n)}`
	}

	static modifierString(n: number): string {
		return `${n < 0 ? "-" : "+"} ${Math.abs(n)}`
	}

	static abs(n: number): number {
		return Math.abs(n)
	}

	// Return first argument which has a value
	static ror(...args: unknown[]): unknown {
		for (const arg of args) {
			if (arg !== undefined) return arg
		}
		return ""
	}

	static sum(...args: unknown[]): number {
		const arr: number[] = []
		for (const arg of args) {
			if (typeof arg === "string" && parseInt(arg)) arr.push(parseInt(arg))
			if (typeof arg === "number") arr.push(arg)
		}
		return arr.reduce((a, b) => a + b, 0)
	}

	static notEmpty(a: unknown[] | unknown): boolean {
		if (Array.isArray(a)) return !!a?.length
		return a ? Object.values(a).length > 0 : false
	}

	static blockLayout(blocks: string[], items: Record<string, { items: unknown[] }>): string {
		if (!blocks) return ""

		let outString = ""
		const line_length = 2

		for (const value of blocks) {
			let line = value
				.split(" ")
				.slice(0, line_length) // Get only first N items
				.filter(s => {
					if (objectHasKey(items, s)) {
						return (
							items[s].items.length > 0 ||
							!["reactions", "conditional_modifiers", "melee", "ranged"].includes(s)
						)
					}
					return false
				})
			if (!line.length) continue
			if (line_length > line.length) line = line.concat(Array(line_length - line.length).fill(line[0]))
			outString += `\n"${line.join(" ")}"`
		}

		outString += '\n"effects effects"'
		return outString
	}

	// Concat
	static cc(...args: unknown[]): string {
		return args.slice(0, -1).join("")
	}

	static json(a: object): string {
		return JSON.stringify(a)
	}

	static join(a: string[], s: string): string {
		if (!a || !a.length) return ""
		return a.join(s)
	}

	static arr(...args: unknown[]): unknown[] {
		const outArr: unknown[] = []
		for (const arg of args) {
			if (arg && typeof arg !== "object") outArr.push(arg)
		}
		return outArr
	}

	// TODO: change to variable init and step

	static indent(i: number, type: "padding" | "text" = "padding", init = -6, step = 12): string {
		// Const init = -6
		// const step = 12
		let sum = init
		sum += step * i
		if (type === "text") return `style="text-indent: ${sum}px;"`
		return `style="padding-left: ${sum}px;"`
		// Return `style="padding-left: ${sum}px;"`
	}

	// static spellValues(i: Item): string {
	// 	const sp = i as any
	// 	const values = {
	// 		resist: sp.system.resist,
	// 		spell_class: sp.system.spell_class,
	// 		casting_cost: sp.system.casting_cost,
	// 		maintenance_cost: sp.system.maintenance_cost,
	// 		casting_time: sp.system.casting_time,
	// 		duration: sp.system.duration,
	// 		college: sp.system.college,
	// 	}
	// 	const list = []
	// 	for (const [k, v] of Object.entries(values)) {
	// 		if (v && v !== "-") list.push(`${game.i18n.localize(`gurps.character.spells.${k}`)}: ${v}`)
	// 	}
	// 	return list.join("; ")
	// }

	static date(str: string): string {
		return localeDate(str)
	}

	// Lenght
	static len(...args: unknown[]): number {
		let length = 0
		for (const a of args) {
			if ((typeof a === "number" || typeof a === "string") && `${a}`.length > length) length = `${a}`.length
		}
		return length
	}

	static print(a: unknown, _options: object): void {
		console.log(a)
	}

	static format(s: string): string {
		return `${s}`.replace(/\n/g, "<br>")
	}

	static md(s: string): string {
		const showdown_options = {
			...CONST.SHOWDOWN_OPTIONS,
		}
		// @ts-expect-error Showdown not properly declared yet
		Object.entries(showdown_options).forEach(([k, v]) => showdown.setOption(k, v))
		// @ts-expect-error Showdown not properly declared yet
		const converter = new showdown.Converter()
		return converter.makeHtml(s)?.replace(/\s\+/g, "\r")
	}

	static ref(a: string): string {
		if (!a) return ""
		const references = a.split(",").map(e => {
			if (e.includes("http")) return [e, LocalizeGURPS.translations.gurps.character.link]
			return [e, e]
		})
		const buffer: string[] = []
		references.forEach((e, index) => {
			buffer.push(
				`<div class="ref" data-pdf="${e[0]}">${e[1]}${references.length > 1 && index < references.length - 1 ? "," : ""}</div>`,
			)
		})
		return buffer.join("")
	}

	static adjustedStudyHours(entry: Study): number {
		return entry.hours * study.Type.multiplier(entry.type)
	}

	static in(total: string | unknown[], sub: string): boolean {
		if (!total) total = ""
		if (Array.isArray(total)) return total.includes(sub)
		if (typeof total === "string") return total.includes(sub)
		return Object.keys(total).includes(sub)
	}

	// May be temporary
	static diceString(d: DiceGURPS): string {
		return new DiceGURPS(d).stringExtra(false)
	}

	static sort<K extends string>(list: Record<K, number>[], key: K): unknown[] {
		if (!list) return []
		return list.map(e => e).sort((a, b) => a[key] - b[key])
	}

	static textareaFormat(arr: string[]): string {
		if (!Array.isArray(arr)) {
			if (typeof arr === "string") return arr
			return ""
		}
		const s = arr.map(s => s.replace(/\t/g, "").replace(/\n/g, "\r")).join("\n")
		return s
	}

	static customArmorDivisorSelect(divisor: number, _options: unknown): number | undefined {
		const divisors = [0.1, 0.2, 0.5, 0, 1, 2, 3, 5, 10, 100]
		return divisors.includes(divisor) ? undefined : divisor
	}

	// TODO: remove
	// static rollable(value: any): string {
	// 	return value ? "rollable" : ""
	// }

	// static displayDecimal(num: number | string, options: any) {
	// 	if (num != null) {
	// 		num = parseFloat(num.toString())

	// 		let places = options.hash?.number ?? 1
	// 		num = num.toFixed(places).toString()
	// 		if (options.hash?.removeZeros) {
	// 			while (num.toString().endsWith("0")) num = num.substring(0, num.length - 1)
	// 			if (num.toString().endsWith(".")) num = num.substring(0, num.length - 1)
	// 		}

	// 		if (parseFloat(num) < 0) return num.toString().replace("-", "&minus;")

	// 		if (options.hash?.forceSign && num.toString()[0] !== "+") return `+${num}`
	// 		return num.toString()
	// 	} else return "" // Null or undefined
	// }

	// static displayNumber(num: string, options: any) {
	// 	let showPlus = options.hash?.showPlus ?? false
	// 	if (num != null) {
	// 		if (parseInt(num) === 0) return showPlus ? "+0" : "0"
	// 		if (parseInt(num) < 0) return num.toString().replace("-", "&minus;")
	// 		if (options !== false && num.toString()[0] !== "+") return `+${num}`
	// 		return num.toString()
	// 	} else return "" // Null or undefined
	// }

	// static hpFpCondition(type: "HP" | "FP", value: any, attr: string) {
	// 	function _getConditionKey(pts: any, conditions: Record<string, any>) {
	// 		let found = "NORMAL"
	// 		for (const [key, value] of Object.entries(conditions)) {
	// 			if (pts && pts.value > value.breakpoint(pts)) {
	// 				return found
	// 			}
	// 			found = key
	// 		}
	// 		return found
	// 	}
	// 	function hpCondition(HP: any, member: string) {
	// 		let key = _getConditionKey(HP, staticHpConditions)
	// 		return (staticHpConditions as any)[key][member]
	// 	}
	// 	function fpCondition(this: any, FP: any, member: string) {
	// 		let key = _getConditionKey(FP, staticFpConditions)
	// 		return (staticFpConditions as any)[key][member]
	// 	}
	// 	if (type === "HP") return hpCondition(value, attr)
	// 	if (type === "FP") return fpCondition(value, attr)
	// 	throw new Error(`hpFpCondition called with invalid type: [${type}]`)
	// }

	// static resourceCondition(r: StaticResourceTracker): string {
	// 	// Let threshold = r.thresholds[0].condition
	// 	let threshold = ""
	// 	for (const t of r.thresholds) {
	// 		if (
	// 			(t.comparison === StaticThresholdComparison.LessThan && r.value < r.max * t.value) ||
	// 			(t.comparison === StaticThresholdComparison.LessThanOrEqual && r.value <= r.max * t.value) ||
	// 			(t.comparison === StaticThresholdComparison.GreaterThan && r.value > r.max * t.value) ||
	// 			(t.comparison === StaticThresholdComparison.GreaterThanOrEqual && r.value >= r.max * t.value)
	// 		) {
	// 			threshold = t.condition
	// 			break
	// 		}
	// 	}
	// 	return threshold
	// }

	// static optionSetStyle(boolean) {
	// 	return boolean ? "buttonpulsatingred" : "buttongrey"
	// }

	// static hpFpBreakpoints(_type: "HP" | "FP", _value: any, _options: any) {
	// 	return []
	// }

	// static inCombat(data) {
	// 	if (data.actor && game.combats?.active) {
	// 		return game.combats?.active?.combatants.contents
	// 			.map((it: Combatant) => it.actor?.id)
	// 			.includes(data?.actor?.id)
	// 	}
	// 	return false
	// }

	// static select_if(value, expected) {
	// 	return value === expected ? "selected" : ""
	// }

	// static include_if(condition, iftrue, iffalse) {
	// 	if (arguments.length === 3) iffalse = ""
	// 	return condition ? iftrue : iffalse
	// }

	// static hitlocationroll() {
	// 	let data = {}
	// 	// Flatlist(context, 0, '', data, false)
	// 	return data
	// }

	// static hitlocationpenalty() {
	// 	let data = {}
	// 	// Flatlist(context, 0, '', data, false)
	// 	return data
	// }

	static overspent(actor: CharacterGURPS): boolean {
		// @ts-expect-error awaiting implementation
		return actor.unspentPoints < 0
	}

	// Static gmod() {
	// 	let data = {}
	// 	// Flatlist(context, 0, '', data, false)
	// 	return data
	// }

	// static staticBlockLayout(system: StaticCharacterSystemData) {
	// 	/**
	// 	 *
	// 	 * @param o
	// 	 */
	// 	function notEmpty(o: any) {
	// 		return o ? Object.values(o).length > 0 : false
	// 	}
	// 	const outAr = []
	// 	if (notEmpty(system.reactions) || notEmpty(system.conditionalmods)) {
	// 		if (!notEmpty(system.reactions)) outAr.push("conditional_modifiers conditional_modifiers")
	// 		else if (!notEmpty(system.conditionalmods)) outAr.push("reactions reactions")
	// 		else outAr.push("reactions conditional_modifiers")
	// 	}
	// 	if (notEmpty(system.melee)) outAr.push("melee melee")
	// 	if (notEmpty(system.ranged)) outAr.push("ranged ranged")
	// 	if (notEmpty(system.ads) || notEmpty(system.skills)) {
	// 		if (!notEmpty(system.ads)) outAr.push("skills skills")
	// 		else if (!notEmpty(system.skills)) outAr.push("traits traits")
	// 		else outAr.push("traits skills")
	// 	}
	// 	if (notEmpty(system.spells)) outAr.push("spells spells")

	// 	if (notEmpty(system.equipment?.carried)) outAr.push("equipment equipment")
	// 	if (notEmpty(system.equipment?.other)) outAr.push("other_equipment other_equipment")
	// 	if (notEmpty(system.notes)) outAr.push("notes notes")
	// 	return `"${outAr.join('" "')}";`
	// }

	// static flatlist(context: any) {
	// 	const data = {}
	// 	Static.flatList(context, 0, "", data, false)
	// 	return data
	// }

	// static staticSpellValues(i: StaticSpell): string {
	// 	const values = {
	// 		resist: i.resist,
	// 		spell_class: i.class,
	// 		casting_cost: i.cost,
	// 		maintenance_cost: i.maintain,
	// 		casting_time: i.casttime,
	// 		duration: i.duration,
	// 		college: i.college,
	// 	}
	// 	const list = []
	// 	for (const [k, v] of Object.entries(values)) {
	// 		if (v && v !== "-") list.push(`${game.i18n.localize(`gurps.character.spells.${k}`)}: ${v}`)
	// 	}
	// 	return list.join("; ")
	// }

	static modifierCost(c: { id: string; value: number }): string {
		return LocalizeGURPS.format(LocalizeGURPS.translations.gurps.system.modifier_bucket.cost, {
			value: c.value,
			id: c.id.toUpperCase(),
		})
	}

	static effective(a: SkillGURPS | { effective: number; current: number }): string {
		if (a instanceof Item) {
			if (a.type === ItemType.Skill) {
				const sk = a as SkillGURPS
				if (sk.effectiveLevel > sk.level.level) return "pos"
				if (sk.effectiveLevel > sk.level.level) return "neg"
				return ""
			}
		}
		const att = a as { effective: number; current: number }
		if (att.effective && att.current) {
			if (att.effective > att.current) return "pos"
			if (att.effective < att.current) return "neg"
		}
		return ""
	}

	static define<K extends string>(name: K, value: object, options: { data: { root: Record<K, object> } }): void {
		options.data.root[name] = value
	}

	static conditionalText(condition: boolean, ifTrue: string = "", ifFalse: string = ""): string {
		return condition ? ifTrue : ifFalse
	}

	static studyInfo(type: study.Type): string {
		return study.Type.info(type)
	}

	/**
	 * This is a copy of Foundry's selectOptions helper enhanced to support taking a list of options to disable.
	 * It's published as selectOptsGURPS to avoid conflicts with the original helper.
	 *
	 * @param choices
	 * @param options
	 * @returns
	 */
	static selectOptions(
		choices: Record<string, string>,
		options: { hash: Record<string, unknown> } & Record<string, unknown>,
	): SafeString {
		let {
			// eslint-disable-next-line prefer-const
			localize = false,
			// eslint-disable-next-line prefer-const
			selected = null,
			// eslint-disable-next-line prefer-const
			blank = null,
			// eslint-disable-next-line prefer-const
			sort = false,
			// eslint-disable-next-line prefer-const
			nameAttr,
			// eslint-disable-next-line prefer-const
			labelAttr,
			// eslint-disable-next-line prefer-const
			inverted,
			// eslint-disable-next-line prefer-const
			disabled = null,
		} = options.hash
		selected = selected instanceof Array ? selected.map(String) : [String(selected)]
		disabled = disabled instanceof Array ? disabled.map(String) : [String(disabled)]

		// Prepare the choices as an array of objects
		const selectOptions = []
		if (choices instanceof Array) {
			for (const choice of choices) {
				const name = String(choice[nameAttr as string])
				let label = choice[labelAttr as string]
				if (localize) label = game.i18n.localize(label)
				selectOptions.push({ name, label })
			}
		} else {
			for (const choice of Object.entries(choices)) {
				const [key, value] = inverted ? choice.reverse() : choice
				const name = String(nameAttr ? value[nameAttr as keyof String] : key)
				let label = labelAttr ? value[labelAttr as keyof String] : value
				if (localize) label = game.i18n.localize(label as string)
				selectOptions.push({ name, label })
			}
		}

		// Sort the array of options
		if (sort) selectOptions.sort((a, b) => a.label.localeCompare(b.label))

		// Prepend a blank option
		if (blank !== null) {
			const label = localize ? game.i18n.localize(blank as string) : blank
			selectOptions.unshift({ name: "", label })
		}

		// Create the HTML
		let html = ""
		for (const option of selectOptions) {
			const label = Handlebars.escapeExpression(option.label)
			const isSelected = (selected as string | string[]).includes(option.name)
			const isDisabled = (disabled as string | string[]).includes(option.name)
			html += `<option value="${option.name}" ${isSelected ? "selected" : ""} ${
				isDisabled ? "disabled" : ""
			}>${label}</option>`
		}
		return new Handlebars.SafeString(html)
	}

	static disabled(criteria: string | number | boolean | object): string {
		return criteria ? "disabled" : ""
	}

	static dropdown(item: ItemGURPS): string {
		if (!item.isOfType("container")) return ""
		if (item.system.open)
			return `<div class="dropdown"><a class="dropdown-toggle open gcs-circled-chevron-down"></a></div>`
		return `<div class="dropdown"><a class="dropdown-toggle closed gcs-circled-chevron-right"></a></div>`
	}
}

export function registerHandlebarsHelpers(): void {
	Handlebars.registerHelper({
		// Multiselect: HandlebarsHelpersGURPS.multiselect
		// flatlist: HandlebarsHelpersGURPS.flatlist,
		// spellValues: HandlebarsHelpersGURPS.spellValues,
		// staticSpellValues: HandlebarsHelpersGURPS.staticSpellValues,
		// unsatisfied: HandlebarsHelpersGURPS.unsatisfied,
		abs: HandlebarsHelpersGURPS.abs,
		adjustedStudyHours: HandlebarsHelpersGURPS.adjustedStudyHours,
		arr: HandlebarsHelpersGURPS.arr,
		blockLayout: HandlebarsHelpersGURPS.blockLayout,
		camelcase: HandlebarsHelpersGURPS.camelcase,
		concat: HandlebarsHelpersGURPS.cc,
		customArmorDivisorSelect: HandlebarsHelpersGURPS.customArmorDivisorSelect,
		date: HandlebarsHelpersGURPS.date,
		define: HandlebarsHelpersGURPS.define,
		diceString: HandlebarsHelpersGURPS.diceString,
		diff: (v1, v2) => v1 - v2,
		disabled: HandlebarsHelpersGURPS.disabled,
		dropdown: HandlebarsHelpersGURPS.dropdown,
		effective: HandlebarsHelpersGURPS.effective,
		format: HandlebarsHelpersGURPS.format,
		ifText: HandlebarsHelpersGURPS.conditionalText,
		in: HandlebarsHelpersGURPS.in,
		indent: HandlebarsHelpersGURPS.indent,
		isContainer: HandlebarsHelpersGURPS.isContainer,
		join: HandlebarsHelpersGURPS.join,
		json: HandlebarsHelpersGURPS.json,
		length: HandlebarsHelpersGURPS.len,
		md: HandlebarsHelpersGURPS.md,
		modifierCost: HandlebarsHelpersGURPS.modifierCost,
		modifierString: HandlebarsHelpersGURPS.modifierString,
		notEmpty: HandlebarsHelpersGURPS.notEmpty,
		overspent: HandlebarsHelpersGURPS.overspent,
		pageRef: pageRef,
		print: HandlebarsHelpersGURPS.print,
		ref: HandlebarsHelpersGURPS.ref,
		rgbToHex: HandlebarsHelpersGURPS.rgbToHex,
		ror: HandlebarsHelpersGURPS.ror,
		selectOptsGURPS: HandlebarsHelpersGURPS.selectOptions,
		signed: HandlebarsHelpersGURPS.signed,
		sort: HandlebarsHelpersGURPS.sort,
		studyInfo: HandlebarsHelpersGURPS.studyInfo,
		sum: HandlebarsHelpersGURPS.sum,
		textareaFormat: HandlebarsHelpersGURPS.textareaFormat,
	})
}

export { HandlebarsHelpersGURPS }
