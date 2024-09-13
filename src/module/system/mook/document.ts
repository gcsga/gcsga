import { ActorFlags, ActorType, SETTINGS, SYSTEM_NAME, gid } from "@module/data/index.ts"
import { TooltipGURPS, progression, sanitize, stlimit } from "@util"
import {
	MookEquipment,
	MookMelee,
	MookNote,
	MookRanged,
	MookSkill,
	MookSpell,
	MookTrait,
	MookWeapon,
} from "./components.ts"
import { MookSchema } from "./data.ts"
import { CharacterGURPS } from "@actor"
import { CharacterFlags, CharacterSource } from "@actor/character/data.ts"
import {
	ItemSourceGURPS,
	MeleeWeaponSource,
	RangedWeaponSource,
	SkillSource,
	SpellSource,
	TraitModifierSource,
	TraitSource,
} from "@item/data/index.ts"
import { DiceGURPS } from "../dice.ts"
import { AttributeDef, AttributeGURPS } from "@system/attribute/index.ts"
import { MoveTypeDef } from "@system/move-type/index.ts"

class Mook extends foundry.abstract.DataModel<null, MookSchema> {
	declare text: string
	declare catchall: string

	declare attributes: Map<string, AttributeGURPS>
	private declare _prevAttributes: Map<string, AttributeGURPS>
	declare settings: {
		attributes: AttributeDef[]
		damage_progression: progression.Option
	}

	constructor(data: DeepPartial<SourceFromSchema<MookSchema>>, options?: DataModelConstructionOptions<null>) {
		super(data, options)

		this.settings ??= { attributes: [], damage_progression: this.damage_progression }

		this.settings.attributes =
			data.system?.settings?.attributes?.map(e => new AttributeDef(e!, { parent: this })) ?? []
		if (data.traits) {
			for (const e of data.traits) {
				if (!e) continue
				this.traits.push(new MookTrait(e, { parent: this }))
			}
		}
		if (data.skills) {
			for (const e of data.skills) {
				if (!e) continue
				this.skills.push(new MookSkill(e, { parent: this }))
			}
		}
		if (data.spells) {
			for (const e of data.spells) {
				if (!e) continue
				this.spells.push(new MookSpell(e, { parent: this }))
			}
		}
		if (data.melee) {
			for (const e of data.melee) {
				if (!e) continue
				this.melee.push(new MookMelee(e, { parent: this }))
			}
		}
		if (data.ranged) {
			for (const e of data.ranged) {
				if (!e) continue
				this.ranged.push(new MookRanged(e, { parent: this }))
			}
		}
		if (data.equipment) {
			for (const e of data.equipment) {
				if (!e) continue
				this.equipment.push(new MookEquipment(e, { parent: this }))
			}
		}
		if (data.otherEquipment) {
			for (const e of data.otherEquipment) {
				if (!e) continue
				this.otherEquipment.push(new MookEquipment(e, { parent: this }))
			}
		}
		if (data.notes) {
			for (const e of data.notes) {
				if (!e) continue
				this.notes.push(new MookNote(e, { parent: this }))
			}
		}

		this.system.attributes = this.settings.attributes.map(value => {
			return value.generateNewAttribute().toObject()
		})
		this.prepareData()
	}

