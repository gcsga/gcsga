import { ItemFlags, ItemType, SETTINGS, SYSTEM_NAME, gid } from "@module/data/constants.ts"
import { StringBuilder, difficulty, selfctrl, stdmg } from "@util"
import {
	MookEquipmentSchema,
	MookItemSchema,
	MookMeleeSchema,
	MookNoteSchema,
	MookRangedSchema,
	MookSkillSchema,
	MookSpellSchema,
	MookTraitModifierSchema,
	MookTraitSchema,
	MookWeaponSchema,
	damage_type_matches,
	regex_cr,
	regex_damage_type,
	regex_difficulty,
	regex_levels,
	regex_points,
} from "./data.ts"
import { Mook } from "./document.ts"
import {
	EquipmentSource,
	ItemSourceGURPS,
	MeleeWeaponSource,
	NoteSource,
	RangedWeaponSource,
	SkillSource,
	SpellSource,
	TraitModifierSource,
	TraitSource,
} from "@item/data/index.ts"
import { WeaponDamage, WeaponDamageSchema } from "@item/abstract-weapon/weapon-damage.ts"
import { DiceGURPS } from "../dice.ts"

function cleanLine(text: string): string {
	const start = text
	if (!text) return text
	const pat = "*,.:" // things that just clutter up the text
	if (pat.includes(text[0])) text = text.substring(1)
	if (pat.includes(text[text.length - 1])) text = text.substring(0, text.length - 1)
	text = text.trim()
	return start === text ? text : cleanLine(text)
}

abstract class MookItem<
	TSchema extends MookItemSchema = MookItemSchema,
	TParent extends Mook | MookItem<MookItemSchema> = Mook,
> extends foundry.abstract.DataModel<TParent, TSchema> {
	static override defineSchema(): MookItemSchema {
		const fields = foundry.data.fields

		return {
			type: new fields.StringField({ choices: Object.values(ItemType), required: true, nullable: false }),
			name: new fields.StringField({ required: true, nullable: false }),
			notes: new fields.StringField({ required: true, nullable: false }),
			reference: new fields.StringField({ required: true, nullable: false }),
		}
	}

	toText(): string {
		return this.name
	}

	abstract toItemSource(parentId: string | null): DeepPartial<ItemSourceGURPS>[]

	static arrayFromText(_text: string, _parent: Mook | MookItem<MookItemSchema, Mook>): MookItem[] {
		throw new Error("MookItem.arrayFromText must be implemented!")
	}
}

interface MookItem<TSchema extends MookItemSchema, TParent extends Mook | MookItem<MookItemSchema> = Mook>
	extends foundry.abstract.DataModel<TParent, TSchema>,
		ModelPropsFromSchema<MookItemSchema> {}

class MookTrait extends MookItem<MookTraitSchema> {
	constructor(data: DeepPartial<SourceFromSchema<MookTraitSchema>>, options: DataModelConstructionOptions<Mook>) {
		super(data, options)

		this.modifiers = []
		if (data.modifiers) {
			for (const mod of data.modifiers) {
				if (!mod) continue
				this.modifiers.push(new MookTraitModifier(mod, { parent: this }))
			}
		}
	}

