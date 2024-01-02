import { Attribute, AttributeDefObj, AttributeObj } from "@module/attribute"
import { ActorType, DamageProgression, gid, ItemType, SETTINGS, SYSTEM_NAME } from "@module/data"
import { DiceGURPS } from "@module/dice"
import { damageProgression } from "@util"
import {
	MookData,
	MookEquipment,
	MookMelee,
	MookNote,
	MookProfile,
	MookRanged,
	MookSkill,
	MookSpell,
	MookTrait,
	MookTraitModifier,
} from "./data"
import { MoveTypeDefObj } from "@module/move_type"
import { attribute } from "@util/enum"
import { CharacterGURPS, CharacterSource, Encumbrance } from "@actor"
import {
	BaseItemSourceGURPS,
	ItemFlags,
	MeleeWeaponSource,
	RangedWeaponSource,
	SkillSource,
	SpellSource,
	TraitModifierSource,
} from "@item/data"
import { attribute } from "@util/enum"

export class Mook {
	protected variableResolverExclusions: Map<string, boolean> = new Map()

	settings: {
		attributes: AttributeDefObj[]
		damage_progression: DamageProgression
		move_types: MoveTypeDefObj[]
	}

	system: {
		attributes: AttributeObj[]
	}

	attributes: Map<string, Attribute>

	traits: MookTrait[]

	skills: MookSkill[]

	spells: MookSpell[]

	melee: MookMelee[]

	ranged: MookRanged[]

	equipment: MookEquipment[]

	other_equipment: MookEquipment[]

	notes: MookNote[]

	conditions = []

	profile: MookProfile

	thrust!: DiceGURPS

	swing!: DiceGURPS

	text: {
		traits: string
		skills: string
		spells: string
		melee: string
		ranged: string
		equipment: string
		catchall: string
	}

	update(data: any): void {
		Object.assign(this, mergeObject(this, data))
		this.attributes = this.getAttributes()
	}

	// TODO: need to parse and store proper active defense values
	dodge(_enc: Encumbrance): number {
		return 0
	}

