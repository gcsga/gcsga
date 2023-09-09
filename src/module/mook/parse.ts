import { sanitize } from "@util"
import { MookData, MookTrait } from "./data"
import { Mook } from "./document"

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
		// this.parseSkills()
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

	private findInText(matches: string[]): number {
		for (const match of matches) {
			const index = this.text.indexOf(match)
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
		this._object.traits = []
		const start = this.findInText(["Advantages", "Advantages/Disadvantages", "Traits"])
		if (start === -1) return console.error("Traits not found")
		const end = this.findInText(["Skills", "Spells"])
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
			// Capture points
			let points = 0
			if (t.match(/\[(-?\d+)\]/)) {
				points = parseInt(t.match(/\[(-?\d+)\]/)?.[1] ?? "0")
				t = t.replace(/\[-?\d+\]/, "").trim()
			}

			// Capture CR
			let cr = 0
			if (t.match(/\((CR:?)?\s*(\d+)\)/)) {
				cr = parseInt(t.match(/\((CR:?)?\s*(\d+)\)/)![2])
				t = t.replace(/\((CR:?)?\s*(\d+)\)/, "").trim()
			}

			t = this.cleanLine(t)

			const trait: MookTrait = {
				name: t,
				points,
				cr,
				notes: "",
				reference: "",
				modifiers: []
			}
			console.log(trait)
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