	static override defineSchema(): MookTraitSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			points: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
			cr: new fields.NumberField({
				choices: selfctrl.Rolls,
				required: true,
				nullable: false,
				initial: selfctrl.Roll.NoCR,
			}),
			levels: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
			modifiers: new fields.ArrayField(new fields.SchemaField(MookTraitModifier.defineSchema())),
		}
	}

	override toText(): string {
		const buffer = new StringBuilder()
		buffer.push(this.name)
		if (this.levels !== 0) buffer.push(` ${this.levels}`)
		if (this.points !== 0) buffer.push(` [${this.points}]`)
		if (this.cr !== selfctrl.Roll.NoCR) buffer.push(` (CR:${this.cr})`)
		if (this.modifiers.length !== 0) {
			const subBuffer = new StringBuilder()
			this.modifiers.forEach(mod => {
				if (subBuffer.length !== 0) subBuffer.push("; ")
				subBuffer.push(mod.toText())
			})
			buffer.push(` (${subBuffer.toString()})`)
		}
		return buffer.toString()
	}

	override toItemSource(parentId: string | null = null): DeepPartial<TraitSource | TraitModifierSource>[] {
		const id = fu.randomID()
		const modifiers = this.modifiers.map(mod => mod.toItemSource(id)[0])
		return [
			...modifiers,
			{
				type: ItemType.Trait,
				name: this.name,
				_id: id,
				flags: {
					[SYSTEM_NAME]: {
						[ItemFlags.Container]: parentId,
					},
				},
				system: {
					name: this.name,
					notes: this.notes,
					reference: this.reference,
					base_points: this.points,
					cr: this.cr,
					can_level: this.levels !== 0,
					levels: this.levels,
				},
			},
		]
	}

	static override arrayFromText(text: string, parent: Mook | MookItem<MookItemSchema, Mook>): MookTrait[] {
		if (parent instanceof MookItem) parent = parent.parent

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
			const modifierText = t.match(/\((.+,.+)\)/)?.[1] ?? ""
			let modifiers: SourceFromSchema<MookTraitModifierSchema>[] = []
			if (modifierText.length > 0) {
				modifiers = this._parseTraitModifiers(modifierText)
				t = t.replace(/\(.*\)/, "").trim()
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

			t = cleanLine(t)

			traits.push(
				new MookTrait(
					{
						type: ItemType.Trait,
						name: t,
						points,
						cr,
						levels,
						notes: "",
						reference: "",
						modifiers,
					},
					{ parent },
				),
			)
		})
		return traits
	}

	private static _parseTraitModifiers(text: string): SourceFromSchema<MookTraitModifierSchema>[] {
		const modifiers: SourceFromSchema<MookTraitModifierSchema>[] = []
		const textmods = text.split(";")
		textmods.forEach(m => {
			if (m.split(",").length === 2 && m.split(",")[1].match(/[+-]?\d+%?/)) {
				// assumes common format for modifier notation
				const mod = m.split(",")
				modifiers.push({
					type: ItemType.TraitModifier,
					name: mod[0].trim(),
					cost: mod[1].trim(),
					notes: "",
					reference: "",
				})
			}
		})
		return modifiers
	}
}

interface MookTrait extends MookItem<MookTraitSchema>, Omit<ModelPropsFromSchema<MookTraitSchema>, "modifiers"> {
	modifiers: MookTraitModifier[]
}

class MookTraitModifier extends MookItem<MookTraitModifierSchema, MookTrait> {
	static override defineSchema(): MookTraitModifierSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			cost: new fields.StringField({ required: true, nullable: false, initial: "0" }),
		}
	}

	override toText(): string {
		return `${this.name}, ${this.cost}`
	}

	override toItemSource(parentId: string | null = null): DeepPartial<TraitModifierSource>[] {
		const id = fu.randomID()
		return [
			{
				type: ItemType.TraitModifier,
				name: this.name,
				_id: id,
				flags: {
					[SYSTEM_NAME]: {
						[ItemFlags.Container]: parentId,
					},
				},
				system: {
					name: this.name,
					notes: this.notes,
					reference: this.reference,
					cost: parseInt(this.cost) || 0,
				},
			},
		]
	}
}

interface MookTraitModifier
	extends MookItem<MookTraitModifierSchema, MookTrait>,
		ModelPropsFromSchema<MookTraitModifierSchema> {}

