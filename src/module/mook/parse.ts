import { gid, SETTINGS, SYSTEM_NAME } from "@module/data"
import { sanitize } from "@util"
import { MookMelee, MookRanged, MookSkill, MookSpell, MookTrait, MookTraitModifier } from "./data"
import { Mook } from "./document"
import { WeaponDamageObj } from "@item/weapon/data"
import { DiceGURPS } from "@module/dice"
import { difficulty, stdmg } from "@util/enum"

const regex_points = /\[(-?\d+)\]/
const damage_type_matches: Map<string, string> = new Map([
	["pi", "pi"],
	["pierce", "pi"],
	["piercing", "pi"],
	["cr", "cr"],
	["crush", "cr"],
	["crushing", "cr"],
	["pi-", "pi-"],
	["small pierce", "pi-"],
	["small piercing", "pi-"],
	["pi+", "pi+"],
	["large pierce", "pi+"],
	["large piercing", "pi+"],
	["pi++", "pi++"],
	["huge pierce", "pi++"],
	["huge piercing", "pi++"],
	["burn", "burn"],
	["burning", "burn"],
	["imp", "imp"],
	["impale", "imp"],
	["impaling", "imp"],
	["cut", "cut"],
	["cutting", "cut"],
	["injury", "injury"],
	["cor", "cor"],
	["corrosion", "cor"],
	["corrosive", "cor"],
	["tox", "tox"],
	["toxic", "tox"],
])
const regex_damage_type = new RegExp(
	`\\s+\\b(${Array.from(damage_type_matches.keys())
		.map(e => e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
		.join("|")})\\b`
)
const regex_difficulty = /\((?:[A-z]+\/)?([EAHVeahv][Hh]?)\)/

export class MookParser {
	text: string

	object: Mook


	constructor(text: string, object: Mook) {
		this.text = text
		this.object = object
	}

	static init(text?: string, object?: Mook) {
		text ??= ""
		object ??= new Mook()
		return new MookParser(text, object)
	}

	parseStatBlock(text: string): any {
		this.text = this.sanitizeStatBlock(text)
		this.object.profile.name = this.parseName(this.text)
			;[this.object.melee, this.object.ranged] = this.parseAttacks(this.text)
		this.parseAttributes()
		this.object.traits = this.parseTraits()
		this.object.skills = this.parseSkills()
		this.object.spells = this.parseSpells()
		// this.parseEquipment()
		const [moreMelee, moreRanged] = this.parseAttacks(this.text, true)
		this.object.melee.push(...moreMelee)
		this.object.ranged.push(...moreRanged)
		this.object.text.catchall = this.text
		return this.object
	}

	sanitizeStatBlock(text: string): string {
		text = sanitize(text)
		text = text.replace(/\t/g, "; ") // replace tabs with '; '
		text = text.replace(/ +/g, " ") // remove multiple spaces in a row
		text = text.replace(/[^ -~\n]+/g, "") // remove remaining non-ascii
		return this.cleanLine(text) // trim and remove leading and trailing periods.
	}

	private extractText(startMatches: string[], endMatches: string[], cut = true): string {
		const start = startMatches.length === 0 ? 0 : this.findInText(startMatches)
		if (start === -1) {
			return ""
		}
		const end = this.findInText(endMatches)
		if (end === -1) {
			const extracted = this.text.slice(start)
			if (cut) this.text = this.text.slice(0, start)
			return extracted
		}
		const extracted = this.text.slice(start, end)
		if (cut) this.text = this.text.slice(0, start) + this.text.slice(end)
		return extracted
	}

	private findInText(matches: string[], start = 0): number {
		const text = this.text.substring(start)
		for (const match of matches) {
			const index = text.indexOf(match)
			if (index !== -1) return index
		}
		return -1
	}

	private cleanLine(text: string): string {
		const start = text
		if (!text) return text
		let pat = "*,.:" // things that just clutter up the text
		if (pat.includes(text[0])) text = text.substring(1)
		if (pat.includes(text[text.length - 1])) text = text.substring(0, text.length - 1)
		text = text.trim()
		return start === text ? text : this.cleanLine(text)
	}

	private parseName(input = this.text): string {
		input = this.cleanLine(input)
		const name = input.split("\n")[0]
		return name
	}

