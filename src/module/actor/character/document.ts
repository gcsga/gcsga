import { ActorGURPS } from "@actor"
import { TokenDocumentGURPS } from "@scene"
import { CharacterFlagDefaults, CharacterFlags, CharacterSource, CharacterSystemData, PointsBreakdown } from "./data.ts"
import {
	AbstractAttributeDef,
	AbstractAttributeObj,
	AttributeGURPS,
	AttributeDef,
	AttributeObj,
	BodyGURPS,
	ConditionalModifier,
	MoveBonusType,
	MoveType,
	MoveTypeDef,
	MoveTypeObj,
	ResourceTracker,
	ResourceTrackerDef,
	ResourceTrackerObj,
	SkillBonus,
	SkillDefault,
	ThresholdOp,
	WeaponBonus,
} from "@system"
import { AbstractWeaponGURPS, SkillGURPS, TechniqueGURPS, TraitContainerGURPS, TraitGURPS } from "@item"
import { ActorFlags, ItemType, SETTINGS, SYSTEM_NAME, WeaponType, gid } from "@module/data/constants.ts"
import {
	Int,
	LocalizeGURPS,
	TooltipGURPS,
	attribute,
	container,
	damageProgression,
	equalFold,
	feature,
	getCurrentTime,
	skillsel,
	stlimit,
	wsel,
} from "@util"
import { addWeaponBonusToMap } from "@actor/helpers.ts"
import { DiceGURPS } from "@module/dice/index.ts"
import { ItemInstances } from "@item/types.ts"
import { CharacterLifts } from "./lifts.ts"
import { CharacterEncumbrance } from "./encumbrance.ts"
import { SheetSettingsObj } from "@module/data/sheet-settings.ts"

class CharacterGURPS<
	TParent extends TokenDocumentGURPS | null = TokenDocumentGURPS | null,
