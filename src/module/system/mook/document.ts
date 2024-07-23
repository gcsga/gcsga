import { WeaponDamageSchema } from "@item/abstract-weapon/weapon-damage.ts"
import { ItemType, SETTINGS, SYSTEM_NAME, gid } from "@module/data/index.ts"
import { DiceGURPS } from "@module/dice/index.ts"
import { AttributeDef, AttributeGURPS, MoveTypeDef } from "@system"
import { difficulty, progression, sanitize, stdmg } from "@util"
import { MookEquipment, MookMelee, MookNote, MookRanged, MookSkill, MookSpell, MookTrait } from "./components.ts"
import {
	MookSchema,
	MookTraitModifierSchema,
	damage_type_matches,
	regex_damage_type,
	regex_difficulty,
	regex_points
} from "./data.ts"



class Mook extends foundry.abstract.DataModel<null, MookSchema> {
	declare text: string
	declare catchall: string

	constructor(
		data: Partial<SourceFromSchema<MookSchema>>,
		options: DataModelConstructionOptions<null>
	) {
		super(data, options)

		if (data.attributes)
			this.attributes = new Map(data.attributes.map(e => [e.id, new AttributeGURPS(e, { parent: this })]))

		this.traits = data.traits?.map(e => new MookTrait(e, { parent: this })) ?? []
		this.skills = data.skills?.map(e => new MookSkill(e, { parent: this })) ?? []
		this.spells = data.spells?.map(e => new MookSpell(e, { parent: this })) ?? []
		this.melee = data.melee?.map(e => new MookMelee(e, { parent: this })) ?? []
		this.ranged = data.ranged?.map(e => new MookRanged(e, { parent: this })) ?? []
		this.equipment = data.equipment?.map(e => new MookEquipment(e, { parent: this })) ?? []
		this.otherEquipment = data.otherEquipment?.map(e => new MookEquipment(e, { parent: this })) ?? []
		this.notes = data.notes?.map(e => new MookNote(e, { parent: this })) ?? []
	}

	static override defineSchema(): MookSchema {
		const fields = foundry.data.fields

		return {
			attributes: new fields.ArrayField(new fields.SchemaField(AttributeGURPS.defineSchema())),
			settings: new fields.SchemaField({
				attributes: new fields.ArrayField(new fields.SchemaField(AttributeDef.defineSchema())),
				damage_progression: new fields.StringField({
					choices: progression.Options,
					required: true,
					nullable: false,
					initial: progression.Option.BasicSet
				}),
				move_types: new fields.ArrayField(new fields.SchemaField(MoveTypeDef.defineSchema())),
			}),
			profile: new fields.SchemaField({
				name: new fields.StringField({ required: true, nullable: false, initial: "Mook" }),
				description: new fields.StringField({ required: true, nullable: false, initial: "" }),
				title: new fields.StringField({ required: true, nullable: false, initial: "" }),
				height: new fields.StringField({ required: true, nullable: false, initial: "" }),
				weight: new fields.StringField({ required: true, nullable: false, initial: "" }),
				SM: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
				portrait: new fields.StringField({ required: true, nullable: false, initial: "" }),
				userdesc: new fields.StringField({ required: true, nullable: false, initial: "" }),
			}),
			traits: new fields.ArrayField(new fields.SchemaField(MookTrait.defineSchema())),
			skills: new fields.ArrayField(new fields.SchemaField(MookSkill.defineSchema())),
			spells: new fields.ArrayField(new fields.SchemaField(MookSpell.defineSchema())),
			melee: new fields.ArrayField(new fields.SchemaField(MookMelee.defineSchema())),
			ranged: new fields.ArrayField(new fields.SchemaField(MookRanged.defineSchema())),
			equipment: new fields.ArrayField(new fields.SchemaField(MookEquipment.defineSchema())),
			otherEquipment: new fields.ArrayField(new fields.SchemaField(MookEquipment.defineSchema())),
			notes: new fields.ArrayField(new fields.SchemaField(MookTrait.defineSchema())),
			thrust: new fields.StringField({ required: true, nullable: false, initial: "" }),
			swing: new fields.StringField({ required: true, nullable: false, initial: "" }),
		}

	}