class MookSkill extends MookItem<MookSkillSchema> {
	static override defineSchema(): MookSkillSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			specialization: new fields.StringField({ required: true, nullable: false, initial: "" }),
			tech_level: new fields.StringField({ required: true, nullable: false, initial: "" }),
			attribute: new fields.StringField({ required: true, nullable: false, initial: gid.Dexterity }),
			difficulty: new fields.StringField({
				choices: difficulty.Levels,
				required: true,
				nullable: false,
				initial: difficulty.Level.Average,
			}),
			points: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
			level: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
		}
	}

	override toText(): string {
		const buffer = new StringBuilder()
		buffer.push(this.name)
		if (this.tech_level !== "") buffer.push(`/TL${this.tech_level}`)
		buffer.push(`-${this.level}`)
		buffer.push(` (${this.attribute}/${this.difficulty})`.toUpperCase())
		return buffer.toString()
	}

	override toItemSource(parentId: string | null): DeepPartial<SkillSource>[] {
		const id = fu.randomID()
		return [
			{
				type: ItemType.Skill,
				name: this.name,
				_id: id,
				flags: {
					[SYSTEM_NAME]: {
						[ItemFlags.Container]: parentId,
					},
				},
				system: {
					name: this.name,
					specialization: this.specialization,
					notes: this.notes,
					reference: this.reference,
					tech_level: this.tech_level,
					difficulty: `${this.attribute}/${this.difficulty}`,
				},
			},
		]
	}

	static override arrayFromText(text: string, parent: Mook | MookItem<MookItemSchema, Mook>): MookSkill[] {
		if (parent instanceof MookItem) parent = parent.parent

		const attributes: { name: string; id: string }[] = [
			...game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`).map(e => {
				return { id: e.id, name: e.name }
			}),
			...game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`).map(e => {
				return { id: e.id, name: e.id }
			}),
		]

		const regex_level = /\s?-?(\d+)\s?/
		const regex_difficulty_att = new RegExp(`\\((${attributes.map(e => e.name).join("|")})/([EAHVeahv][Hh]?)\\)`)
		const regex_rsl = new RegExp(`[\\(|\\s](${attributes.map(e => e.name).join("|")})([-+]\\d+)?[\\)|\\s]?`)
		const regex_specialization = /^(?:[A-z-\s]+) \(([A-z-\s]+)\)/
		const regex_tl = /\/TL(\d+\^?)/

		const skills: MookSkill[] = []

		text.split(";").forEach(t => {
			t = cleanLine(t).trim().replace("\n", "")
			if (!t) return

			// Capture points
			let points = 0
			if (t.match(regex_points)) {
				points = parseInt(t.match(regex_points)?.[1] ?? "0")
				t = t.replace(regex_points, "").trim()
			}

			// Capture difficulty
			let attribute: string = gid.Dexterity.toLowerCase()
			let diff = difficulty.Level.Average.toLowerCase()
			if (t.match(regex_difficulty_att)) {
				const match = t.match(regex_difficulty_att)
				attribute = attributes.find(e => e.name === match![1])?.id ?? gid.Intelligence.toLowerCase()
				diff = match![2].toLowerCase() as difficulty.Level
				t = t.replace(regex_difficulty, "").trim()
			} else if (t.match(regex_difficulty)) {
				diff = t.match(regex_difficulty)![1].toLowerCase() as difficulty.Level
				t = t.replace(regex_difficulty, "").trim()
			}

			// Capture RSL
			if (t.match(regex_rsl)) {
				const match = t.match(regex_rsl)!
				attribute = attributes.find(e => e.name === match[1])?.id ?? gid.Dexterity.toLowerCase()
				t = t.replace(regex_rsl, "").trim()
			}

			// Capture level
			let level = 0
			if (t.match(regex_level)) {
				level = parseInt(t.match(regex_level)![1])
				t = t.replace(regex_level, "").trim()
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

			t = cleanLine(t)

			skills.push(
				new MookSkill({
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
				}),
			)
		})

		return skills
	}
}

interface MookSkill extends MookItem<MookSkillSchema>, ModelPropsFromSchema<MookSkillSchema> {}

class MookSpell extends MookItem<MookSpellSchema> {
	static override defineSchema(): MookSpellSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			college: new fields.ArrayField(new fields.StringField()),
			tech_level: new fields.StringField({ required: true, nullable: false, initial: "" }),
			attribute: new fields.StringField({ required: true, nullable: false, initial: gid.Intelligence }),
			difficulty: new fields.StringField({
				choices: difficulty.Levels,
				required: true,
				nullable: false,
				initial: difficulty.Level.Hard,
			}),
			points: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
			level: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
		}
	}

	override toText(): string {
		const buffer = new StringBuilder()
		buffer.push(this.name)
		if (this.tech_level !== "") buffer.push(`/TL${this.tech_level}`)
		buffer.push(`-${this.level}`)
		buffer.push(` (${this.attribute}/${this.difficulty})`.toUpperCase())
		return buffer.toString()
	}

	override toItemSource(parentId: string | null): DeepPartial<SpellSource>[] {
		const id = fu.randomID()
		return [
			{
				type: ItemType.Spell,
				name: this.name,
				_id: id,
				flags: {
					[SYSTEM_NAME]: {
						[ItemFlags.Container]: parentId,
					},
				},
				system: {
					name: this.name,
					college: this.college,
					notes: this.notes,
					reference: this.reference,
					tech_level: this.tech_level,
					difficulty: `${this.attribute}/${this.difficulty}`,
				},
			},
		]
	}

	static override arrayFromText(text: string, parent: Mook | MookItem<MookItemSchema, Mook>): MookSpell[] {
		if (parent instanceof MookItem) parent = parent.parent

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

		const spells: MookSpell[] = []

		text.split(";").forEach(t => {
			t = cleanLine(t).trim().replace("\n", "")
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
			let attribute: string = gid.Intelligence.toLowerCase()
			let diff = difficulty.Level.Hard.toLowerCase()
			if (t.match(regex_difficulty_att)) {
				const match = t.match(regex_difficulty_att)
				attribute = attributes.find(e => e.name === match![1])?.id ?? gid.Intelligence.toLowerCase()
				diff = match![2].toLowerCase() as difficulty.Level
				t = t.replace(regex_difficulty, "").trim()
			} else if (t.match(regex_difficulty)) {
				diff = t.match(regex_difficulty)![1].toLowerCase() as difficulty.Level
				t = t.replace(regex_difficulty, "").trim()
			}

			if (t.match(regex_rsl)) {
				const match = t.match(regex_rsl)!
				attribute = attributes.find(e => e.name === match[1])?.id ?? gid.Intelligence.toLowerCase()
				t = t.replace(regex_rsl, "").trim()
			}

			// Capture TL
			let tl = ""
			if (t.match(regex_tl)) {
				tl = t.match(regex_tl)![1]
				t = t.replace(regex_tl, "").trim()
			}

			t = cleanLine(t)

			spells.push(
				new MookSpell({
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
				}),
			)
		})

		return spells
	}
}