	static override defineSchema(): MookSchema {
		const fields = foundry.data.fields

		return {
			system: new fields.SchemaField({
				attributes: new fields.ArrayField(new fields.SchemaField(AttributeGURPS.defineSchema())),
				settings: new fields.SchemaField({
					attributes: new fields.ArrayField(new fields.SchemaField(AttributeDef.defineSchema()), {
						initial: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`),
					}),
					move_types: new fields.ArrayField(new fields.SchemaField(MoveTypeDef.defineSchema())),
				}),
			}),
			profile: new fields.SchemaField({
				name: new fields.StringField({ required: true, nullable: false, initial: "Mook" }),
				description: new fields.StringField({ required: true, nullable: false, initial: "" }),
				title: new fields.StringField({ required: true, nullable: false, initial: "" }),
				height: new fields.StringField({ required: true, nullable: false, initial: "" }),
				weight: new fields.StringField({ required: true, nullable: false, initial: "" }),
				SM: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
				portrait: new fields.FilePathField({
					required: false,
					nullable: false,
					categories: ["IMAGE"],
					initial: Actor.DEFAULT_ICON,
				}),
				userdesc: new fields.StringField({ required: true, nullable: false, initial: "" }),
			}),
			damage_progression: new fields.StringField({
				choices: progression.Options,
				required: true,
				nullable: false,
				initial: progression.Option.BasicSet,
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

	prepareData(): void {
		this.attributes = new Map()
		// 	this.system.attributes.map((value, order) => {
		// 		return [value.id!, new AttributeGURPS(value, { parent: this, order })]
		// 	}),
		// )
		this.system.attributes.forEach((value, order) => {
			this.attributes.set(value.id!, new AttributeGURPS(value, { parent: this, order }))
		})
	}

	parseStatblock(text: string): void {
		this.text = this._sanitizeStatblock(text)

		// Reset melee and ranged as these are set twice
		this.melee = []
		this.ranged = []

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

	async createActor(): Promise<CharacterGURPS | null> {
		const attributes = Object.values(this.attributes)

		const items: DeepPartial<ItemSourceGURPS>[] = [
			...this.traits.reduce((acc: DeepPartial<TraitSource | TraitModifierSource>[], e) => {
				acc.push(...e.toItemSource(null))
				return acc
			}, []),
			...this.skills.reduce((acc: DeepPartial<SkillSource>[], e) => {
				acc.push(...e.toItemSource(null))
				return acc
			}, []),
			...this.spells.reduce((acc: DeepPartial<SpellSource>[], e) => {
				acc.push(...e.toItemSource(null))
				return acc
			}, []),
			...this.melee.reduce((acc: DeepPartial<MeleeWeaponSource>[], e) => {
				acc.push(...e.toItemSource(null))
				return acc
			}, []),
			...this.ranged.reduce((acc: DeepPartial<RangedWeaponSource>[], e) => {
				acc.push(...e.toItemSource(null))
				return acc
			}, []),
		]

		const data: Omit<DeepPartial<CharacterSource>, "name" | "type" | "_id"> & {
			name: string
			type: ActorType.Character
		} = {
			type: ActorType.Character,
			name: this.profile.name,
			img: this.profile.portrait,
			system: {
				attributes,
				profile: this.profile,
			},
			items,
		}

		const newActor = await CharacterGURPS.create(data)
		if (!newActor) return null

		newActor.sheet?.render(true)
		return newActor
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

				const index = this.system.attributes.findIndex(e => e.id === id)
				this.system.attributes[index].adj! += newValue - currentValue
				// const attribute = this.attributes.get(id)!
				// attribute.adj += newValue - currentValue
				// this.attributes.set(id, attribute)
			}
			this.prepareData()
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

		let text = ""
		let weaponText = ""
		if (skipSeparation) weaponText = this.text
		else {
			if (oldFormat) text = this.text
			else {
				text = this._extractText([], ["Traits:"])
			}

			weaponText = ""
			let beforeText = ""
			let afterText = ""

			// if we come across a line which isn't accepted, don't bother with the rest
			let last_matched = 0
			let at_least_one_level = false
			text.split("\n").forEach(e => {
				if (last_matched > 1 && weaponText.length !== 0) {
					afterText += `${e}\n`
					return
				}
				if (e.match(/^(\w+\s+)*\(\d+\):?/)) {
					weaponText += `${e}\n`
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
					weaponText += `${e}\n`
					last_matched = 0
				} else if (weaponText.length !== 0) {
					weaponText += `${e}\n`
					last_matched += 1
				} else {
					beforeText += `${e}\n`
				}
			})

			if (oldFormat) this.text = beforeText + afterText
			else this.text = `${beforeText + this.text}\n${afterText}`.replace(weaponText, "")

			if (weaponText.includes(".\n")) weaponText = weaponText.replace(/\.\n/g, ";")

			weaponText = (() => {
				let final = ""
				const list = weaponText.split(";")
				for (let line of list) {
					line = line.replace(/\n/, " ")
					if (line.match(/^(\w+\s+)*\(\d+\):?/)) final += `; ${this._cleanLine(line).trim()}`
					else final += ` ${this._cleanLine(line).trim()}`
				}

				return final
			})()
		}

		const weapons = MookWeapon.arrayFromText(weaponText, this)
		this.melee.push(...(weapons.filter(e => e instanceof MookMelee) as MookMelee[]))
		this.ranged.push(...(weapons.filter(e => e instanceof MookRanged) as MookRanged[]))
	}

	private _parseTraits(skipSeparation = false): void {
		// const regex_levels = /\s(\d+)$/
		// const regex_cr = /\((CR:?)?\s*(\d+)\)/

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

		this.traits = MookTrait.arrayFromText(text, this)
	}

	private _parseSkills(skipSeparation = false): void {
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

		this.skills = MookSkill.arrayFromText(text, this)
	}

	private _parseSpells(skipSeparation = false): void {
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

		this.spells = MookSpell.arrayFromText(text, this)
	}

	/**
	 * ActorGURPS compatibility placeholder functions
	 */
	costReductionFor(..._args: unknown[]): number {
		return 0
	}

	attributeBonusFor(
		_attributeId: string | null,
		_limitation: stlimit.Option,
		_tooltip: TooltipGURPS | null = null,
		_temporary = false,
	): number {
		return 0
	}

	temporaryST(initialST: number): number {
		return initialST
	}

	// generateNewAttributes<TDef extends AttributeDef>(definitions: TDef[]): ModelPropsFromSchema<AttributeSchema>[]
	// generateNewAttributes<TDef extends ResourceTrackerDef>(
	// 	definitions: TDef[],
	// ): ModelPropsFromSchema<ResourceTrackerSchema>[]
	// generateNewAttributes<TDef extends MoveTypeDef>(definitions: TDef[]): ModelPropsFromSchema<MoveTypeSchema>[]
	// generateNewAttributes<TDef extends AbstractAttributeDef>(
	// 	definitions: TDef[],
	// ): ModelPropsFromSchema<AbstractAttributeSchema>[] {
	// 	const values: ModelPropsFromSchema<AbstractAttributeSchema>[] = []
	// 	definitions.forEach(definition => {
	// 		values.push(definition.generateNewAttribute().toObject())
	// 	})
	// 	return values
	// }

	protected variableResolverExclusions: Map<string, boolean> = new Map()

	get name(): string {
		return this.profile.name
	}

	get type(): string {
		return "Mook"
	}

	get adjustedSizeModifier(): number {
		return this.profile.SM
	}

	get flags(): CharacterFlags {
		return {
			[SYSTEM_NAME]: {
				[ActorFlags.TargetModifiers]: [],
				[ActorFlags.SelfModifiers]: [],
				[ActorFlags.Import]: { name: "", path: "", last_import: "" },
				[ActorFlags.MoveType]: gid.Ground,
				[ActorFlags.AutoEncumbrance]: { active: true, manual: 0 },
				[ActorFlags.AutoThreshold]: { active: true, manual: {} },
				[ActorFlags.AutoDamage]: { active: true, thrust: new DiceGURPS(), swing: new DiceGURPS() },
			},
		}
	}

	resolveVariable(variableName: string): string {
		if (this.variableResolverExclusions?.has(variableName)) {
			console.warn(`Attempt to resolve variable via itself: $${variableName}`)
			return ""
		}
		if (!this.variableResolverExclusions) this.variableResolverExclusions = new Map()
		this.variableResolverExclusions.set(variableName, true)
		if (gid.SizeModifier === variableName) return this.profile.SM.signedString()
		const parts = variableName.split(".") // TODO: check
		const attr: AttributeGURPS | undefined = this.attributes.get(parts[0])
		if (!attr) {
			console.warn(`No such variable: $${variableName}`)
			return ""
		}
		let def
		if (attr instanceof AttributeGURPS) {
			def = attr.definition
		}
		if (!def) {
			console.warn(`No such variable definition: $${variableName}`)
			return ""
		}
		this.variableResolverExclusions = new Map()
		return attr?.max.toString()
	}
}

interface Mook
	extends foundry.abstract.DataModel<null, MookSchema>,
		Omit<
			ModelPropsFromSchema<MookSchema>,
			"traits" | "skills" | "spells" | "melee" | "ranged" | "equipment" | "otherEquipment" | "notes"
		> {
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

// export class MookOld {
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
// 			type: ItemType.WeaponMelee,
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
// 			type: ItemType.WeaponRanged,
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