	parseStatblock(text: string): void {
		this.text = this._sanitizeStatblock(text)
		this._parseName()
		this._parseAttacks(false)
		this._parseAttributes()
		this._parseTraits()
		this._parseSkills()
		this._parseSpells()
		// this.parseEquipment()
		this._parseAttacks(true)
		this.catchall = this.text
	}

	private _sanitizeStatblock(text: string): string {
		text = sanitize(text)
		text = text.replace(/\t/g, "; ") // replace tabs with '; '
		text = text.replace(/ +/g, " ") // remove multiple spaces in a row
		text = text.replace(/[^ -~\n]+/g, "") // remove remaining non-ascii
		return this._cleanLine(text) // trim and remove leading and trailing periods.
	}


	/*
	 * General Use Parser Functions
	 */

	// Clean up a line of text for easier parsing
	private _cleanLine(text: string): string {
		const start = text
		if (!text) return text
		const pat = "*,.:" // things that just clutter up the text
		if (pat.includes(text[0])) text = text.substring(1)
		if (pat.includes(text[text.length - 1])) text = text.substring(0, text.length - 1)
		text = text.trim()
		return start === text ? text : this._cleanLine(text)
	}

	// Find a block of text in between two matches and extract it from the original text block
	private _extractText(startMatches: string[], endMatches: string[], cut = true): string {
		const start = startMatches.length === 0 ? 0 : this._findInText(startMatches)
		if (start === -1) {
			return ""
		}
		const end = this._findInText(endMatches)
		if (end === -1) {
			const extracted = this.text.slice(start)
			if (cut) this.text = this.text.slice(0, start)
			return extracted
		}
		const extracted = this.text.slice(start, end)
		if (cut) this.text = this.text.slice(0, start) + this.text.slice(end)
		return extracted
	}

	// Find a match in this.text and return its index
	private _findInText(matches: string[], start = 0): number {
		const text = this.text.substring(start)
		for (const match of matches) {
			const index = text.indexOf(match)
			if (index !== -1) return index
		}
		return -1
	}


	/*
	 * Specific Fields Parser Funtions
	 */
	private _parseName(): void {
		this.text = this._cleanLine(this.text)
		this.profile.name = this.text.split("\n")[0]
	}