interface MookSpell extends MookItem<MookSpellSchema>, ModelPropsFromSchema<MookSpellSchema> {}

abstract class MookWeapon<TSchema extends MookWeaponSchema = MookWeaponSchema> extends MookItem<TSchema> {
	static override defineSchema(): MookWeaponSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			strength: new fields.StringField({ required: true, nullable: false, initial: "0" }),
			damage: new fields.SchemaField(WeaponDamage.defineSchema()),
			level: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
		}
	}

	static override arrayFromText(text: string, parent: Mook | MookItem<MookItemSchema, Mook>): MookWeapon[] {
		if (parent instanceof MookItem) parent = parent.parent

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

		const weapons: MookWeapon[] = []

		text.split(";").forEach(t => {
			const reference = ""
			let notes = ""

			t = cleanLine(t).trim()
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
			notes = cleanLine(notes)

			if (isRanged) {
				weapons.push(
					new MookRanged(
						{
							type: ItemType.WeaponRanged,
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
						},
						{ parent },
					),
				)
			} else {
				weapons.push(
					new MookMelee(
						{
							type: ItemType.WeaponMelee,
							name,
							reach,
							strength: ST,
							level,
							damage,
							parry,
							block,
							notes,
							reference,
						},
						{ parent },
					),
				)
			}
		})
		return weapons
	}

	private static _parseDamage(input: string): [SourceFromSchema<WeaponDamageSchema>, string] {
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
}

class MookMelee extends MookWeapon<MookMeleeSchema> {
	static override defineSchema(): MookMeleeSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			reach: new fields.StringField({ required: true, nullable: false, initial: "No" }),
			parry: new fields.StringField({ required: true, nullable: false, initial: "No" }),
			block: new fields.StringField({ required: true, nullable: false, initial: "No" }),
		}
	}

	override toText(): string {
		const buffer = new StringBuilder()
		buffer.push(this.name)
		buffer.push(` (${this.level}):`)
		buffer.push(` ${new WeaponDamage(this.damage).toString()}`)
		if (this.strength !== "0") buffer.push(` ST:${this.strength}`)
		if (this.reach !== "No") buffer.push(` Reach: ${this.reach}`)
		if (this.parry !== "No") buffer.push(` Parry: ${this.parry}`)
		if (this.block !== "No") buffer.push(` Block: ${this.block}`)
		return buffer.toString()
	}

	override toItemSource(parentId: string | null): DeepPartial<MeleeWeaponSource>[] {
		const id = fu.randomID()
		return [
			{
				type: ItemType.WeaponMelee,
				name: this.name,
				_id: id,
				flags: {
					[SYSTEM_NAME]: {
						[ItemFlags.Container]: parentId,
					},
				},
				system: {
					usage: this.name,
					usage_notes: this.notes,
					strength: this.strength,
					damage: this.damage,
					reach: this.reach,
					parry: this.parry,
					block: this.block,
					defaults: [
						{
							type: gid.Ten,
							modifier: this.level - 10,
						},
					],
				},
			},
		]
	}
}

interface MookMelee extends MookWeapon<MookMeleeSchema>, ModelPropsFromSchema<MookMeleeSchema> {}