	constructor(data?: Partial<MookData>) {
		this.settings = data?.settings ?? {
			attributes: game.settings.get(
				SYSTEM_NAME,
				`${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`
			) as AttributeDefObj[],
			damage_progression: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.settings`)
				.damage_progression,
			move_types: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`) as MoveTypeDefObj[],
		}
		this.system = data?.system ?? {
			attributes: this.newAttributes(this.settings.attributes),
		}
		this.attributes = this.getAttributes()
		this.traits = data?.traits ?? []
		this.skills = data?.skills ?? []
		this.spells = data?.spells ?? []
		this.melee = data?.melee ?? []
		this.ranged = data?.ranged ?? []
		this.equipment = data?.equipment ?? []
		this.other_equipment = data?.other_equipment ?? []
		this.notes = data?.notes ?? []
		this.profile = data?.profile ?? {
			name: "",
			description: "",
			title: "",
			height: "",
			weight: "",
			SM: 0,
			portrait: foundry.CONST.DEFAULT_TOKEN,
			userdesc: "",
		}
		this.text = {
			traits: "",
			skills: "",
			spells: "",
			melee: "",
			ranged: "",
			equipment: "",
			catchall: "",
		}
		if (this.attributes.has(gid.Strength)) {
			this.thrust = damageProgression.thrustFor(this.settings.damage_progression, this.attributes.get("st")!.max)
			this.swing = damageProgression.swingFor(this.settings.damage_progression, this.attributes.get("st")!.max)
		}
	}

	private newAttributes(defs: AttributeDefObj[]): AttributeObj[] {
		const atts: AttributeObj[] = []
		let i = 0
		for (const def of defs) {
			const attr = new Attribute(this, def.id, i)
			if (
				[
					attribute.Type.PrimarySeparator,
					attribute.Type.SecondarySeparator,
					attribute.Type.PoolSeparator,
				].includes(def.type)
			) {
				atts.push({
					attr_id: attr.id,
					adj: attr.adj,
				})
			} else {
				atts.push({
					attr_id: attr.id,
					adj: attr.adj,
				})
			}
			if (attr.damage) atts[i].damage = attr.damage
			i++
		}
		return atts
	}

	getAttributes(att_array = this.system.attributes): Map<string, Attribute> {
		const attributes: Map<string, Attribute> = new Map()
		if (!att_array.length) return attributes
		att_array.forEach((v, k) => {
			attributes.set(v.attr_id, new Attribute(this, v.attr_id, k, v))
		})
		return attributes
	}

	resolveAttributeCurrent(attr_id: string): number {
		const att = this.attributes?.get(attr_id)?.current
		if (att) return att
		return -Infinity
	}

	skillBonusFor(..._args: any[]): number {
		return 0
	}

	skillPointBonusFor(..._args: any[]): number {
		return 0
	}

	spellBonusFor(..._args: any[]): number {
		return 0
	}

	spellPointBonusFor(..._args: any[]): number {
		return 0
	}

	get adjustedSizeModifier(): number {
		return this.profile.SM
	}

	getFlag(..._args: any[]): unknown {
		return null
	}

	attributeBonusFor(..._args: any[]): number {
		return 0
	}

	moveBonusFor(..._args: any[]): number {
		return 0
	}

	costReductionFor(..._args: any[]): number {
		return 0
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
		let attr: Attribute | undefined = this.attributes.get(parts[0])
		if (!attr) {
			console.warn(`No such variable: $${variableName}`)
			return ""
		}
		let def
		if (attr instanceof Attribute) {
			// Def = this.settings.attributes.find(e => e.id === (attr as Attribute).attr_id)
			def = attr.attribute_def
		}
		if (!def) {
			console.warn(`No such variable definition: $${variableName}`)
			return ""
		}
		this.variableResolverExclusions = new Map()
		return attr?.max.toString()
	}

	isSkillLevelResolutionExcluded(..._args: any[]) {
		return false
	}

	registerSkillLevelResolutionExclusion(..._args: any[]): void {
		// do nothing}
	}

	unregisterSkillLevelResolutionExclusion(..._args: any[]): void {
		// do nothing}
	}

	encumbranceLevel(_forSkills: boolean) {
		return {
			level: 0,
			maximum_carry: 0,
			penalty: 0,
			name: "",
		}
	}

	effectiveST(initialST: number): number {
		return initialST
	}

	get strikingST(): number {
		return this.attributes.get(gid.Strength)?.max ?? 0
	}

	get throwingST(): number {
		return this.attributes.get(gid.Strength)?.max ?? 0
	}

	get liftingST(): number {
		return this.attributes.get(gid.Strength)?.max ?? 0
	}

	async createActor(): Promise<CharacterGURPS> {
		const data: DeepPartial<CharacterSource> = {
			system: {
				settings: mergeObject(game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.settings`), {
					...game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`),
					...this.settings,
				}),
				attributes: this.system.attributes,
				profile: this.profile,
			},
			items: await this._createItemData(),
		}

		const newActor = (await Actor.create(
			{
				name: this.profile.name,
				type: ActorType.Character,
				img: this.profile.portrait,
			},
			{ promptImport: false } as any
		)) as CharacterGURPS
		await newActor?.update(data)
		const updateMap: Array<{ _id: string } & Record<string, any>> = []
		newActor.itemTypes[ItemType.Skill].forEach((item: any, index: number) => {
			updateMap.push({ _id: item.id!, "system.points": item.getPointsForLevel(this.skills[index].level) })
		})
		newActor.itemTypes[ItemType.Spell].forEach((item: any, index: number) => {
			updateMap.push({ _id: item.id!, "system.points": item.getPointsForLevel(this.spells[index].level) })
		})
		await newActor.updateEmbeddedDocuments("Item", updateMap)
		await newActor.sheet?.render(true)
		return newActor
	}

	private async _createItemData(): Promise<DeepPartial<BaseItemSourceGURPS<ItemType, object>>[]> {
		const items: DeepPartial<BaseItemSourceGURPS>[] = []
		for (const trait of this.traits) items.push(...this._getTraitItemData(trait))
		for (const skill of this.skills) items.push(await this._getSkillItemData(skill))
		for (const spell of this.spells) items.push(await this._getSpellItemData(spell))
		for (const melee of this.melee) items.push(this._getMeleeItemData(melee))
		for (const ranged of this.ranged) items.push(this._getRangedItemData(ranged))

		return items
	}

	private _getTraitItemData(trait: MookTrait): DeepPartial<BaseItemSourceGURPS<any>>[] {
		const items: DeepPartial<BaseItemSourceGURPS<any>>[] = []
		const id = randomID()
		const data = {
			name: trait.name,
			type: ItemType.Trait,
			_id: id,
			flags: { [SYSTEM_NAME]: { [ItemFlags.Container]: null } },
			system: {
				name: trait.name,
				notes: trait.notes,
				refererence: trait.reference,
				points: trait.points,
				cr: trait.cr,
				can_level: trait.levels !== 0,
				levels: trait.levels,
			},
		}
		items.push(data)
		// @ts-expect-error not sure why this is complaining
		items.push(...trait.modifiers.map(m => this._getTraitModifierItemData(m, id)))
		return items
	}

	private _getTraitModifierItemData(
		modifier: MookTraitModifier,
		container_id: string
	): DeepPartial<TraitModifierSource>[] {
		const items: DeepPartial<TraitModifierSource>[] = []
		const id = randomID()
		const data: DeepPartial<TraitModifierSource> = {
			name: modifier.name,
			type: ItemType.TraitModifier,
			_id: id,
			flags: {
				[SYSTEM_NAME]: {
					[ItemFlags.Container]: container_id,
				},
			},
			system: {
				name: modifier.name,
				notes: modifier.notes,
				reference: modifier.reference,
				cost: parseInt(modifier.cost),
			},
		}
		items.push(data)
		return items
	}

	private async _getSkillItemData(skill: MookSkill): Promise<DeepPartial<SkillSource>> {
		const id = randomID()
		const data: DeepPartial<SkillSource> = {
			name: skill.name,
			type: ItemType.Skill,
			_id: id,
			flags: { [SYSTEM_NAME]: { [ItemFlags.Container]: null } },
			system: {
				name: skill.name,
				notes: skill.notes,
				reference: skill.reference,
				tech_level: skill.tech_level,
				difficulty: skill.difficulty,
				points: skill.points,
			},
		}
		// const tempSkill =
		// 	await SkillGURPS.create(data as SkillSource, { temporary: true }) as SkillGURPS
		// tempSkill.dummyActor = this
		// tempSkill.updateLevel()
		// while (tempSkill.level.level !== skill.level) {
		// 	tempSkill.incrementSkillLevel(true)
		// 	tempSkill.updateLevel()
		// }
		// data.system!.points = tempSkill.points
		return data
	}

	private async _getSpellItemData(spell: MookSpell): Promise<DeepPartial<SpellSource>> {
		const id = randomID()
		const data: DeepPartial<SpellSource> = {
			name: spell.name,
			type: ItemType.Spell,
			_id: id,
			flags: { [SYSTEM_NAME]: { [ItemFlags.Container]: null } },
			system: {
				name: spell.name,
				notes: spell.notes,
				reference: spell.reference,
				tech_level: spell.tech_level,
				difficulty: spell.difficulty,
				points: spell.points,
				college: spell.college,
			},
		}
		// const tempSpell =
		// 	await SpellGURPS.create(data as SpellSource, { temporary: true }) as SpellGURPS
		// tempSpell.dummyActor = this
		// tempSpell.updateLevel()
		// while (tempSpell.level.level !== spell.level) {
		// 	tempSpell.incrementSkillLevel()
		// 	tempSpell.updateLevel()
		// }
		// data.system!.points = tempSpell.points
		return data
	}

	private _getMeleeItemData(melee: MookMelee): DeepPartial<MeleeWeaponSource> {
		const id = randomID()
		const data: DeepPartial<MeleeWeaponSource> = {
			name: melee.name,
			type: ItemType.MeleeWeapon,
			_id: id,
			flags: { [SYSTEM_NAME]: { [ItemFlags.Container]: null } },
			system: {
				usage: melee.name,
				usage_notes: melee.notes,
				strength: melee.strength,
				damage: melee.damage,
				reach: melee.reach,
				parry: melee.parry,
				block: melee.block,
				defaults: [
					{
						type: gid.Ten,
						modifier: melee.level - 10,
					},
				],
			},
		}
		return data
	}

	private _getRangedItemData(ranged: MookRanged): DeepPartial<RangedWeaponSource> {
		const id = randomID()
		const data: DeepPartial<RangedWeaponSource> = {
			name: ranged.name,
			type: ItemType.RangedWeapon,
			_id: id,
			flags: { [SYSTEM_NAME]: { [ItemFlags.Container]: null } },
			system: {
				usage: ranged.name,
				usage_notes: ranged.notes,
				strength: ranged.strength,
				damage: ranged.damage,
				accuracy: ranged.accuracy,
				range: ranged.range,
				rate_of_fire: ranged.rate_of_fire,
				shots: ranged.shots,
				bulk: ranged.bulk,
				recoil: ranged.recoil,
				defaults: [
					{
						type: gid.Ten,
						modifier: ranged.level - 10,
					},
				],
			},
		}
		return data
	}
}