	private _parseAttributes(): void {
		this.text = this._cleanLine(this.text)

		// Create an array of Attribute IDs and strings which are associated with those attributes
		const attribute_names: { id: string; match: string }[] = []
		game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`).forEach(e => {
			attribute_names.push({ id: e.id.toLowerCase(), match: e.id.toLowerCase() })
			if (e.name && e.name !== "") attribute_names.push({ id: e.id.toLowerCase(), match: e.name.toLowerCase() })
			if (e.full_name && e.full_name !== "")
				attribute_names.push({ id: e.id.toLowerCase(), match: e.full_name.toLowerCase() })
		})
		attribute_names.push({ id: gid.BasicSpeed, match: "speed" }, { id: gid.BasicMove, match: "move" })

		// Text which can appear before the attribute block
		const preText = this._extractText([], ["Advantages:", "Advantages/Disadvantages:", "Traits:"])

		// Regex expression which matches attributes
		const regex_att = new RegExp(`(${attribute_names.map(e => e.match).join("|")}):?[\\n\\s]*(\\d+.?\\d*)`, "g")

		// Extract attriubte block from the text
		let text = ""
		const leftOverText = ""
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

		// While loop to account for attributes which affect other attributes
		// hard-capped at 5 iterations to prevent infinite loop, may result in inaccuracies
		for (let i = 0; i < 5; i++) {
			// if all attribute values are as they were last loop, stop looping
			if (!Array.from(newValues).some(([k, _v]) => newValues.get(k) !== this.attributes.get(k)?.max)) break

			for (const id of newValues.keys()) {
				const [newValue, currentValue] = [newValues.get(id), this.attributes.get(id)!.max]

				if (!newValue || !currentValue) continue
				if (newValue === currentValue) continue

				const attribute = this.attributes.get(id)!
				attribute.adj += newValue - currentValue
				this.attributes.set(id, attribute)
			}
		}
	}


	private _parseAttacks(oldFormat = false, skipSeparation = false): void {
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
		if (skipSeparation) weapons = this.text
		else {
			if (oldFormat) text = this.text
			else {
				text = this._extractText([], ["Traits:"])
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
					last_matched += 1
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
					if (line.match(/^(\w+\s+)*\(\d+\):?/)) final += `; ${this._cleanLine(line).trim()}`
					else final += ` ${this._cleanLine(line).trim()}`
				}

				return final
			})()
		}

		const melee: MookMelee[] = []
		const ranged: MookRanged[] = []
		weapons.split(";").forEach(t => {
			const reference = ""
			let notes = ""

			t = this._cleanLine(t).trim()
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
			const parry = "No"
			if (t.match(regex_parry)) {
				// trim required here as regex grabs whitespace at end
				reach = t.match(regex_parry)![1].trim()
				t = t.replace(regex_parry, "").trim()
			}

			// Capture block
			const block = "No"
			if (t.match(regex_block)) {
				// trim required here as regex grabs whitespace at end
				reach = t.match(regex_block)![1].trim()
				t = t.replace(regex_block, "").trim()
			}

			t = t.trim()

			let damage: SourceFromSchema<WeaponDamageSchema> = {
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
				;[damage, t] = this._parseDamage(t)

			// if damage parser captures anything after the name, add it as a note
			if (t.match(/\{\{.*\}\}/)) {
				notes = t.match(/\{\{(.*)\}\}/)?.[1] ?? ""
				t = t.replace(/\{\{.*\}\}/, "").trim()
			}

			t = t.trim()
			notes = this._cleanLine(notes)

			if (isRanged) {
				const rangedWeapon = new MookRanged({
					type: ItemType.RangedWeapon,
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
				}, { parent: this })
				ranged.push(rangedWeapon)
			} else {
				const meleeWeapon = new MookMelee({
					type: ItemType.MeleeWeapon,
					name,
					reach,
					strength: ST,
					level,
					damage,
					parry,
					block,
					notes,
					reference,
				}, { parent: this })
				melee.push(meleeWeapon)
			}
		})

		this.melee = melee
		this.ranged = ranged
	}

	private _parseDamage(input: string): [SourceFromSchema<WeaponDamageSchema>, string] {
		const regex_full_damage = /(\d+d)([+-]\d+)?\s*(\(\d+\))?\s+\w+/
		const regex_armor_divisor = /\((\d+)\)/

		const damage: SourceFromSchema<WeaponDamageSchema> = {
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

	private _parseTraits(skipSeparation = false): void {
		const regex_levels = /\s(\d+)$/
		const regex_cr = /\((CR:?)?\s*(\d+)\)/

		let text = ""
		if (skipSeparation) {
			text = this.text
		} else {
			text = this._extractText(["Advantages:", "Advantages/Disadvantages:", "Traits:"], ["Skills:", "Spells:"])
			if (text.includes(";"))
				text = text.replace(/\n/g, " ") // if ; separated, remove newlines
			else if (text.split(",").length > 2) text = text.replace(/,/g, " ") // if , separated, replace with ;
			text = text.replace(/advantages\/disadvantages:?/gi, ";")
			text = text.replace(/disadvantages:?/gi, ";")
			text = text.replace(/advantages:?/gi, ";")
			text = text.replace(/perks:?/gi, ";")
			text = text.replace(/quirks:?/gi, ";")
			text = text.replace(/traits:?/gi, ";")
			text = text.trim()
		}

		text.split(";").forEach(t => {
			if (!t.trim()) return

			// Capture points
			let points = 0
			if (t.match(regex_points)) {
				points = parseInt(t.match(regex_points)?.[1] ?? "0")
				t = t.replace(regex_points, "").trim()
			}

			// Capture modifiers
			let modifiers: SourceFromSchema<MookTraitModifierSchema>[] = []
			if (t.match(/\(.+\)/)) {
				modifiers = this._parseTraitModifiers(t.match(/\((.*)\)/)![1])
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

			t = this._cleanLine(t)

			const trait = new MookTrait({
				type: ItemType.Trait,
				name: t,
				points,
				cr,
				levels,
				notes: "",
				reference: "",
				modifiers,
			}, { parent: this })

			this.traits.push(trait)
		})
	}

	private _parseTraitModifiers(text: string): SourceFromSchema<MookTraitModifierSchema>[] {
		const modifiers: SourceFromSchema<MookTraitModifierSchema>[] = []
		const textmods = text.split(";")
		textmods.forEach(m => {
			if (m.split(",").length === 2 && m.split(",")[1].match(/[+-]?\d+%?/)) {
				// assumes common format for modifier notation
				const mod = m.split(",")
				modifiers.push(
					{
						type: ItemType.TraitModifier,
						name: mod[0].trim(),
						cost: mod[1].trim(),
						notes: "",
						reference: "",
					}
				)
			}
		})
		return modifiers
	}

	private _parseSkills(skipSeparation = false): void {
		const attributes: { name: string; id: string }[] = [
			...game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`).map(e => {
				return { id: e.id, name: e.name }
			}),
			...game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`).map(e => {
				return { id: e.id, name: e.id }
			}),
		]

		const regex_level = /\s?-(\d+)/
		const regex_difficulty_att = new RegExp(`\\((${attributes.map(e => e.name).join("|")})/([EAHVeahv][Hh]?)\\)`)
		const regex_rsl = new RegExp(`[\\(|\\s](${attributes.map(e => e.name).join("|")})([-+]\\d+)?[\\)|\\s]?`)
		const regex_specialization = /^(?:[A-z-\s]+) \(([A-z-\s]+)\)/
		const regex_tl = /\/TL(\d+\^?)/

		let text = ""
		if (skipSeparation) text = this.text
		else
			text = this._extractText(
				["Skills:"],
				["Spells:", "Equipment:", "Language:", "Languages:", "Weapons:", "Class:", "Notes:", "*"],
			)

		text = text.replace(/skills:?/gi, " ")
		text = this._cleanLine(text)
		text = text.replaceAll(/\.\n/g, ";").replaceAll(",", ";")
		text = text.trim()

		text.split(";").forEach(t => {
			t = this._cleanLine(t).trim().replace("\n", "")
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

			t = this._cleanLine(t)

			this.skills.push(new MookSkill({
				type: ItemType.Skill,
				name: t,
				attribute: attribute,
				difficulty: diff as difficulty.Level,
				points,
				level,
				specialization,
				tech_level: tl,
				notes: "",
				reference: "",
			}))
		})
	}

	private _parseSpells(skipSeparation = false): void {
		const attributes: { name: string; id: string }[] = [
			...game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`).map(e => {
				return { id: e.id, name: e.name }
			}),
			...game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`).map(e => {
				return { id: e.id, name: e.id }
			}),
		]

		const regex_level = /\s?-(\d+)/
		const regex_difficulty_att = new RegExp(`\\((${attributes.map(e => e.name).join("|")})/([EAHVeahv][Hh]?)\\)`)
		const regex_rsl = new RegExp(`[\\(|\\s](${attributes.map(e => e.name).join("|")})([-+]\\d+)?[\\)|\\s]?`)
		const regex_tl = /\/TL(\d+\^?)/

		let text = ""
		if (skipSeparation) text = this.text
		else
			text = this._extractText(
				["Spells:"],
				["Equipment:", "Language:", "Languages:", "Weapons:", "Class:", "Notes:"],
			)

		text = text.replace(/spells:?/gi, ";")
		text = text.replace(/^.*:\n/, ";")
		text = this._cleanLine(text)
		text = text.replaceAll(/\.\n/g, ";").replaceAll(",", ";")
		text = text.trim()

		text.split(";").forEach(t => {
			t = this._cleanLine(t).trim().replace("\n", "")
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

			t = this._cleanLine(t)

			this.spells.push(new MookSpell({
				type: ItemType.Spell,
				name: t,
				college: [],
				attribute: attribute,
				difficulty: diff as difficulty.Level,
				points,
				level,
				tech_level: tl,
				notes: "",
				reference: "",
			}))
		})
	}
}


interface Mook extends foundry.abstract.DataModel<null, MookSchema>,
	Omit<ModelPropsFromSchema<MookSchema>,
		"attributes" | "traits" | "skills" | "spells" | "melee" | "ranged" | "equipment" | "otherEquipment" | "notes"
	> {
	attributes: Map<string, AttributeGURPS>

	traits: MookTrait[]
	skills: MookSkill[]
	spells: MookSpell[]
	melee: MookMelee[]
	ranged: MookRanged[]
	equipment: MookEquipment[]
	otherEquipment: MookEquipment[]
	notes: MookNote[]
}

export { Mook }

// export class Mook {
// 	type = "mook"
//
// 	flags = {
// 		[SYSTEM_NAME]: {
// 			[ActorFlags.TargetModifiers]: [],
// 			[ActorFlags.SelfModifiers]: [],
// 			[ActorFlags.Import]: { name: "", path: "", last_import: "" },
// 			[ActorFlags.MoveType]: gid.Ground,
// 			[ActorFlags.AutoEncumbrance]: { active: true, manual: 0 },
// 			[ActorFlags.AutoThreshold]: { active: true, manual: {} },
// 			[ActorFlags.AutoDamage]: { active: true, thrust: new DiceGURPS(), swing: new DiceGURPS() },
// 		},
// 	}
//
// 	protected variableResolverExclusions: Map<string, boolean> = new Map()
//
// 	settings: {
// 		attributes: AttributeDef[]
// 		damage_progression: progression.Option
// 		move_types: MoveTypeDef[]
// 	}
//
// 	system: {
// 		settings: {
// 			attributes: AttributeDef[]
// 			damage_progression: progression.Option
// 			move_types: MoveTypeDef[]
// 		}
// 		attributes: AttributeGURPS[]
// 	}
//
// 	declare attributes: Map<string, AttributeGURPS>
//
// 	traits: MookTrait[]
//
// 	skills: MookSkill[]
//
// 	spells: MookSpell[]
//
// 	melee: MookMelee[]
//
// 	ranged: MookRanged[]
//
// 	equipment: MookEquipment[]
//
// 	other_equipment: MookEquipment[]
//
// 	notes: MookNote[]
//
// 	conditions = []
//
// 	profile: MookProfile
//
// 	thrust!: DiceGURPS
//
// 	swing!: DiceGURPS
//
// 	text: {
// 		traits: string
// 		skills: string
// 		spells: string
// 		melee: string
// 		ranged: string
// 		equipment: string
// 		catchall: string
// 	}
//
// 	update(data: Partial<MookData>): void {
// 		Object.assign(this, fu.mergeObject(this, data))
// 		this.refreshAttributes()
// 	}
//
// 	refreshAttributes(): void {
// 		this.attributes = new Map(
// 			this.system.attributes
// 				.map((value, index) => {
// 					return new AttributeGURPS(value, { parent: this, order: index })
// 				})
// 				.map(e => [e.id, e]),
// 		)
// 	}
//
// 	// TODO: need to parse and store proper active defense values
// 	dodge(_enc: Encumbrance): number {
// 		return 0
// 	}
//
// 	constructor(data?: Partial<MookData>) {
// 		const settings = data?.system?.settings ?? {
// 			attributes: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`),
// 			damage_progression: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.settings`)
// 				.damage_progression,
// 			move_types: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`),
// 		}
// 		this.settings = {
// 			attributes: settings.attributes.map(e => new AttributeDef(e)),
// 			damage_progression: settings.damage_progression,
// 			move_types: settings.move_types.map(e => new MoveTypeDef(e)),
// 		}
// 		this.system = data?.system ?? {
// 			settings,
// 			attributes: this.generateNewAttributes(settings.attributes.map(def => new AttributeDef(def))),
// 		}
// 		this.refreshAttributes()
// 		this.traits = data?.traits ?? []
// 		this.skills = data?.skills ?? []
// 		this.spells = data?.spells ?? []
// 		this.melee = data?.melee ?? []
// 		this.ranged = data?.ranged ?? []
// 		this.equipment = data?.equipment ?? []
// 		this.other_equipment = data?.other_equipment ?? []
// 		this.notes = data?.notes ?? []
// 		this.profile = data?.profile ?? {
// 			name: "",
// 			description: "",
// 			title: "",
// 			height: "",
// 			weight: "",
// 			SM: 0,
// 			portrait: foundry.CONST.DEFAULT_TOKEN,
// 			userdesc: "",
// 		}
// 		this.text = {
// 			traits: "",
// 			skills: "",
// 			spells: "",
// 			melee: "",
// 			ranged: "",
// 			equipment: "",
// 			catchall: "",
// 		}
// 		if (this.attributes.has(gid.Strength)) {
// 			this.thrust = damageProgression.thrustFor(this.settings.damage_progression, this.attributes.get("st")!.max)
// 			this.swing = damageProgression.swingFor(this.settings.damage_progression, this.attributes.get("st")!.max)
// 		}
// 	}
//
// 	generateNewAttributes<TDef extends AttributeDef>(definitions: TDef[]): AttributeObj[] {
// 		const values: AttributeObj[] = []
// 		definitions.forEach(definition => {
// 			values.push(definition.generateNewAttribute())
// 		})
// 		return values
// 	}
//
// 	resolveAttributeCurrent(id: string): number {
// 		const att = this.attributes?.get(id)?.current
// 		if (att) return att
// 		return Number.MIN_SAFE_INTEGER
// 	}
//
// 	skillBonusFor(..._args: unknown[]): number {
// 		return 0
// 	}
//
// 	skillPointBonusFor(..._args: unknown[]): number {
// 		return 0
// 	}
//
// 	spellBonusFor(..._args: unknown[]): number {
// 		return 0
// 	}
//
// 	spellPointBonusFor(..._args: unknown[]): number {
// 		return 0
// 	}
//
// 	get adjustedSizeModifier(): number {
// 		return this.profile.SM
// 	}
//
// 	getFlag(..._args: unknown[]): unknown {
// 		return null
// 	}
//
// 	attributeBonusFor(..._args: unknown[]): number {
// 		return 0
// 	}
//
// 	moveBonusFor(..._args: unknown[]): number {
// 		return 0
// 	}
//
// 	costReductionFor(..._args: unknown[]): number {
// 		return 0
// 	}
//
// 	resolveVariable(variableName: string): string {
// 		if (this.variableResolverExclusions?.has(variableName)) {
// 			console.warn(`Attempt to resolve variable via itself: $${variableName}`)
// 			return ""
// 		}
// 		if (!this.variableResolverExclusions) this.variableResolverExclusions = new Map()
// 		this.variableResolverExclusions.set(variableName, true)
// 		if (gid.SizeModifier === variableName) return this.profile.SM.signedString()
// 		const parts = variableName.split(".") // TODO: check
// 		const attr: AttributeGURPS | undefined = this.attributes.get(parts[0])
// 		if (!attr) {
// 			console.warn(`No such variable: $${variableName}`)
// 			return ""
// 		}
// 		let def
// 		if (attr instanceof AttributeGURPS) {
// 			def = attr.definition
// 		}
// 		if (!def) {
// 			console.warn(`No such variable definition: $${variableName}`)
// 			return ""
// 		}
// 		this.variableResolverExclusions = new Map()
// 		return attr?.max.toString()
// 	}
//
// 	isSkillLevelResolutionExcluded(_name: string, _specialization: string): boolean {
// 		return false
// 	}
//
// 	registerSkillLevelResolutionExclusion(_name: string, _specialization: string): void {
// 		// do nothing}
// 	}
//
// 	unregisterSkillLevelResolutionExclusion(_name: string, _specialization: string): void {
// 		// do nothing}
// 	}
//
// 	effectiveST(initialST: number): number {
// 		return initialST
// 	}
//
// 	get strikingST(): number {
// 		return this.attributes.get(gid.Strength)?.max ?? 0
// 	}
//
// 	get throwingST(): number {
// 		return this.attributes.get(gid.Strength)?.max ?? 0
// 	}
//
// 	get liftingST(): number {
// 		return this.attributes.get(gid.Strength)?.max ?? 0
// 	}
//
// 	async createActor(): Promise<CharacterGURPS | null> {
// 		const date = new Date().toISOString()
// 		const data: DeepPartial<CharacterSource> = {
// 			system: {
// 				settings: {
// 					...game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.settings`),
// 					resource_trackers: game.settings.get(
// 						SYSTEM_NAME,
// 						`${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`,
// 					),
// 					...this.system.settings,
// 				},
// 				attributes: this.system.attributes,
// 				profile: this.profile,
// 				created_date: date,
// 				modified_date: date,
// 			},
// 			items: await this._createItemData(),
// 		}
//
// 		const newActor = await CharacterGURPS.create(
// 			{
// 				name: this.profile.name,
// 				img: this.profile.portrait,
// 			} as PreCreate<CharacterGURPS["_source"]>,
// 			{ promptImport: false } as DocumentModificationContext<CharacterGURPS["parent"]>,
// 		)
// 		if (!newActor) return null
// 		await newActor?.update(data)
// 		const updateMap: ({ _id: string } & Record<string, unknown>)[] = []
// 		newActor.itemTypes[ItemType.Skill].forEach((item, index: number) => {
// 			updateMap.push({
// 				_id: item.id!,
// 				"system.points": item.getPointsForLevel(this.skills[index].level),
// 			})
// 		})
// 		newActor.itemTypes[ItemType.Spell].forEach((item, index: number) => {
// 			updateMap.push({
// 				_id: item.id!,
// 				"system.points": item.getPointsForLevel(this.spells[index].level),
// 			})
// 		})
// 		await newActor.updateEmbeddedDocuments("Item", updateMap)
// 		newActor.sheet?.render(true)
// 		return newActor
// 	}
//
// 	private async _createItemData(): Promise<DeepPartial<ItemSourceGURPS>[]> {
// 		const items: DeepPartial<ItemSourceGURPS>[] = []
// 		for (const trait of this.traits) items.push(...this._getTraitItemData(trait))
// 		for (const skill of this.skills) items.push(await this._getSkillItemData(skill))
// 		for (const spell of this.spells) items.push(await this._getSpellItemData(spell))
// 		for (const melee of this.melee) items.push(this._getMeleeItemData(melee))
// 		for (const ranged of this.ranged) items.push(this._getRangedItemData(ranged))
// 		items.push(this._getNoteItemData(this.text.catchall))
//
// 		console.log(items)
// 		return items
// 	}
//
// 	private _getTraitItemData(trait: MookTrait): DeepPartial<TraitSource | TraitModifierSource>[] {
// 		const items: DeepPartial<TraitSource | TraitModifierSource>[] = []
// 		const id = fu.randomID()
// 		const data: DeepPartial<TraitSource> = {
// 			name: trait.name,
// 			type: ItemType.Trait,
// 			_id: id,
// 			flags: { [SYSTEM_NAME]: { [ItemFlags.Container]: null } },
// 			system: {
// 				name: trait.name,
// 				notes: trait.notes,
// 				reference: trait.reference,
// 				base_points: trait.points,
// 				cr: trait.cr,
// 				can_level: trait.levels !== 0,
// 				levels: trait.levels,
// 			},
// 		}
// 		items.push(data)
// 		items.push(...trait.modifiers.map(m => this._getTraitModifierItemData(m, id)))
// 		return items
// 	}
//
// 	private _getTraitModifierItemData(
// 		modifier: MookTraitModifier,
// 		container_id: string,
// 	): DeepPartial<TraitModifierSource> {
// 		const id = fu.randomID()
// 		console.log(modifier)
// 		const data: DeepPartial<TraitModifierSource> = {
// 			name: modifier.name,
// 			type: ItemType.TraitModifier,
// 			_id: id,
// 			flags: {
// 				[SYSTEM_NAME]: {
// 					[ItemFlags.Container]: container_id,
// 				},
// 			},
// 			system: {
// 				name: modifier.name,
// 				notes: modifier.notes,
// 				reference: modifier.reference,
// 				cost: parseInt(modifier.cost) || 0,
// 			},
// 		}
// 		return data
// 	}
//
// 	private async _getSkillItemData(skill: MookSkill): Promise<DeepPartial<SkillSource>> {
// 		const id = fu.randomID()
// 		const data: DeepPartial<SkillSource> = {
// 			name: skill.name,
// 			type: ItemType.Skill,
// 			_id: id,
// 			flags: { [SYSTEM_NAME]: { [ItemFlags.Container]: null } },
// 			system: {
// 				name: skill.name,
// 				specialization: skill.specialization,
// 				notes: skill.notes,
// 				reference: skill.reference,
// 				tech_level: skill.tech_level,
// 				difficulty: `${skill.attribute}/${skill.difficulty}`,
// 				points: skill.points,
// 			},
// 		}
// 		return data
// 	}
//
// 	private async _getSpellItemData(spell: MookSpell): Promise<DeepPartial<SpellSource>> {
// 		const id = fu.randomID()
// 		const data: DeepPartial<SpellSource> = {
// 			name: spell.name,
// 			type: ItemType.Spell,
// 			_id: id,
// 			flags: { [SYSTEM_NAME]: { [ItemFlags.Container]: null } },
// 			system: {
// 				name: spell.name,
// 				notes: spell.notes,
// 				reference: spell.reference,
// 				tech_level: spell.tech_level,
// 				difficulty: `${spell.attribute}/${spell.difficulty}`,
// 				points: spell.points,
// 				college: spell.college,
// 			},
// 		}
// 		return data
// 	}
//
// 	private _getMeleeItemData(melee: MookMelee): DeepPartial<MeleeWeaponSource> {
// 		const id = fu.randomID()
// 		const data: DeepPartial<MeleeWeaponSource> = {
// 			name: melee.name,
// 			type: ItemType.MeleeWeapon,
// 			_id: id,
// 			flags: { [SYSTEM_NAME]: { [ItemFlags.Container]: null } },
// 			system: {
// 				usage: melee.name,
// 				usage_notes: melee.notes,
// 				strength: melee.strength,
// 				damage: melee.damage,
// 				reach: melee.reach,
// 				parry: melee.parry,
// 				block: melee.block,
// 				defaults: [
// 					{
// 						type: gid.Ten,
// 						modifier: melee.level - 10,
// 					},
// 				],
// 			},
// 		}
// 		return data
// 	}
//
// 	private _getRangedItemData(ranged: MookRanged): DeepPartial<RangedWeaponSource> {
// 		const id = fu.randomID()
// 		const data: DeepPartial<RangedWeaponSource> = {
// 			name: ranged.name,
// 			type: ItemType.RangedWeapon,
// 			_id: id,
// 			flags: { [SYSTEM_NAME]: { [ItemFlags.Container]: null } },
// 			system: {
// 				usage: ranged.name,
// 				usage_notes: ranged.notes,
// 				strength: ranged.strength,
// 				damage: ranged.damage,
// 				accuracy: ranged.accuracy,
// 				range: ranged.range,
// 				rate_of_fire: ranged.rate_of_fire,
// 				shots: ranged.shots,
// 				bulk: ranged.bulk,
// 				recoil: ranged.recoil,
// 				defaults: [
// 					{
// 						type: gid.Ten,
// 						modifier: ranged.level - 10,
// 					},
// 				],
// 			},
// 		}
// 		return data
// 	}
//
// 	private _getNoteItemData(note: string): DeepPartial<NoteSource> {
// 		const id = fu.randomID()
// 		const data: DeepPartial<NoteSource> = {
// 			name: "Note",
// 			type: ItemType.Note,
// 			_id: id,
// 			system: {
// 				text: note,
// 			},
// 		}
// 		return data
// 	}
//
// 	resolveAttributeName(id: string): string {
// 		const def = this.resolveAttributeDef(id)
// 		if (def) return def.name
// 		return "unknown"
// 	}
//
// 	resolveAttributeDef(id: string): AttributeDef | null {
// 		const a = this.attributes?.get(id)
// 		if (a) return a.definition
// 		return null
// 	}
// }