class MookRanged extends MookWeapon<MookRangedSchema> {
	static override defineSchema(): MookRangedSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			accuracy: new fields.StringField({ required: true, nullable: false, initial: "0" }),
			range: new fields.StringField({ required: true, nullable: false, initial: "" }),
			rate_of_fire: new fields.StringField({ required: true, nullable: false, initial: "0" }),
			shots: new fields.StringField({ required: true, nullable: false, initial: "" }),
			bulk: new fields.StringField({ required: true, nullable: false, initial: "" }),
			recoil: new fields.StringField({ required: true, nullable: false, initial: "0" }),
		}
	}

	override toText(): string {
		const buffer = new StringBuilder()
		buffer.push(this.name)
		buffer.push(` (${this.level}):`)
		buffer.push(` ${new WeaponDamage(this.damage).toString()}`)
		if (this.strength !== "0") buffer.push(` ST:${this.strength}`)
		if (this.accuracy !== "") buffer.push(` Acc: ${this.accuracy}`)
		if (this.range !== "") buffer.push(` Range: ${this.range}`)
		if (this.rate_of_fire !== "0") buffer.push(` ROF: ${this.rate_of_fire}`)
		if (this.shots !== "") buffer.push(` Shots: ${this.shots}`)
		if (this.bulk !== "") buffer.push(` Bulk: ${this.bulk}`)
		if (this.recoil !== "0") buffer.push(` Rcl: ${this.recoil}`)
		return buffer.toString()
	}

	override toItemSource(parentId: string | null): DeepPartial<RangedWeaponSource>[] {
		const id = fu.randomID()
		return [
			{
				type: ItemType.WeaponRanged,
				name: this.name,
				_id: id,
				flags: {
					[SYSTEM_NAME]: {
						[ItemFlags.Container]: parentId,
					},
				},
				system: {
					usage: this.name,
					usage_notes: this.notes,
					strength: this.strength,
					damage: this.damage,
					accuracy: this.accuracy,
					range: this.range,
					rate_of_fire: this.rate_of_fire,
					shots: this.shots,
					bulk: this.bulk,
					recoil: this.recoil,
					defaults: [
						{
							type: gid.Ten,
							modifier: this.level - 10,
						},
					],
				},
			},
		]
	}
}

interface MookRanged extends MookWeapon<MookRangedSchema>, ModelPropsFromSchema<MookRangedSchema> {}

class MookEquipment extends MookItem<MookEquipmentSchema> {
	static override defineSchema(): MookEquipmentSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			quantity: new fields.NumberField({ required: true, nullable: false, initial: 1 }),
			tech_level: new fields.StringField({ required: true, nullable: false, initial: "" }),
			legality_class: new fields.StringField({ required: true, nullable: false, initial: "" }),
			value: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
			weight: new fields.StringField({ required: true, nullable: false, initial: "0 lb" }),
			uses: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
			max_uses: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
		}
	}

	override toText(): string {
		const buffer = new StringBuilder()
		buffer.push(this.name)
		return buffer.toString()
	}

	override toItemSource(parentId: string | null): DeepPartial<EquipmentSource>[] {
		const id = fu.randomID()
		return [
			{
				type: ItemType.Equipment,
				name: this.name,
				_id: id,
				flags: {
					[SYSTEM_NAME]: {
						[ItemFlags.Container]: parentId,
					},
				},
				system: {
					description: this.name,
					notes: this.notes,
					quantity: this.quantity,
					tech_level: this.tech_level,
					legality_class: this.legality_class,
					value: this.value,
					weight: this.weight,
					uses: this.uses,
					max_uses: this.max_uses,
					reference: this.reference,
				},
			},
		]
	}
}

interface MookEquipment extends MookItem<MookEquipmentSchema>, ModelPropsFromSchema<MookEquipmentSchema> {}

class MookNote extends MookItem<MookNoteSchema> {
	override toText(): string {
		const buffer = new StringBuilder()
		buffer.push(this.name)
		return buffer.toString()
	}

	override toItemSource(parentId: string | null): DeepPartial<NoteSource>[] {
		const id = fu.randomID()
		return [
			{
				type: ItemType.Note,
				name: this.name,
				_id: id,
				flags: {
					[SYSTEM_NAME]: {
						[ItemFlags.Container]: parentId,
					},
				},
				system: {
					text: this.notes,
					reference: this.reference,
				},
			},
		]
	}
}

interface MookNote extends MookItem<MookNoteSchema>, ModelPropsFromSchema<MookNoteSchema> {}

export {
	MookEquipment,
	MookItem,
	MookMelee,
	MookNote,
	MookRanged,
	MookSkill,
	MookSpell,
	MookTrait,
	MookTraitModifier,
	MookWeapon,
}
