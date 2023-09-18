import { Difficulty, gid, SETTINGS, SYSTEM_NAME } from "@module/data"
import { sanitize } from "@util"
import { MookData, MookSkill, MookTrait, MookTraitModifier } from "./data"
import { Mook } from "./document"

const regex_points = /\[(-?\d+)\]/

class MookParser {
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
		this.parseTraits()
		this.parseSkills()
		// this.parseSpells()
		// this.parseMelee()
		// this.parseRanged()
		// this.parseEquipment()
		return this.object
	}

	sanitizeStatBlock(text: string): string {
		text = sanitize(text)
		text = text.replace(/\t/g, "; ") // replace tabs with '; '
		text = text.replace(/ +/g, " ") // remove multiple spaces in a row
		text = text.replace(/[^ -~\n]+/g, "") // remove remaining non-ascii
		return this.cleanLine(text) // trim and remove leading and trailing periods.
	}

	private findInText(matches: string[], start?: number): number {
		const text = this.text.substring(start ?? 0)
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

	private parseTraits(): void {
		const regex_cr = /\((CR:?)?\s*(\d+)\)/


		this._object.traits = []
		const start = this.findInText(["Advantages", "Advantages/Disadvantages", "Traits"])
		if (start === -1) return console.error("Traits not found")
		const end = this.findInText(["Skills", "Spells"], start) + start
		if (end === -1) return console.error("Skills/Spells not found")
		let text = this.text.substring(start, end)

		if (text.includes(";")) text = text.replace(/\n/g, " ") // if ; separated, remove newlines
		else if (text.split(",").length > 2) text = text.replace(/,/g, ";") // if , separated, replace with ;

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
				modifiers
			}
			this.object.traits.push(trait)
		})
	}

	private parseTraitModifiers(text: string): MookTraitModifier[] {
		const modifiers: MookTraitModifier[] = []
		const textmods = text.split(";")
		textmods.forEach(m => {
			if (m.split(",").length === 2) { // assumes common format for modifier notation
				const mod = m.split(",")
				modifiers.push({
					name: mod[0].trim(),
					cost: mod[1].trim(),
					notes: "",
					reference: ""
				})
			}
		})
		return modifiers
	}

	private parseSkills(): void {
		const attributes: { name: string, id: string }[] =
			(game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`) as any)
				.map((e: any) => { return { id: e.id, name: e.name } })

		const regex_level = /\s-(\d+)/
		const regex_difficulty = /\(([EAHV][H]?)\)/
		const regex_rsl = new RegExp(`(${attributes.map(e => e.name).join("|")})([-+]\\d+)?`)
		const regex_specialization = /\((.*)\)/
		const regex_tl = /\/TL(\d+\^?)/

		this._object.traits = []
		const start = this.findInText(["Skills"])
		if (start === -1) return console.error("Skills not found")
		const end = this.findInText(["Spells", "Equipment", "Languages", "Weapons"], start) + start
		if (end === -1) return console.error("Spells/Equipment not found")
		let text = this.text.substring(start, end)

		text = text.replace(/skills:?/gi, ";")
		text = text.trim()

		text.split(";").forEach(t => {
			if (!t.trim()) return

			console.log(t)

			// Capture points
			let points = 0
			if (t.match(regex_points)) {
				points = parseInt(t.match(regex_points)?.[1] ?? "0")
				t = t.replace(regex_points, "").trim()
			}

			console.log("points:", points)

			// Capture level
			let level = 0
			if (t.match(regex_level)) {
				level = parseInt(t.match(regex_level)![1])
				t = t.replace(regex_level, "").trim()
			}

			console.log("level:", level)

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

			console.log("attribute:", attribute)
			console.log("difficulty:", difficulty)

			// Capture specialization
			let specialization = ""
			if (t.match(regex_specialization)) {
				specialization = t.match(regex_specialization)![1]
				t = t.replace(regex_specialization, "").trim()
			}

			console.log("specialization:", specialization)

			// Capture TL
			let tl = ""
			if (t.match(regex_tl)) {
				tl = t.match(regex_tl)![1]
				t = t.replace(regex_tl, "").trim()
			}

			console.log("tl:", tl)

			t = this.cleanLine(t)

			console.log("name:", t)

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

	private get resetObject(): MookData {
		return {
			settings: {
				attributes: [],
				damage_progression: this.object.settings.damage_progression
			},
			system: {
				attributes: this.object.system.attributes
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
				portrait: foundry.CONST.DEFAULT_TOKEN,
			},
			thrust: this.object.thrust,
			swing: this.object.swing
		}
	}

}

interface MookParser {
	text: string
	object: Mook
}

export { MookParser }