> extends ActorGURPS<TParent> {
	/** Attribute Collections */
	declare attributes: Map<string, AttributeGURPS<this>>
	private declare _prevAttributes: Map<string, AttributeGURPS<this>>
	declare resourceTrackers: Map<string, ResourceTracker<this>>
	declare moveTypes: Map<string, MoveType<this>>
	declare pointsBreakdown: PointsBreakdown

	/** Hit location table */
	declare hitLocationTable: BodyGURPS<this>
	/** Encumbrance */
	declare encumbrance: CharacterEncumbrance<this>
	/** Various lift types */
	declare lifts: CharacterLifts<this>
	/** Accumulated reaction bonuses */
	declare reactions: ConditionalModifier[]
	/** Accumulated conditional modifier bonuses */
	declare conditionalModifiers: ConditionalModifier[]

	get parryBonus(): number {
		return this.attributeBonusFor(gid.Parry, stlimit.Option.None) ?? 0
	}

	get blockBonus(): number {
		return this.attributeBonusFor(gid.Block, stlimit.Option.None) ?? 0
	}

	get dodgeBonus(): number {
		return this.attributeBonusFor(gid.Dodge, stlimit.Option.None) ?? 0
	}

	get currentMove(): number {
		return this.encumbrance.current.move.normal
	}

	get effectiveMove(): number {
		return this.encumbrance.current.move.effective
	}

	get effectiveSprint(): number {
		return Math.max(this.encumbrance.current.move.effective * 1.2, this.encumbrance.current.move.effective + 1)
	}

	get currentDodge(): number {
		return this.encumbrance.current.dodge.normal
	}

	get effectiveDodge(): number {
		return this.encumbrance.current.dodge.effective
	}

	get strengthOrZero(): number {
		if (!this.attributes.has(gid.Strength)) return 0
		return Math.max(this.resolveAttributeCurrent(gid.Strength), 0)
	}

	get strikingST(): number {
		return this.strengthOrZero + this.attributeBonusFor(gid.Strength, stlimit.Option.StrikingOnly)
	}

	get liftingST(): number {
		return this.strengthOrZero + this.attributeBonusFor(gid.Strength, stlimit.Option.LiftingOnly)
	}

	get throwingST(): number {
		return this.strengthOrZero + this.attributeBonusFor(gid.Strength, stlimit.Option.ThrowingOnly)
	}

	get thrust(): DiceGURPS {
		if (this.flags[SYSTEM_NAME][ActorFlags.AutoDamage]?.active === false)
			return new DiceGURPS(this.flags[SYSTEM_NAME][ActorFlags.AutoDamage].thrust)
		return this.thrustFor(this.strikingST)
	}

	get swing(): DiceGURPS {
		if (this.flags[SYSTEM_NAME][ActorFlags.AutoDamage]?.active === false)
			return new DiceGURPS(this.flags[SYSTEM_NAME][ActorFlags.AutoDamage].swing)
		return this.swingFor(this.strikingST)
	}

	get dodgeAttribute(): DeepPartial<AttributeGURPS<this>> {
		return {
			id: gid.Dodge,
			definition: {
				combinedName: LocalizeGURPS.translations.gurps.attributes.dodge,
			} as AttributeDef,
			effective: this.effectiveDodge,
			current: this.currentDodge,
		}
	}

	get sizeModAttribute(): DeepPartial<AttributeGURPS<this>> {
		return {
			definition: {
				combinedName: LocalizeGURPS.translations.gurps.character.sm,
			} as AttributeDef,
			effective: this.adjustedSizeModifier,
		}
	}

	protected override async _preCreate(
		data: this["_source"],
		options: DocumentModificationContext<TParent>,
		user: User<Actor<null>>,
	): Promise<boolean | void> {
		await super._preCreate(data, options, user)

		const date = getCurrentTime()
		const defaultData = {
			_id: data._id,
			system: fu.mergeObject(data.system ?? {}, {
				settings: CharacterGURPS.getDefaultSettings(),
				total_points: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.initial_points`),
				created_date: date,
				modified_date: date,
			}),
			flags: CharacterFlagDefaults,
		}

		this.updateSource(defaultData)
	}

	private static getDefaultSettings(): SheetSettingsObj {
		return {
			...game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.settings`),
			body_type: {
				name: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.name`),
				roll: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.roll`),
				locations: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`),
			},
			attributes: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`),
			resource_trackers: game.settings.get(
				SYSTEM_NAME,
				`${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`,
			),
			move_types: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`),
		}
	}

	thrustFor(st: number): DiceGURPS {
		return damageProgression.thrustFor(this.settings.damage_progression, st)
	}

	swingFor(st: number): DiceGURPS {
		return damageProgression.swingFor(this.settings.damage_progression, st)
	}

	override resolveAttributeCurrent(id: string): number {
		const attribute = this.attributes.get(id)
		if (!attribute) {
			console.error(`GURPS | Cannot resolve attribute: $${id}`)
			return 0
		}
		return attribute.current
	}

	override resolveAttributeEffective(id: string): number {
		const attribute = this.attributes.get(id)
		if (!attribute) {
			console.error(`GURPS | Cannot resolve attribute: $${id}`)
			return 0
		}
		return attribute.effective
	}

	override resolveAttributeMax(id: string): number {
		const attribute = this.attributes.get(id)
		if (!attribute) {
			console.error(`GURPS | Cannot resolve attribute: $${id}`)
			return 0
		}
		return attribute.max
	}

	override resolveAttributeName(id: string): string {
		const attribute = this.attributes.get(id)
		if (!attribute) {
			console.error(`GURPS | Cannot resolve attribute: $${id}`)
			return ""
		}
		if (!attribute.definition) {
			console.error(`GURPS | Cannot resolve attribute definition: $${id}`)
			return ""
		}
		return attribute.definition?.name
	}

	weightCarried(forSkills: boolean): number {
		const total = this.itemCollections.carriedEquipment.reduce((n, e) => {
			if (!e.container) return n + e.extendedWeight(forSkills, this.system.settings.default_weight_units)
			return n
		}, 0)
		return Int.from(total, 4)
	}

	wealthCarried(): number {
		let value = 0
		for (const e of this.itemCollections.carriedEquipment) {
			if (!e.container) value += e.extendedValue
		}
		return Int.from(value, 4)
	}

	wealthNotCarried(): number {
		let value = 0
		for (const e of this.itemCollections.carriedEquipment) {
			if (!e.container) value += e.extendedValue
		}
		return Int.from(value, 4)
	}

	effectiveST(initialST: number): number {
		const divisor = 2 * Math.min(this.countThresholdOpMet(ThresholdOp.HalveST), 2)
		let ST = initialST
		if (divisor > 0) ST = Math.ceil(initialST / divisor)
		if (ST < 1 && initialST > 0) return 1
		return ST
	}

	baseSkill(def: SkillDefault | null, require_points: boolean): SkillGURPS | null {
		if (!def) return null
		if (!def.skillBased) return null
		return this.bestSkillNamed(def.name ?? "", def.specialization ?? "", require_points, null)
	}

	countThresholdOpMet(op: ThresholdOp): number {
		let total = 0
		Array.from(this.attributes.values())
			.filter(a => a.definition?.type === attribute.Type.Pool)
			.forEach(a => {
				if (!a.applyOps) return
				const threshold = a.currentThreshold
				if (threshold && threshold.ops?.includes(op)) total += 1
			})
		return total
	}

	bestWeaponNamed(
		name: string,
		usage: string,
		type: WeaponType,
		excludes: Map<string, boolean> | null,
	): AbstractWeaponGURPS | null {
		let best: AbstractWeaponGURPS | null = null
		let level = -Infinity
		for (const w of this.weaponNamed(name, usage, type, excludes)) {
			const skillLevel = w.level
			if (!best || level < skillLevel) {
				best = w
				level = skillLevel
			}
		}
		return best
	}

	weaponNamed(
		name: string,
		usage: string,
		type: WeaponType,
		excludes: Map<string, boolean> | null,
	): Collection<AbstractWeaponGURPS> {
		const weapons: Collection<AbstractWeaponGURPS> = new Collection()
		for (const wep of this.itemCollections.equippedWeapons(type)) {
			if (
				(excludes === null || !excludes.get(wep.name!)) &&
				!(wep.container instanceof CompendiumCollection) &&
				wep.container?.name === name &&
				(usage === "" || usage === wep.usage)
			)
				weapons.set(`${wep.container?.id}-${wep.id}`, wep)
		}
		return weapons
	}

	bestSkillNamed(
		name: string,
		specialization: string,
		require_points: boolean,
		excludes: Map<string, boolean> | null,
	): SkillGURPS | null {
		let best: SkillGURPS | null = null
		let level = -Infinity
		for (const sk of this.skillNamed(name, specialization, require_points, excludes)) {
			if (sk.isOfType(ItemType.Technique)) continue
			const skillLevel = sk.calculateLevel().level
			if (!best || level < skillLevel) {
				best = sk
				level = skillLevel
			}
		}
		return best
	}

	skillNamed(
		name: string,
		specialization: string,
		require_points: boolean,
		excludes: Map<string, boolean> | null,
	): Collection<SkillGURPS | TechniqueGURPS> {
		const skills: Collection<SkillGURPS | TechniqueGURPS> = new Collection()
		const defaultSkills = CONFIG.GURPS.skillDefaults
		for (const item of defaultSkills) {
			if (
				(excludes === null || !excludes.get(item.name!)) &&
				item.isOfType(ItemType.Skill, ItemType.Technique) &&
				item.name === name &&
				(specialization === "" || specialization === item.specialization)
			) {
				item.dummyActor = this
				item.points = 0
				skills.set(item.id, item)
			}
		}
		for (const item of this.itemCollections.skills) {
			if (
				(excludes === null || !excludes.get(item.name!)) &&
				item.isOfType(ItemType.Skill, ItemType.Technique) &&
				item.name === name &&
				(!require_points || item.isOfType(ItemType.Technique) || item.adjustedPoints() > 0) &&
				(specialization === "" || specialization === item.specialization)
			)
				skills.set(item.id, item)
		}
		return skills
	}

	// Feature Bonuses
	attributeBonusFor(
		attributeId: string,
		limitation: stlimit.Option,
		effective = false,
		tooltip: TooltipGURPS | null = null,
	): number {
		let total = 0
		if (this.features)
			for (const feature of this.features.attributeBonuses) {
				if (
					feature.limitation === limitation &&
					feature.attribute === attributeId &&
					(!effective || feature.effective === effective)
				) {
					total += feature.adjustedAmount
					feature.addToTooltip(tooltip)
				}
			}
		return total
	}

	moveBonusFor(
		id: string,
		limitation: MoveBonusType,
		effective = false,
		tooltip: TooltipGURPS | null = null,
	): number {
		let total = 0
		if (this.features)
			for (const feature of this.features.moveBonuses) {
				if (
					feature.limitation === limitation &&
					feature.move_type === id &&
					(!effective || feature.effective === effective)
				) {
					total += feature.adjustedAmount
					feature.addToTooltip(tooltip)
				}
			}
		return total
	}

	skillBonusFor(name: string, specialization: string, tags: string[], tooltip: TooltipGURPS | null = null): number {
		let total = 0
		if (this.features)
			for (const f of this.features.skillBonuses) {
				// weird thing happening where phantom features appear and cause errors
				if (!f.owner && !f.subOwner) continue
				if (
					f.name?.matches(name) &&
					f.specialization?.matches(specialization) &&
					f.tags?.matchesList(...tags)
				) {
					total += f.adjustedAmount
					f.addToTooltip(tooltip)
				}
			}
		return total
	}

	skillPointBonusFor(
		name: string,
		specialization: string,
		tags: string[],
		tooltip: TooltipGURPS | null = null,
	): number {
		let total = 0
		if (this.features)
			for (const f of this.features.skillPointBonuses) {
				if (
					f.name?.matches(name) &&
					f.specialization?.matches(specialization) &&
					f.tags?.matchesList(...tags)
				) {
					total += f.adjustedAmount
					f.addToTooltip(tooltip)
				}
			}
		return total
	}

	spellBonusFor(
		name: string,
		powerSource: string,
		colleges: string[],
		tags: string[],
		tooltip: TooltipGURPS | null = null,
	): number {
		let total = 0
		if (this.features)
			for (const f of this.features.spellBonuses) {
				if (f.tags.matchesList(...tags)) {
					if (f.matchForType(name, powerSource, colleges)) {
						total += f.adjustedAmount
						f.addToTooltip(tooltip)
					}
				}
			}
		return total
	}

	spellPointBonusesFor(
		name: string,
		powerSource: string,
		colleges: string[],
		tags: string[],
		tooltip: TooltipGURPS | null = null,
	): number {
		let total = 0
		if (this.features)
			for (const f of this.features.spellPointBonuses) {
				if (f.tags.matchesList(...tags)) {
					if (f.matchForType(name, powerSource, colleges)) {
						total += f.adjustedAmount
						f.addToTooltip(tooltip)
					}
				}
			}
		return total
	}

	addWeaponWithSkillBonusesFor(
		name: string,
		specialization: string,
		usage: string,
		tags: string[],
		dieCount: number,
		tooltip: TooltipGURPS | null = null,
		m: Map<WeaponBonus, boolean> | null = null,
		allowedFeatureTypes: Map<feature.Type, boolean> = new Map(),
	): Map<WeaponBonus, boolean> {
		if (m === null) m = new Map()
		let rsl = -Infinity
		for (const sk of this.skillNamed(name, specialization, true, null)) {
			if (rsl < sk.level.relativeLevel) rsl = sk.level.relativeLevel
		}
		if (this.features)
			for (const f of this.features.weaponBonuses) {
				if (
					allowedFeatureTypes.get(f.type) &&
					f.selection_type === wsel.Type.WithRequiredSkill &&
					f.name?.matches(name) &&
					f.specialization?.matches(specialization) &&
					f.level?.matches(rsl) &&
					f.usage?.matches(usage) &&
					f.tags?.matchesList(...tags)
				) {
					addWeaponBonusToMap(f, dieCount, tooltip, m)
				}
			}
		return m
	}

	addNamedWeaponBonusesFor(
		name: string,
		usage: string,
		tags: string[],
		dieCount: number,
		tooltip: TooltipGURPS | null = null,
		m: Map<WeaponBonus, boolean> = new Map(),
		allowedFeatureTypes: Map<feature.Type, boolean> = new Map(),
	): Map<WeaponBonus, boolean> {
		if (this.features)
			for (const f of this.features.weaponBonuses) {
				if (
					allowedFeatureTypes.get(f.type) &&
					f.selection_type === wsel.Type.WithName &&
					f.name?.matches(name) &&
					f.usage?.matches(usage) &&
					f.tags?.matchesList(...tags)
				) {
					addWeaponBonusToMap(f, dieCount, tooltip, m)
				}
			}
		return m
	}

	namedWeaponSkillBonusesFor(
		name: string,
		usage: string,
		tags: string[],
		tooltip: TooltipGURPS | null,
	): SkillBonus[] {
		const bonuses: SkillBonus[] = []
		if (this.features)
			for (const f of this.features.skillBonuses) {
				if (
					f.selection_type === skillsel.Type.WeaponsWithName &&
					f.name?.matches(name) &&
					f.specialization?.matches(usage) &&
					f.tags?.matchesList(...tags)
				) {
					bonuses.push(f)
					f.addToTooltip(tooltip)
				}
			}
		return bonuses
	}

	costReductionFor(attributeID: string): number {
		let total = 0
		if (this.features)
			for (const f of this.features.costReductions) {
				if (f.attribute === attributeID) {
					total += f.percentage ?? 0
				}
			}
		if (total > 80) total = 80
		return Math.max(total, 0)
	}

	override addDRBonusesFor(
		locationID: string,
		tooltip: TooltipGURPS | null = null,
		drMap: Map<string, number> = new Map(),
	): Map<string, number> {
		let isTopLevel = false
		for (const location of this.hitLocationTable.locations) {
			if (location.id === locationID) {
				isTopLevel = true
				break
			}
		}
		if (this.features)
			for (const f of this.features.drBonuses) {
				if ((f.location === gid.All && isTopLevel) || equalFold(locationID, f.location)) {
					const current = drMap.get(f.specialization!.toLowerCase()) ?? 0
					drMap.set(f.specialization!.toLowerCase(), current + f.adjustedAmount)
					f.addToTooltip(tooltip)
				}
			}
		return drMap
	}

	protected override _initialize(options?: Record<string, unknown>): void {
		// this.attributes ??= new Map()
		// this.resourceTrackers ??= new Map()
		// this.moveTypes ??= new Map()
		super._initialize(options)
	}

	override prepareBaseData(): void {
		super.prepareBaseData()

		this.variableResolverSets = new Set(["attributes", "resourceTrackers", "moveTypes"])

		// Initialize atributes if they do not exist
		if (this.system.attributes.length === 0)
			this.system.attributes = this.generateNewAttributes(this.settings.attributes)
		// Initialize resource trackers if they do not exist
		if (this.system.resource_trackers.length === 0)
			this.system.resource_trackers = this.generateNewAttributes(this.settings.resource_trackers)
		// Initialize atributes if they do not exist
		if (this.system.move_types.length === 0)
			this.system.move_types = this.generateNewAttributes(this.settings.move_types)

		this.attributes = new Map(
			this.system.attributes
				.map((value, index) => {
					return new AttributeGURPS(this, value, index)
				})
				.map(e => [e.id, e]),
		)
		this.resourceTrackers = new Map(
			this.system.resource_trackers
				.map((value, index) => {
					return new ResourceTracker(this, value, index)
				})
				.map(e => [e.id, e]),
		)
		this.moveTypes = new Map(
			this.system.move_types
				.map((value, index) => {
					return new MoveType(this, value, index)
				})
				.map(e => [e.id, e]),
		)

		this.hitLocationTable = BodyGURPS.fromObject(this.system.settings.body_type, this)
		this.hitLocationTable.updateRollRanges()
	}

	generateNewAttributes<TDef extends AttributeDef>(definitions: TDef[]): AttributeObj[]
	generateNewAttributes<TDef extends ResourceTrackerDef>(definitions: TDef[]): ResourceTrackerObj[]
	generateNewAttributes<TDef extends MoveTypeDef>(definitions: TDef[]): MoveTypeObj[]
	generateNewAttributes<TDef extends AbstractAttributeDef>(definitions: TDef[]): AbstractAttributeObj[] {
		const values: AbstractAttributeObj[] = []
		definitions.forEach(definition => {
			values.push(definition.generateNewAttribute())
		})
		return values
	}

	override prepareEmbeddedDocuments(): void {
		// Initial values for lifts and encumbrance, needed for skill level calculation
		this.lifts = new CharacterLifts(this)
		this.encumbrance = new CharacterEncumbrance(this)

		return super.prepareEmbeddedDocuments()
	}

	override prepareDerivedData(): void {
		super.prepareDerivedData()

		this.pointsBreakdown = this.calculatePointsBreakdown()
		if (this.attributes.has(gid.Strength)) {
			this.lifts = new CharacterLifts(this)
			this.encumbrance = new CharacterEncumbrance(this)
		}
		this.reactions = ConditionalModifier.modifiersFromItems(feature.Type.ReactionBonus, this.itemCollections)
		this.conditionalModifiers = ConditionalModifier.modifiersFromItems(
			feature.Type.ConditionalModifierBonus,
			this.itemCollections,
		)
	}

	private calculatePointsBreakdown(): PointsBreakdown {
		const pb = {
			overspent: false,
			ancestry: 0,
			attributes: 0,
			advantages: 0,
			disadvantages: 0,
			quirks: 0,
			skills: 0,
			spells: 0,
			unspent: 0,
			total: 0,
		}
		pb.attributes += Array.from(this.attributes.values()).reduce((acc, att) => {
			return acc + att.points
		}, 0)
		this.itemCollections.traits.forEach(trait => {
			this.calculateSingleTraitPoints(trait, pb)
		})
		this.itemCollections.skills.forEach(skill => {
			if (skill.isOfType(ItemType.SkillContainer)) return
			pb.skills += skill.points
		})
		this.itemCollections.spells.forEach(spell => {
			if (spell.isOfType(ItemType.SpellContainer)) return
			pb.spells += spell.points
		})
		pb.total = this.system.total_points
		const spent = pb.ancestry + pb.attributes + pb.advantages + pb.disadvantages + pb.quirks + pb.skills + pb.spells
		pb.unspent = pb.total - spent
		if (pb.unspent < 0) pb.overspent = true
		return pb
	}

	private calculateSingleTraitPoints(trait: TraitGURPS | TraitContainerGURPS, pb: PointsBreakdown) {
		if (!trait.enabled) return
		if (trait.isOfType(ItemType.TraitContainer)) {
			switch (trait.containerType) {
				case container.Type.Group:
					return trait.children.forEach(child => {
						this.calculateSingleTraitPoints(child, pb)
					})
				case container.Type.Ancestry:
					return (pb.ancestry += trait.adjustedPoints)
				case container.Type.Attributes:
					return (pb.ancestry += trait.adjustedPoints)
				default:
					return
			}
		}
		const points = trait.adjustedPoints
		switch (true) {
			case points === -1:
				return (pb.quirks += points)
			case points > 0:
				return (pb.advantages += points)
			case points < 0:
				return (pb.disadvantages += points)
		}
	}

	override getRollData(): Record<string, unknown> {
		return {
			id: this.id,
			actor: this,
			system: this.system,
		}
	}

	getTrait(name: string): ItemInstances<this>[ItemType.Trait] | null {
		return this.itemTypes[ItemType.Trait].find(trait => trait.enabled && trait.name === name) ?? null
	}

	hasTrait(name: string): boolean {
		return this.itemTypes[ItemType.Trait].some(trait => trait.enabled && trait.name === name)
	}
}

interface CharacterGURPS<TParent extends TokenDocumentGURPS | null = TokenDocumentGURPS | null>
	extends ActorGURPS<TParent> {
	flags: CharacterFlags
	readonly _source: CharacterSource
	system: CharacterSystemData
}

export { CharacterGURPS }
