import { Difficulty, gid, SETTINGS, SYSTEM_NAME } from "@module/data"
import { sanitize } from "@util"
import { MookData, MookSkill, MookSpell, MookTrait, MookTraitModifier } from "./data"
import { Mook } from "./document"
import { SettingsGURPS } from "@module/settings/defaults"

const regex_points = /\[(-?\d+)\]/

export class MookParser {
	text: string

	object: Mook

	private _text: string

	private _object: MookData

	constructor(text: string, object: Mook) {
		this.text = text
		this.object = object
		this._object = this.resetObject
		this._text = ""
	}

	static init(text?: string, object?: Mook) {
		text ??= ""
		object ??= new Mook()
		return new MookParser(text, object)
	}

	parseStatBlock(text: string): any {
		this._object = this.resetObject
		this.text = this.sanitizeStatBlock(text)
		this._text = this.text
		console.log(this._text)
		this.parseAttributes()
		// this.parseAttacks()
		this.parseTraits()
		this.parseSkills()
		this.parseSpells()
		// this.parseMelee()
		// this.parseRanged()
		// this.parseEquipment()
		this.parseAttacks(true)
		console.log("Leftover:")
		console.log(this.text)
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
		// console.log(startMatches, endMatches, this.text)
		const start = startMatches.length === 0 ? 0 : this.findInText(startMatches)
		if (start === -1) {
			console.log(`No matches for: ${startMatches.join(", ")}`)
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

	private parseAttributes(): void {
		this.text = this.cleanLine(this.text)
		const attribute_names: { id: string; match: string }[] = []
			; (SettingsGURPS.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`) as any[]).forEach(e => {
				attribute_names.push({ id: e.id.toLowerCase(), match: e.id.toLowerCase() })
				if (e.name && e.name !== "") attribute_names.push({ id: e.id.toLowerCase(), match: e.name.toLowerCase() })
				if (e.full_name && e.full_name !== "")
					attribute_names.push({ id: e.id.toLowerCase(), match: e.full_name.toLowerCase() })
			})

		const preText = this.extractText([], ["Advantages:", "Advantages/Disadvantages:", "Traits:"])

		const regex_att = new RegExp(`[^a-z](${attribute_names.map(e => e.match).join("|")}):?\\s*(\\d+)?`)

		let text = ""
		let leftOverText = ""
		preText.split("\n").forEach(e => {
			if (e.toLowerCase().match(regex_att)) text += `${e.toLowerCase()}\n`
			else leftOverText += `${e}\n`
		})
		// console.log(text)
		// console.log(leftOverText)
		this.text = `${leftOverText}\n${this.text}`
		if (text.includes(";")) text = text.replace(/\n/g, ";") // if ; separated, remove newlines
		else if (text.split(",").length > 2) text = text.replace(/,/g, ";") // if , separated, replace with ;

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

			const currentValue = this.object.attributes.get(id)!.max
			const newValue = parseFloat(t.match(/\d+/)?.[0] || "0")
			const index = this.object.system.attributes.findIndex(e => e.attr_id === id)
			this.object.system.attributes[index].adj = newValue - currentValue
		})
		this.object.attributes = this.object.getAttributes()
	}

	private parseTraits(): void {
		const regex_cr = /\((CR:?)?\s*(\d+)\)/

		this._object.traits = []
		// const start = this.findInText(["Advantages", "Advantages/Disadvantages", "Traits"])
		// if (start === -1) return console.log("Traits not found")
		// const end = this.findInText(["Skills", "Spells"], start) + start
		// if (end === -1) return console.log("Skills/Spells not found")
		// let text = this.text.substring(start, end)
		let text = this.extractText(["Advantages:", "Advantages/Disadvantages:", "Traits:"], ["Skills:", "Spells:"])

		if (text.includes(";")) text = text.replace(/\n/g, " ") // if ; separated, remove newlines
		else if (text.split(",").length > 2) text = text.replace(/,/g, " ") // if , separated, replace with ;

		text = text.replace(/advantages\/disadvantages:?/gi, ";")
		text = text.replace(/disadvantages:?/gi, ";")
		text = text.replace(/advantages:?/gi, ";")
		text = text.replace(/perks:?/gi, ";")
		text = text.replace(/quirks:?/gi, ";")
		text = text.trim()
		text.split(";").forEach(t => {
			if (!t.trim()) return

			// Capture points
			let points = 0
			if (t.match(regex_points)) {
				points = parseInt(t.match(regex_points)?.[1] ?? "0")
				t = t.replace(regex_points, "").trim()
			}

			// Capture CR
			let cr = 0
			if (t.match(regex_cr)) {
				cr = parseInt(t.match(regex_cr)![2])
				t = t.replace(regex_cr, "").trim()
			}

			// Capture modifiers
			let modifiers: MookTraitModifier[] = []
			if (t.match(/\(.+\)/)) {
				modifiers = this.parseTraitModifiers(t.match(/\((.*)\)/)![1])
				t = t.replace(/\(.*\)/, "").trim()
			}

			t = this.cleanLine(t)

			const trait: MookTrait = {
				name: t,
				points,
				cr,
				notes: "",
				reference: "",
				modifiers,
			}
			this.object.traits.push(trait)
		})
	}

	private parseTraitModifiers(text: string): MookTraitModifier[] {
		const modifiers: MookTraitModifier[] = []
		const textmods = text.split(";")
		textmods.forEach(m => {
			if (m.split(",").length === 2) {
				// assumes common format for modifier notation
				const mod = m.split(",")
				modifiers.push({
					name: mod[0].trim(),
					cost: mod[1].trim(),
					notes: "",
					reference: "",
				})
			}
		})
		return modifiers
	}

	private parseSkills(): void {
		const attributes: { name: string; id: string }[] = (
			SettingsGURPS.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`) as any
		).map((e: any) => {
			return { id: e.id, name: e.name }
		})

		const regex_level = /\s?-(\d+)/
		const regex_difficulty = /\(([EAHV][H]?)\)/
		const regex_rsl = new RegExp(`(${attributes.map(e => e.name).join("|")})([-+]\\d+)?`)
		const regex_specialization = /\((.*)\)/
		const regex_tl = /\/TL(\d+\^?)/

		this._object.skills = []
		// const start = this.findInText(["Skills"])
		// if (start === -1) return console.log("Skills not found")
		// const end = this.findInText(["Spells", "Equipment", "Languages", "Weapons"], start) + start
		// if (end === -1) return console.log("Spells/Equipment not found")
		// let text = this.text.substring(start, end)
		let text = this.extractText(["Skills:"], ["Spells:", "Equipment:", "Language:", "Weapons:", "Class:", "Notes:"])

		text = text.replace(/skills:?/gi, " ")
		text = this.cleanLine(text)
		text = text.trim()

		text.split(";").forEach(t => {
			t = this.cleanLine(t).trim()
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
			let attribute: string = gid.Ten
			let rsl = level - 10
			let difficulty = Difficulty.Average
			if (t.match(regex_difficulty)) {
				difficulty = t.match(regex_difficulty)![1].toLowerCase() as Difficulty
				t = t.replace(regex_difficulty, "").trim()
			}

			if (t.match(regex_rsl)) {
				const match = t.match(regex_rsl)!
				if (match[2]) rsl = parseInt(match[2])
				else rsl = 0
				attribute = attributes.find(e => e.name === match[1])?.id ?? gid.Ten
				t = t.replace(regex_rsl, "").trim()
			}

			// Capture specialization
			let specialization = ""
			if (t.match(regex_specialization)) {
				specialization = t.match(regex_specialization)![1]
				t = t.replace(regex_specialization, "").trim()
			}

			// Capture TL
			let tl = ""
			if (t.match(regex_tl)) {
				tl = t.match(regex_tl)![1]
				t = t.replace(regex_tl, "").trim()
			}

			t = this.cleanLine(t)

			const skill: MookSkill = {
				name: t,
				difficulty: `${attribute}/${difficulty}`,
				points,
				level,
				specialization,
				tech_level: tl,
				notes: "",
				reference: "",
			}
			this.object.skills.push(skill)
		})
	}

	private parseSpells(): void {
		const attributes: { name: string; id: string }[] = (
			SettingsGURPS.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`) as any
		).map((e: any) => {
			return { id: e.id, name: e.name }
		})

		const regex_level = /\s-(\d+)/
		const regex_difficulty = /\(([EAHV][H]?)\)/
		const regex_rsl = new RegExp(`(${attributes.map(e => e.name).join("|")})([-+]\\d+)?`)
		const regex_tl = /\/TL(\d+\^?)/

		this._object.spells = []
		// const start = this.findInText(["Spells"])
		// if (start === -1) return console.log("Spells not found")
		// const end = this.findInText(["Equipment", "Languages", "Weapons"], start) + start
		// if (end === -1) return console.log("Equipment not found")
		// let text = this.text.substring(start, end)
		let text = this.extractText(["Spells:"], ["Equipment:", "Language:", "Weapons:", "Class:", "Notes:"])

		text = text.replace(/spells:?/gi, ";")
		text = text.trim()

		text.split(";").forEach(t => {
			t = this.cleanLine(t).trim()
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
			let attribute: string = gid.Ten
			let rsl = level - 10
			let difficulty = Difficulty.Average
			if (t.match(regex_difficulty)) {
				difficulty = t.match(regex_difficulty)![1].toLowerCase() as Difficulty
				t = t.replace(regex_difficulty, "").trim()
			}

			if (t.match(regex_rsl)) {
				const match = t.match(regex_rsl)!
				if (match[2]) rsl = parseInt(match[2])
				else rsl = 0
				attribute = attributes.find(e => e.name === match[1])?.id ?? gid.Ten
				t = t.replace(regex_rsl, "").trim()
			}

			// Capture TL
			let tl = ""
			if (t.match(regex_tl)) {
				tl = t.match(regex_tl)![1]
				t = t.replace(regex_tl, "").trim()
			}

			t = this.cleanLine(t)

			const spell: MookSpell = {
				name: t,
				college: [],
				difficulty: `${attribute}/${difficulty}`,
				points,
				level,
				tech_level: tl,
				notes: "",
				reference: "",
			}
			this.object.spells.push(spell)
		})
	}

	parseAttacks(oldFormat = false) {
		const regex_acc = / ?[Aa]cc *(\\d+) ?,?/
		const regex_rof = / ?[Rr]o[Ff] *(\\d+) ?,?/
		const regex_recoil = / ?[Rr]cl *(\\d+) ?,?/
		const regex_half_damage = / ?1\/2[Dd] *(\\d+) ?,?/
		const regex_max_range = / ?[Mm]ax *(\\d+) ?,?/
		const regex_shots = / ?[Ss]hots *([\\w\\)\\(]+) ?,?/
		const regex_bulk = / ?[Bb]ulk *([\\w-]+) ?,?/
		const regex_ST = / ?[Ss][Tt] *(\\d+) ?,?/
		const regex_reach = / ?[Rr]each *([^.]+) ?,?/
		const regex_range = / ?[Rr]ange ([0-9/]+) *,?/
		const regex_level = /\((\d+)\):/

		this._object.melee = []
		this._object.ranged = []

		let text = ""
		if (oldFormat) text = this.text
		else {
			let text = this.extractText(["Traits:"], ["Advantages/Disadvantages:", "Advantages:"], false)
			if (text === "") {
				if (this.findInText(["Skills:"]) !== -1) text = this.extractText(["Skills:"], ["junk"])
				else if (this.findInText(["Weapons:"]) === -1) console.log("No attacks found")
			}
		}

		let weapons = ""
		let leftOverText = ""
		text.split("\n").forEach(e => {
			if (e.match(/\):/)) weapons += `${e}\n`
			else leftOverText += `${e}\n`
		})

		console.log("WEAPONS")
		console.log(weapons)

		if (weapons.includes(";")) weapons = weapons.replace(/\n/g, ";") // if ; separated, remove newlines
		else if (weapons.split(",").length > 2) weapons = weapons.replace(/,/g, ";") // if , separated, replace with ;
		weapons = weapons.replace(/weapons:?/gi, ";")

		weapons = weapons
			.split(";")
			.filter(e => e.match(/\):?/))
			.join(";")
			.trim()
		weapons.split(";").forEach(t => {
			t = this.cleanLine(t).trim()
			if (!t) return

			let isRanged = false

			// Capture level
			let level = 0
			if (t.match(regex_level)) {
				level = parseInt(t.match(regex_level)![1])
				t = t.replace(regex_level, "").trim()
			}

			let ST = 0
			if (t.match(regex_ST)) {
				ST = parseInt(t.match(regex_ST)![1])
				t = t.replace(regex_ST, "").trim()
			}

			// Capture accuracy
			let accuracy = 0
			if (t.match(regex_acc)) {
				isRanged = true
				accuracy = parseInt(t.match(regex_acc)![1])
				t = t.replace(regex_acc, "").trim()
			}

			// Capture ROF
			let rof = 0
			if (t.match(regex_rof)) {
				isRanged = true
				rof = parseInt(t.match(regex_rof)![1])
				t = t.replace(regex_rof, "").trim()
			}

			// Capture recoil
			let recoil = 0
			if (t.match(regex_recoil)) {
				isRanged = true
				recoil = parseInt(t.match(regex_recoil)![1])
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
			let shots = 0
			if (t.match(regex_shots)) {
				isRanged = true
				shots = parseInt(t.match(regex_shots)![1])
				t = t.replace(regex_shots, "").trim()
			}

			// Capture bulk
			let bulk = 0
			if (t.match(regex_bulk)) {
				isRanged = true
				bulk = parseInt(t.match(regex_bulk)![1])
				t = t.replace(regex_bulk, "").trim()
			}

			// Capture range
			let range = 0
			if (t.match(regex_range)) {
				isRanged = true
				range = parseInt(t.match(regex_range)![1])
				t = t.replace(regex_range, "").trim()
			}

			// Capture reach
			let reach = ""
			if (t.match(regex_reach)) {
				reach = t.match(regex_reach)![1]
				t = t.replace(regex_reach, "").trim()
			}

			t = t.trim()

			if (isRanged) {
				console.log("Name", t)
				console.log("Level", level)
				console.log("Acc", accuracy)
				console.log("1/2D", half_damage)
				console.log("Max", range ?? max_range)
				console.log("ROF", rof)
				console.log("Recoil", recoil)
				console.log("ST", ST)
			} else {
				console.log("Name", t)
				console.log("Level", level)
				console.log("ST", ST)
				console.log("Reach", reach)
			}

			console.log(t)
		})
	}

	private get resetObject(): MookData {
		return {
			settings: {
				attributes: [],
				damage_progression: this.object.settings.damage_progression,
			},
			system: {
				attributes: this.object.system.attributes,
			},
			attributes: this.object.attributes,
			traits: [],
			skills: [],
			spells: [],
			melee: [],
			ranged: [],
			equipment: [],
			other_equipment: [],
			notes: [],
			profile: {
				name: "Mook",
				description: "",
				title: "",
				height: "",
				weight: "",
				SM: 0,
				portrait: "icons/svg/mystery-man.svg"
			},
			thrust: this.object.thrust,
			swing: this.object.swing,
		}
	}
}