	private parseAttributes(): void {
		this.text = this.cleanLine(this.text)
		const attribute_names: { id: string; match: string }[] = []
		game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`).forEach(e => {
			attribute_names.push({ id: e.id.toLowerCase(), match: e.id.toLowerCase() })
			if (e.name && e.name !== "") attribute_names.push({ id: e.id.toLowerCase(), match: e.name.toLowerCase() })
			if (e.full_name && e.full_name !== "")
				attribute_names.push({ id: e.id.toLowerCase(), match: e.full_name.toLowerCase() })
		})
		attribute_names.push({ id: gid.BasicSpeed, match: "speed" }, { id: gid.BasicMove, match: "move" })

		const preText = this.extractText([], ["Advantages:", "Advantages/Disadvantages:", "Traits:"])

		const regex_att = new RegExp(`(${attribute_names.map(e => e.match).join("|")}):?[\\n\\s]*(\\d+.?\\d*)`, "g")

		let text = ""
		let leftOverText = ""
		preText
			.replaceAll("\n", " ")
			.toLowerCase()
			.match(regex_att)
			?.forEach(match => {
				text += `${match};`
			})
		this.text = `${leftOverText}\n${this.text}`

		// Assemble list of final values of attributes
		const newValues: Map<string, number> = new Map()
		text.split(";").forEach(t => {
			t = t.trim()
			if (!t) return
			let id = ""
			for (const e of attribute_names) {
				if (t.match(e.match)) {
					id = e.id
					break
				}
				if (e.match.includes(" "))
					for (const f of e.match.split(" ")) {
						if (t.match(f)) {
							id = e.id
							break
						}
					}
			}
			if (!id) return
			const newValue = parseFloat(t.match(/\d+\.?\d*/)?.[0] || "0")
			newValues.set(id, newValue)
		})

		this.object.attributes = this.object.getAttributes()

		// While loop to account for attributes which affect other attributes
		// hard-capped at 5 iterations to prevent infinite loop, may result in inaccuracies
		for (let i = 0; i < 5; i++) {
			if (!Array.from(newValues).some(([k, _v]) => newValues.get(k) !== this.object.attributes.get(k)?.max)) break
			for (const id of newValues.keys()) {
				const [newValue, currentValue] = [newValues.get(id), this.object.attributes.get(id)!.max]
				if (!newValue || !currentValue) continue
				if (newValue === currentValue) continue
				const index = this.object.system.attributes.findIndex(e => e.attr_id === id)
				this.object.system.attributes[index].adj += newValue - currentValue
			}
			this.object.attributes = this.object.getAttributes()
		}
	}

	parseTraits(input = this.text, skipSeparation = false): MookTrait[] {
		const regex_levels = /\s(\d+)$/
		const regex_cr = /\((CR:?)?\s*(\d+)\)/

		let text = ""
		if (skipSeparation) {
			text = input
		} else {
			text = this.extractText(["Advantages:", "Advantages/Disadvantages:", "Traits:"], ["Skills:", "Spells:"])
			if (text.includes(";")) text = text.replace(/\n/g, " ") // if ; separated, remove newlines
			else if (text.split(",").length > 2) text = text.replace(/,/g, " ") // if , separated, replace with ;
			text = text.replace(/advantages\/disadvantages:?/gi, ";")
			text = text.replace(/disadvantages:?/gi, ";")
			text = text.replace(/advantages:?/gi, ";")
			text = text.replace(/perks:?/gi, ";")
			text = text.replace(/quirks:?/gi, ";")
			text = text.replace(/traits:?/gi, ";")
			text = text.trim()
		}

		const traits: MookTrait[] = []

		text.split(";").forEach(t => {
			if (!t.trim()) return

			// Capture points
			let points = 0
			if (t.match(regex_points)) {
				points = parseInt(t.match(regex_points)?.[1] ?? "0")
				t = t.replace(regex_points, "").trim()
			}

			// Capture modifiers
			let modifiers: MookTraitModifier[] = []
			if (t.match(/\(.+\)/)) {
				modifiers = this.parseTraitModifiers(t.match(/\((.*)\)/)![1])
				if (modifiers.length > 0) t = t.replace(/\(.*\)/, "").trim()
			}

			// Capture Levels
			let levels = 0
			if (t.match(regex_levels)) {
				levels = parseInt(t.match(regex_levels)![1])
				t = t.replace(regex_levels, "").trim()
			}

			// Capture CR
			let cr = 0
			if (t.match(regex_cr)) {
				cr = parseInt(t.match(regex_cr)![2])
				t = t.replace(regex_cr, "").trim()
			}

			t = this.cleanLine(t)

			const trait = new MookTrait({
				name: t,
				points,
				cr,
				levels,
				notes: "",
				reference: "",
				modifiers,
			})
			traits.push(trait)
		})
		return traits
	}

	private parseTraitModifiers(text: string): MookTraitModifier[] {
		const modifiers: MookTraitModifier[] = []
		const textmods = text.split(";")
		textmods.forEach(m => {
			if (m.split(",").length === 2 && m.split(",")[1].match(/[+-]?\d+%?/)) {
				// assumes common format for modifier notation
				const mod = m.split(",")
				modifiers.push(
					new MookTraitModifier({
						name: mod[0].trim(),
						cost: mod[1].trim(),
						notes: "",
						reference: "",
					})
				)
			}
		})
		return modifiers
	}

	parseSkills(input = this.text, skipSeparation = false): MookSkill[] {
		const attributes: { name: string; id: string }[] = [
			...game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`).map((e: any) => {
				return { id: e.id, name: e.name }
			}),
			...game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`).map((e: any) => {
				return { id: e.id, name: e.id }
			}),
		]

		const regex_level = /\s?-(\d+)/
		const regex_difficulty_att = new RegExp(`\\((${attributes.map(e => e.name).join("|")})/([EAHVeahv][Hh]?)\\)`)
		const regex_rsl = new RegExp(`[\\(|\\s](${attributes.map(e => e.name).join("|")})([-+]\\d+)?[\\)|\\s]?`)
		const regex_specialization = /^(?:[A-z-\s]+) \(([A-z-\s]+)\)/
		const regex_tl = /\/TL(\d+\^?)/

		let text = ""
		if (skipSeparation) text = input
		else
			text = this.extractText(
				["Skills:"],
				["Spells:", "Equipment:", "Language:", "Languages:", "Weapons:", "Class:", "Notes:", "*"]
			)

		text = text.replace(/skills:?/gi, " ")
		text = this.cleanLine(text)
		text = text.replaceAll(/\.\n/g, ";").replaceAll(",", ";")
		text = text.trim()

		const skills: MookSkill[] = []

		text.split(";").forEach(t => {
			t = this.cleanLine(t).trim().replace("\n", "")
			if (!t) return

			// Capture points
			let points = 0
			if (t.match(regex_points)) {
				points = parseInt(t.match(regex_points)?.[1] ?? "0")
				t = t.replace(regex_points, "").trim()
			}

			// Capture level
			let level = 0
			if (t.match(regex_level)) {
				level = parseInt(t.match(regex_level)![1])
				t = t.replace(regex_level, "").trim()
			}

			// Capture difficulty
			let attribute: string = gid.Dexterity.toUpperCase()
			let diff = difficulty.Level.Average.toUpperCase()
			if (t.match(regex_difficulty_att)) {
				const match = t.match(regex_difficulty_att)
				attribute = attributes.find(e => e.name === match![1])?.id ?? gid.Intelligence.toUpperCase()
				diff = match![2].toLowerCase() as difficulty.Level
				t = t.replace(regex_difficulty, "").trim()
			} else if (t.match(regex_difficulty)) {
				diff = t.match(regex_difficulty)![1].toLowerCase() as difficulty.Level
				t = t.replace(regex_difficulty, "").trim()
			}

			// Capture RSL
			if (t.match(regex_rsl)) {
				const match = t.match(regex_rsl)!
				attribute = attributes.find(e => e.name === match[1])?.id ?? gid.Dexterity.toUpperCase()
				t = t.replace(regex_rsl, "").trim()
			}

			// Capture specialization
			let specialization = ""
			if (t.match(regex_specialization)) {
				specialization = t.match(regex_specialization)![1]
				t = t.replace(new RegExp(`\\s*\\(${specialization}\\)`), "").trim()
			}


			// Capture TL
			let tl = ""
			if (t.match(regex_tl)) {
				tl = t.match(regex_tl)![1]
				t = t.replace(regex_tl, "").trim()
			}

			t = this.cleanLine(t)

			const skill = new MookSkill({
				name: t,
				attribute: attribute,
				difficulty: diff,
				points,
				level,
				specialization,
				tech_level: tl,
				notes: "",
				reference: "",
			})
			skills.push(skill)
		})
		return skills
	}

	parseSpells(input = this.text, skipSeparation = false): MookSpell[] {
		const attributes: { name: string; id: string }[] = [
			...game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`).map((e: any) => {
				return { id: e.id, name: e.name }
			}),
			...game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`).map((e: any) => {
				return { id: e.id, name: e.id }
			}),
		]

		const regex_level = /\s?-(\d+)/
		const regex_difficulty_att = new RegExp(`\\((${attributes.map(e => e.name).join("|")})/([EAHVeahv][Hh]?)\\)`)
		const regex_rsl = new RegExp(`[\\(|\\s](${attributes.map(e => e.name).join("|")})([-+]\\d+)?[\\)|\\s]?`)
		const regex_tl = /\/TL(\d+\^?)/

		let text = ""
		if (skipSeparation) text = input
		else
			text = this.extractText(
				["Spells:"],
				["Equipment:", "Language:", "Languages:", "Weapons:", "Class:", "Notes:"]
			)

		text = text.replace(/spells:?/gi, ";")
		text = text.replace(/^.*:\n/, ";")
		text = this.cleanLine(text)
		text = text.replaceAll(/\.\n/g, ";").replaceAll(",", ";")
		text = text.trim()

		const spells: MookSpell[] = []

		text.split(";").forEach(t => {
			t = this.cleanLine(t).trim().replace("\n", "")
			if (!t) return

			// Capture points
			let points = 0
			if (t.match(regex_points)) {
				points = parseInt(t.match(regex_points)?.[1] ?? "0")
				t = t.replace(regex_points, "").trim()
			}

			// Capture level
			let level = 0
			if (t.match(regex_level)) {
				level = parseInt(t.match(regex_level)![1])
				t = t.replace(regex_level, "").trim()
			}

			// Capture difficulty
			let attribute: string = gid.Intelligence.toUpperCase()
			let diff = difficulty.Level.Hard.toUpperCase()
			if (t.match(regex_difficulty_att)) {
				const match = t.match(regex_difficulty_att)
				attribute = attributes.find(e => e.name === match![1])?.id ?? gid.Intelligence.toUpperCase()
				diff = match![2].toLowerCase() as difficulty.Level
				t = t.replace(regex_difficulty, "").trim()
			} else if (t.match(regex_difficulty)) {
				diff = t.match(regex_difficulty)![1].toLowerCase() as difficulty.Level
				t = t.replace(regex_difficulty, "").trim()
			}

			if (t.match(regex_rsl)) {
				const match = t.match(regex_rsl)!
				attribute = attributes.find(e => e.name === match[1])?.id ?? gid.Intelligence.toUpperCase()
				t = t.replace(regex_rsl, "").trim()
			}

			// Capture TL
			let tl = ""
			if (t.match(regex_tl)) {
				tl = t.match(regex_tl)![1]
				t = t.replace(regex_tl, "").trim()
			}

			t = this.cleanLine(t)

			const spell = new MookSpell({
				name: t,
				college: [],
				attribute: attribute,
				difficulty: diff,
				points,
				level,
				tech_level: tl,
				notes: "",
				reference: "",
			})
			spells.push(spell)
		})
		return spells
	}

	parseDamage(input: string): [WeaponDamageObj, string] {
		const regex_full_damage = /(\d+d)([+-]\d+)?\s*(\(\d+\))?\s+\w+/
		const regex_armor_divisor = /\((\d+)\)/

		const damage: WeaponDamageObj = {
			type: "",
			st: stdmg.Option.None,
			base: "",
			armor_divisor: 1,
			fragmentation: "",
			fragmentation_armor_divisor: 1,
			fragmentation_type: "",
			modifier_per_die: 0,
		}

		let base = ""

		// capture whole damage string
		if (input.match(regex_full_damage)) {
			base = input.match(regex_full_damage)?.[0] ?? base
			const inputArr = input.split(base)
			if (inputArr.length > 1) input = `{{${inputArr[0].trim()} ${inputArr[1].trim()}}}`
			else input = `{{${inputArr[0]}}}`
		}
		if (base === "") return [damage, input]

		// capture armor divisor if any
		if (base.match(regex_armor_divisor)) {
			damage.armor_divisor = parseInt(base.match(regex_armor_divisor)?.[1] ?? "1")
			base = base.replace(`(${damage.armor_divisor})`, "").trim()
		}

		// capture damage type
		if (base.match(regex_damage_type)) {
			damage.type = damage_type_matches.get(base.match(regex_damage_type)?.[1] ?? "") ?? ""
			base = base.replace(`${base.match(regex_damage_type)?.[0]}`, "").trim()
		}

		// capture damage dice
		damage.base = new DiceGURPS(base).string
		base = base.replace(damage.base, "").trim()
		return [damage, input]
	}

	parseAttacks(input = this.text, oldFormat = false, skipSeparation = false): [MookMelee[], MookRanged[]] {
		const regex_acc = /\s?[Aa]cc:?\s*(\d+)\s?,?/
		const regex_rof = /\s?[Rr]o[Ff]:?\s*(\d+)\s?,?/
		const regex_recoil = /\s?[Rr]cl:?\s*(\d+)\s?,?/
		const regex_half_damage = /\s?1\/2[Dd]:?\s*(\d+)\s?,?/
		const regex_max_range = /\s?[Mm]ax:?\s*(\d+) ?,?/
		const regex_shots = /\s?[Ss]hots:?\s*([\dT)(]+)\s?,?/
		const regex_bulk = /\s?[Bb]ulk:?\s*(-\d+)\s?,?/
		const regex_ST = / ?[Ss][Tt]:? *(\d+)\s?,?/
		const regex_reach = /\s?[Rr]each:?\s*((?:[C1-9]+\s*)(?:,\s*[C1-9]+\s*)*)/
		const regex_range = /\s?[Rr]ange:?\s*([0-9/]+)\s*,?/
		const regex_level = /\((\d+)\):/
		const regex_parry = /\s?[Pp]arry:?\s*(No|[0-9]+[FfUu]*)/
		const regex_block = /\s?[Bb]lock:?\s*(No|[0-9]+)/

		let text = ""
		let weapons = ""
		if (skipSeparation) weapons = input
		else {
			if (oldFormat) text = input
			else {
				text = this.extractText([], ["Traits:"])
			}

			weapons = ""
			let beforeText = ""
			let afterText = ""

			// if we come across a line which isn't accepted, don't bother with the rest
			let last_matched = 0
			let at_least_one_level = false
			text.split("\n").forEach(e => {
				if (last_matched > 1 && weapons.length !== 0) {
					afterText += `${e}\n`
					return
				}
				if (e.match(/^(\w+\s+)*\(\d+\):?/)) {
					weapons += `${e}\n`
					at_least_one_level = true
					last_matched = 0
				} else if (
					at_least_one_level &&
					(e.match(regex_acc) ||
						e.match(regex_rof) ||
						e.match(regex_recoil) ||
						e.match(regex_half_damage) ||
						e.match(regex_max_range) ||
						e.match(regex_shots) ||
						e.match(regex_bulk) ||
						e.match(regex_ST) ||
						e.match(regex_reach) ||
						e.match(regex_range))
				) {
					weapons += `${e}\n`
					last_matched = 0
				} else if (weapons.length !== 0) {
					weapons += `${e}\n`
					last_matched++
				} else {
					beforeText += `${e}\n`
				}
			})

			if (oldFormat) this.text = beforeText + afterText
			else this.text = `${beforeText + this.text}\n${afterText}`.replace(weapons, "")

			if (weapons.includes(".\n")) weapons = weapons.replace(/\.\n/g, ";")

			weapons = (() => {
				let final = ""
				const list = weapons.split(";")
				for (let line of list) {
					line = line.replace(/\n/, " ")
					if (line.match(/^(\w+\s+)*\(\d+\):?/)) final += `; ${this.cleanLine(line).trim()}`
					else final += ` ${this.cleanLine(line).trim()}`
				}

				return final
			})()
		}

		const melee: MookMelee[] = []
		const ranged: MookRanged[] = []
		weapons.split(";").forEach(t => {
			const reference = ""
			let notes = ""

			t = this.cleanLine(t).trim()
			if (!t) return

			let isRanged = false

			// Capture level and name
			let name = ""
			let level = 0
			if (t.match(regex_level)) {
				level = parseInt(t.match(regex_level)![1])
				name = t.split(t.match(regex_level)![0])[0].trim()
				t = t.replace(regex_level, "").replace(name, "").trim()
			}

			// Capture ST
			let ST = "0"
			if (t.match(regex_ST)) {
				ST = String(parseInt(t.match(regex_ST)![1]))
				t = t.replace(regex_ST, "").trim()
			}

			// Capture accuracy
			let accuracy = "0"
			if (t.match(regex_acc)) {
				isRanged = true
				accuracy = String(parseInt(t.match(regex_acc)![1]))
				t = t.replace(regex_acc, "").trim()
			}

			// Capture ROF
			let rof = "0"
			if (t.match(regex_rof)) {
				isRanged = true
				rof = String(parseInt(t.match(regex_rof)![1]))
				t = t.replace(regex_rof, "").trim()
			}

			// Capture recoil
			let recoil = "0"
			if (t.match(regex_recoil)) {
				isRanged = true
				recoil = String(parseInt(t.match(regex_recoil)![1]))
				t = t.replace(regex_recoil, "").trim()
			}
			// Capture halfdamage
			let half_damage = 0
			if (t.match(regex_half_damage)) {
				isRanged = true
				half_damage = parseInt(t.match(regex_half_damage)![1])
				t = t.replace(regex_half_damage, "").trim()
			}

			// Capture max range
			let max_range = 0
			if (t.match(regex_max_range)) {
				isRanged = true
				max_range = parseInt(t.match(regex_max_range)![1])
				t = t.replace(regex_max_range, "").trim()
			}

			// Capture shots
			let shots = "0"
			if (t.match(regex_shots)) {
				isRanged = true
				shots = t.match(regex_shots)![1]
				t = t.replace(regex_shots, "").trim()
			}

			// Capture bulk
			let bulk = "0"
			if (t.match(regex_bulk)) {
				isRanged = true
				bulk = String(parseInt(t.match(regex_bulk)![1]))
				t = t.replace(regex_bulk, "").trim()
			}

			// Capture range
			let range = "0"
			if (t.match(regex_range)) {
				isRanged = true
				range = t.match(regex_range)![1]
				t = t.replace(regex_range, "").trim()
			}

			// Capture reach
			let reach = ""
			if (t.match(regex_reach)) {
				// trim required here as regex grabs whitespace at end
				reach = t.match(regex_reach)![1].trim()
				t = t.replace(regex_reach, "").trim()
			}

			// Capture parry
			let parry = "No"
			if (t.match(regex_parry)) {
				// trim required here as regex grabs whitespace at end
				reach = t.match(regex_parry)![1].trim()
				t = t.replace(regex_parry, "").trim()
			}

			// Capture block
			let block = "No"
			if (t.match(regex_block)) {
				// trim required here as regex grabs whitespace at end
				reach = t.match(regex_block)![1].trim()
				t = t.replace(regex_block, "").trim()
			}

			t = t.trim()

			let damage: WeaponDamageObj = {
				type: "",
				st: stdmg.Option.None,
				base: "",
				armor_divisor: 1,
				fragmentation: "",
				fragmentation_armor_divisor: 1,
				fragmentation_type: "",
				modifier_per_die: 0,
			}

			// capture damage
			;[damage, t] = this.parseDamage(t)

			// if damage parser captures anything after the name, add it as a note
			if (t.match(/\{\{.*\}\}/)) {
				notes = t.match(/\{\{(.*)\}\}/)?.[1] ?? ""
				t = t.replace(/\{\{.*\}\}/, "").trim()
			}

			t = t.trim()
			notes = this.cleanLine(notes)

			if (isRanged) {
				const rangedWeapon = new MookRanged({
					name,
					accuracy,
					range: half_damage > 0 && max_range > 0 ? `${half_damage}/${max_range}` : range,
					level,
					rate_of_fire: rof,
					shots,
					bulk,
					recoil,
					reference,
					strength: ST,
					notes,
					damage,
				})
				ranged.push(rangedWeapon)
			} else {
				const meleeWeapon = new MookMelee({
					name,
					reach,
					strength: ST,
					level,
					damage,
					parry,
					block,
					notes,
					reference,
				})
				melee.push(meleeWeapon)
			}
		})
		return [melee, ranged]
	}

	// private get resetObject(): MookData {
	// 	return {
	// 		settings: {
	// 			attributes: [],
	// 			damage_progression: this.object.settings.damage_progression,
	// 			move_types: this.object.settings.move_types,
	// 		},
	// 		system: {
	// 			attributes: this.object.system.attributes,
	// 		},
	// 		attributes: this.object.attributes,
	// 		traits: [],
	// 		skills: [],
	// 		spells: [],
	// 		melee: [],
	// 		ranged: [],
	// 		equipment: [],
	// 		other_equipment: [],
	// 		notes: [],
	// 		profile: {
	// 			name: "",
	// 			description: "",
	// 			title: "",
	// 			height: "",
	// 			weight: "",
	// 			SM: 0,
	// 			portrait: "icons/svg/mystery-man.svg",
	// 			userdesc: "",
	// 		},
	// 		thrust: this.object.thrust,
	// 		swing: this.object.swing,
	// 	}
	// }
}
