import { BaseActorGURPS, ActorConstructorContextGURPS, ActorFlags } from "@actor/base"
import {
	BaseItemGURPS,
	CR_Features,
	EquipmentContainerGURPS,
	EquipmentGURPS,
	ItemFlags,
	ItemGCS,
	MeleeWeaponGURPS,
	ModifierChoiceSheet,
	NoteContainerGURPS,
	NoteGURPS,
	RangedWeaponGURPS,
	RitualMagicSpellGURPS,
	SkillContainerGURPS,
	SkillGURPS,
	SpellContainerGURPS,
	SpellGURPS,
	TechniqueGURPS,
	TraitContainerGURPS,
	TraitGURPS,
	WeaponType,
} from "@item"
import { ConditionalModifier } from "@module/conditional_modifier"
import { attrPrefix, EFFECT_ACTION, gid, ItemType, SETTINGS, SheetSettings, Stringer, SYSTEM_NAME } from "@module/data"
import { DiceGURPS } from "@module/dice"
import { SETTINGS_TEMP } from "@module/settings"
import { SkillDefault } from "@module/default"
import { TooltipGURPS } from "@module/tooltip"
import {
	damageProgression,
	equalFold,
	Evaluator,
	fxp,
	getCurrentTime,
	LengthUnits,
	LocalizeGURPS,
	newUUID,
	StringCompareType,
	StringCriteria,
	urlToBase64,
	Weight,
	WeightUnits,
} from "@util"
import {
	CharacterFlagDefaults,
	CharacterSource,
	CharacterSystemData,
	DocumentModificationOptionsGURPS,
	Encumbrance,
} from "./data"
import { CharacterImporter } from "./import"
import { HitLocation, HitLocationTable } from "./hit_location"
import { Feature, featureMap, WeaponGURPS } from "@module/config"
import { ConditionID } from "@item/condition"
import Document, { DocumentModificationOptions, Metadata } from "types/foundry/common/abstract/document.mjs"
import { ActorDataConstructorData } from "types/foundry/common/data/data.mjs/actorData"
import { Attribute, AttributeDef, AttributeDefObj, AttributeObj, PoolThreshold, ThresholdOp } from "@module/attribute"
import {
	ResourceTracker,
	ResourceTrackerDef,
	ResourceTrackerDefObj,
	ResourceTrackerObj,
} from "@module/resource_tracker"
import {
	AttributeBonus,
	ConditionalModifierBonus,
	CostReduction,
	DRBonus,
	MoveBonusType,
	ReactionBonus,
	SkillBonus,
	SkillPointBonus,
	SpellBonus,
	SpellPointBonus,
	WeaponBonus,
} from "@feature"
import { MoveType, MoveTypeDef, MoveTypeDefObj, MoveTypeObj } from "@module/move_type"
import { Int } from "@util/fxp"
import { attribute, feature, progression, selfctrl, skillsel, stlimit, wsel } from "@util/enum"

export class CharacterGURPS extends BaseActorGURPS<CharacterSource> {
	attributes: Map<string, Attribute> = new Map()

	private _prevAttributes: Map<string, Attribute> = new Map()

	private _processingThresholds = false

	resource_trackers: Map<string, ResourceTracker> = new Map()

	move_types: Map<string, MoveType> = new Map()

	variableResolverExclusions: Map<string, boolean> = new Map()

	skillResolverExclusions: Map<string, boolean> = new Map()

	features: featureMap = {
		attributeBonuses: [],
		costReductions: [],
		drBonuses: [],
		skillBonuses: [],
		skillPointBonuses: [],
		spellBonuses: [],
		spellPointBonuses: [],
		weaponBonuses: [],
		moveBonuses: [],
	}

	constructor(data: CharacterSource, context: ActorConstructorContextGURPS = {}) {
		super(data, context)
		if (this.system.attributes) this.attributes = this.getAttributes()
		if (this.system.resource_trackers) this.resource_trackers = this.getResourceTrackers()
		if (this.system.move_types) this.move_types = this.getMoveTypes()
		this.features = {
			attributeBonuses: [],
			costReductions: [],
			drBonuses: [],
			skillBonuses: [],
			skillPointBonuses: [],
			spellBonuses: [],
			spellPointBonuses: [],
			weaponBonuses: [],
			moveBonuses: [],
		}
	}

	SizeModBonus = 0

	protected _onCreate(data: any, options: DocumentModificationOptions | any, userId: string): void {
		const default_settings = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.settings`)
		const default_attributes = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`)
		const default_resource_trackers = game.settings.get(
			SYSTEM_NAME,
			`${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`
		)
		const default_hit_locations = {
			name: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.name`),
			roll: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.roll`),
			locations: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`),
		}
		const default_move_types = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`)
		const populate_description = game.settings.get(
			SYSTEM_NAME,
			`${SETTINGS.DEFAULT_SHEET_SETTINGS}.populate_description`
		)
		const initial_points = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.initial_points`)
		const default_tech_level = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.tech_level`)
		const sd: DeepPartial<CharacterSystemData> = {
			id: newUUID(),
			created_date: getCurrentTime(),
			profile: {
				player_name: "",
				name: "",
				title: "",
				organization: "",
				age: "",
				birthday: "",
				eyes: "",
				hair: "",
				skin: "",
				handedness: "",
				height: "6'",
				weight: "0 lb",
				SM: 0,
				gender: "",
				tech_level: "",
				religion: "",
				portrait: "",
			},
			editing: false,
			calc: {
				swing: "",
				thrust: "",
				basic_lift: 0,
				lifting_st_bonus: 0,
				striking_st_bonus: 0,
				throwing_st_bonus: 0,
				move: [0, 0, 0, 0, 0],
				dodge: [0, 0, 0, 0, 0],
				dodge_bonus: 0,
				block_bonus: 0,
				parry_bonus: 0,
			},
		}
		sd.total_points = initial_points
		sd.points_record = [
			{
				when: sd.created_date!,
				points: initial_points,
				reason: LocalizeGURPS.translations.gurps.character.points_record.initial_points,
			},
		]
		sd.settings = default_settings
		sd.settings.attributes = default_attributes
		sd.settings.body_type = default_hit_locations
		sd.settings.resource_trackers = default_resource_trackers
		sd.settings.move_types = default_move_types
		sd.modified_date = sd.created_date
		if (populate_description) sd.profile = SETTINGS_TEMP.general.auto_fill
		sd.profile!.tech_level = default_tech_level
		sd.attributes = this.newAttributes(sd.settings.attributes as AttributeDefObj[])
		sd.resource_trackers = this.newTrackers(sd.settings.resource_trackers as ResourceTrackerDefObj[])
		sd.move_types = this.newMoveTypes(sd.settings.move_types as MoveTypeDefObj[])
		const flags = CharacterFlagDefaults
		this.update({ _id: this._id, system: sd, flags: flags })
		super._onCreate(data, options, userId)
		if (options.promptImport) {
			this.promptImport()
		}
	}

	override update(
		data?: DeepPartial<ActorDataConstructorData | (ActorDataConstructorData & Record<string, unknown>)>,
		context?: DocumentModificationContext & foundry.utils.MergeObjectOptions & { noPrepare?: boolean }
	): Promise<this | undefined> {
		if (context?.noPrepare) this.noPrepare = true
		this.updateAttributes(data)
		this.checkImport(data)
		return super.update(data, context)
	}

	checkImport(data?: any) {
		for (const i in data) {
			if (i.includes("system.import")) return
			if (i.includes("ownership")) return
		}
		data["system.modified_date"] = new Date().toISOString()
	}

	updateAttributes(data?: any) {
		for (const i in data) {
			if (i.includes("system.import")) return
		}
		if (this.system.attributes.length === 0) data["system.attributes"] = this.newAttributes()
		for (const i in data) {
			if (i === "system.settings.attributes") {
				data["system.attributes"] = this.newAttributes(
					data["system.settings.attributes"],
					this.system.attributes
				)
			}
			if (i === "system.settings.resource_trackers") {
				data["system.resource_trackers"] = this.newTrackers(
					data["system.settings.resource_trackers"],
					this.system.resource_trackers
				)
			}
			if (i === "system.settings.move_types") {
				data["system.move_types"] = this.newMoveTypes(
					data["system.settings.move_types"],
					this.system.move_types
				)
			}
			if (i.startsWith("system.attributes.")) {
				const att = this.attributes.get(i.split("attributes.")[1].split(".")[0])
				const type = i.split("attributes.")[1].split(".")[1]
				if (att) {
					if (type === "adj") data[i] -= att.max - att.adj
					else if (type === "damage") data[i] = Math.max(att.max - data[i], 0)
				}
			}
		}
	}

	// Getters
	get isDefeated(): boolean {
		return this.hasCondition(ConditionID.Dead)
	}

	get weightUnits(): WeightUnits {
		return this.settings.default_weight_units
	}

	get lengthUnits(): LengthUnits {
		return this.settings.default_length_units
	}

	get editing() {
		return this.system.editing
	}

	get profile(): this["system"]["profile"] {
		return this.system.profile
	}

	get importData(): this["system"]["import"] {
		return this.system.import
	}

	get calc() {
		return this.system.calc
	}

	set calc(v: any) {
		this.system.calc = v
	}

	embeddedEval(s: string): string {
		const ev = new Evaluator({ resolver: this })
		const exp = s.slice(2, s.length - 2)
		const result = ev.evaluate(exp)
		return `${result}`
	}

	// Points
	get totalPoints(): number {
		return this.system.total_points
	}

	set totalPoints(v: number) {
		this.system.total_points = v
	}

	get spentPoints(): number {
		let total = this.attributePoints
		const { advantages, disadvantages, ancestry, quirks } = this.traitPoints
		total += advantages + disadvantages + ancestry + quirks
		total += this.skillPoints
		total += this.spellPoints
		return total
	}

	get unspentPoints(): number {
		return this.totalPoints - this.spentPoints
	}

	set unspentPoints(v: number) {
		if (v !== this.unspentPoints) this.totalPoints = v + this.spentPoints
	}

	primaryAttributes(includeSeparators = false): Map<string, Attribute> {
		const atts = new Map([...this.attributes].filter(([_k, v]) => v.attribute_def.isPrimary))
		if (includeSeparators) return atts
		return new Map([...atts].filter(([_k, v]) => v.attribute_def.type !== attribute.Type.PrimarySeparator))
	}

	secondaryAttributes(includeSeparators = false): Map<string, Attribute> {
		const atts = new Map(
			[...this.attributes].filter(
				([_k, v]) => !v.attribute_def.isPrimary && !v.attribute_def.type.includes("pool")
			)
		)
		if (includeSeparators) return atts
		return new Map([...atts].filter(([_k, v]) => v.attribute_def.type !== attribute.Type.SecondarySeparator))
	}

	poolAttributes(includeSeparators = false): Map<string, Attribute> {
		const atts = new Map([...this.attributes].filter(([_k, v]) => v.attribute_def.type === attribute.Type.Pool))
		if (includeSeparators) return atts
		return new Map([...atts].filter(([_k, v]) => v.attribute_def.type !== attribute.Type.PoolSeparator))
	}

	get attributePoints(): number {
		let total = 0
		this.attributes.forEach(a => {
			if (!isNaN(a.points)) total += a.points
		})
		return total
	}

	get traitPoints(): { advantages: number; disadvantages: number; ancestry: number; quirks: number } {
		let [advantages, disadvantages, ancestry, quirks] = [0, 0, 0, 0]
		for (const t of this.traits) {
			if (t.container !== t.actor) continue
			let [a, d, r, q] = t.calculatePoints()
			advantages += a
			disadvantages += d
			ancestry += r
			quirks += q
		}
		return { advantages, disadvantages, ancestry, quirks }
	}

	get skillPoints(): number {
		let total = 0
		for (const s of this.skills.filter(e => e instanceof SkillGURPS || e instanceof TechniqueGURPS) as Array<
			SkillGURPS | TechniqueGURPS
		>) {
			total += s.points ?? 0
		}
		return total
	}

	get spellPoints(): number {
		let total = 0
		for (const s of this.spells.filter(e => e instanceof SpellGURPS || e instanceof RitualMagicSpellGURPS) as Array<
			SpellGURPS | RitualMagicSpellGURPS
		>) {
			total += s.points ?? 0
		}
		return total
	}

	get currentMove() {
		return this.move(this.encumbranceLevel(true))
	}

	get effectiveMove() {
		return this.eMove(this.encumbranceLevel(true))
	}

	get effectiveSprint() {
		return Math.max(this.currentMove * 1.2, this.currentMove + 1)
	}

	get currentDodge() {
		return this.dodge(this.encumbranceLevel(true))
	}

	get effectiveDodge() {
		return this.eDodge(this.encumbranceLevel(true))
	}

	get dodgeAttribute() {
		return {
			id: gid.Dodge,
			attribute_def: {
				combinedName: LocalizeGURPS.translations.gurps.attributes.dodge,
			},
			effective: this.effectiveDodge,
			current: this.currentDodge,
		}
	}

	get sizeModAttribute() {
		return {
			attribute_def: {
				combinedName: LocalizeGURPS.translations.gurps.character.sm,
			},
			effective: this.sizeMod,
		}
	}

	effectiveST(initialST: number): number {
		const divisor = 2 * Math.min(this.countThresholdOpMet(ThresholdOp.HalveST), 2)
		let ST = initialST
		if (divisor > 0) ST = Math.ceil(initialST / divisor)
		if (ST < 1 && initialST > 0) return 1
		return ST
	}

	move(enc: Encumbrance): number {
		let initialMove = Math.max(0, this.resolveAttributeCurrent(gid.BasicMove))
		const move = Math.trunc((initialMove * (10 + 2 * enc.penalty)) / 10)
		if (move < 1) {
			if (initialMove > 0) return 1
			return 0
		}
		return move
	}

	// Move accounting for pool thresholds
	eMove(enc: Encumbrance): number {
		// Let initialMove = this.moveByType(Math.max(0, this.resolveAttributeCurrent(gid.BasicMove)))
		let initialMove = this.resolveMove(this.moveType)
		let divisor = 2 * Math.min(this.countThresholdOpMet(ThresholdOp.HalveMove), 2)
		if (divisor === 0) divisor = 1
		if (divisor > 0) initialMove = Math.ceil(initialMove / divisor)
		const move = Math.trunc((initialMove * (10 + 2 * enc.penalty)) / 10)
		if (move < 1) {
			if (initialMove > 0) return 1
			return 0
		}
		return move
	}

	resolveMove(type: string): number {
		const move = this.move_types?.get(type)?.base
		if (move) return move
		return 0
		// return -Infinity
	}

	get moveType(): string {
		return this.getFlag(SYSTEM_NAME, ActorFlags.MoveType) as string
	}

	dodge(enc: Encumbrance): number {
		let dodge = 3 + (this.calc?.dodge_bonus ?? 0) + Math.max(this.resolveAttributeCurrent(gid.BasicSpeed), 0)
		return Math.floor(Math.max(dodge + enc.penalty, 1))
	}

	// Dodge accounting for pool thresholds
	eDodge(enc: Encumbrance): number {
		let dodge = 3 + (this.calc?.dodge_bonus ?? 0) + Math.max(this.resolveAttributeCurrent(gid.BasicSpeed), 0)
		const divisor = 2 * Math.min(this.countThresholdOpMet(ThresholdOp.HalveDodge), 2)
		if (divisor > 0) {
			dodge = Math.ceil(dodge / divisor)
		}
		return Math.floor(Math.max(dodge + enc.penalty, 1))
	}

	countThresholdOpMet(op: ThresholdOp) {
		let total = 0
		this.poolAttributes().forEach((a: Attribute) => {
			if (!a.apply_ops) return
			const threshold = a.currentThreshold
			if (threshold && threshold.ops?.includes(op)) total++
		})
		return total
	}

	get settings(): SheetSettings {
		return {
			...this.system.settings,
			resource_trackers: this.system.settings.resource_trackers.map(e => new ResourceTrackerDef(e)),
			attributes: this.system.settings.attributes.map(e => new AttributeDef(e)),
			move_types: this.system.settings.move_types.map(e => new MoveTypeDef(e)),
		}
	}

	get adjustedSizeModifier(): number {
		return (this.profile?.SM ?? 0) + this.size_modifier_bonus
	}

	get created_date(): string {
		return this.system.created_date
	}

	get modified_date(): string {
		return this.system.created_date
	}

	get lifts(): Record<string, string> {
		const bl = this.basicLift
		const units = this.weightUnits
		return {
			basic_lift: Weight.format(bl, units),
			one_handed_lift: Weight.format(this.oneHandedLift(bl), units),
			two_handed_lift: Weight.format(this.twoHandedLift(bl), units),
			shove: Weight.format(this.shove(bl), units),
			running_shove: Weight.format(this.runningShove(bl), units),
			carry_on_back: Weight.format(this.carryOnBack(bl), units),
			shift_slightly: Weight.format(this.shiftSlightly(bl), units),
		}
	}

	// Returns Basic Lift in pounds
	get basicLift(): number {
		const ST = this.attributes.get(gid.Strength)?._effective(this.calc?.lifting_st_bonus ?? 0) || 0
		let basicLift = ST ** 2 / 5
		if (this.settings.damage_progression === progression.Option.KnowingYourOwnStrength)
			basicLift = fxp.Int.from(2 * 10 ** (ST / 10), 1)
		if (basicLift === Infinity || basicLift === -Infinity) return 0
		if (basicLift >= 10) return Math.round(basicLift)
		return basicLift
	}

	oneHandedLift(bl: number): number {
		return fxp.Int.from(bl * 2, 4)
	}

	twoHandedLift(bl: number): number {
		return fxp.Int.from(bl * 8, 4)
	}

	shove(bl: number): number {
		return fxp.Int.from(bl * 12, 4)
	}

	runningShove(bl: number): number {
		return fxp.Int.from(bl * 24, 4)
	}

	carryOnBack(bl: number): number {
		return fxp.Int.from(bl * 15, 4)
	}

	shiftSlightly(bl: number): number {
		return fxp.Int.from(bl * 50, 4)
	}

	get fastWealthCarried(): string {
		return `$${this.wealthCarried()}`
	}

	get fastWeightCarried(): string {
		return Weight.format(this.weightCarried(false), this.weightUnits)
	}

	encumbranceLevel(forSkills = true, carried = this.weightCarried(forSkills)): Encumbrance {
		const autoEncumbrance = this.getFlag(SYSTEM_NAME, ActorFlags.AutoEncumbrance) as {
			active: boolean
			manual: number
		}
		const allEncumbrance = this.allEncumbrance
		if (autoEncumbrance && !autoEncumbrance.active) return allEncumbrance[autoEncumbrance?.manual || 0]
		// Const carried = this.weightCarried(forSkills)
		for (const e of allEncumbrance) {
			if (carried <= e.maximum_carry) return e
		}
		return allEncumbrance[allEncumbrance.length - 1]
	}

	weightCarried(forSkills: boolean): number {
		let total = 0
		this.carriedEquipment.forEach(e => {
			if (e.container === this) {
				total += e.extendedWeight(forSkills, this.settings.default_weight_units)
			}
		})
		return fxp.Int.from(total, 4)
	}

	wealthCarried(): number {
		let value = 0
		for (const e of this.carriedEquipment) {
			if (e.container === this) value += e.extendedValue
		}
		return fxp.Int.from(value, 4)
	}

	get fastWealthNotCarried(): string {
		return `$${this.wealthNotCarried()}`
	}

	wealthNotCarried(): number {
		let value = 0
		this.other_equipment.forEach(e => {
			if (e.container === this) value += e.extendedValue
		})
		return fxp.Int.from(value, 4)
	}

	get strengthOrZero(): number {
		return Math.max(this.resolveAttributeCurrent(gid.Strength), 0)
	}

	get strikingST(): number {
		return this.strengthOrZero + this.striking_st_bonus
	}

	get liftingST(): number {
		return this.strengthOrZero + this.lifting_st_bonus
	}

	get throwingST(): number {
		return this.strengthOrZero + this.throwing_st_bonus
	}

	get thrust(): DiceGURPS {
		return this.thrustFor(this.strikingST)
	}

	thrustFor(st: number): DiceGURPS {
		return damageProgression.thrustFor(this.settings.damage_progression, st)
	}

	get swing(): DiceGURPS {
		return this.swingFor(this.strikingST)
	}

	swingFor(st: number): DiceGURPS {
		return damageProgression.swingFor(this.settings.damage_progression, st)
	}

	get allEncumbrance(): Encumbrance[] {
		const bl = this.basicLift
		const ae: Encumbrance[] = [
			{
				level: 0,
				maximum_carry: fxp.Int.from(bl, 4),
				penalty: 0,
				name: LocalizeGURPS.translations.gurps.character.encumbrance[0],
			},
			{
				level: 1,
				maximum_carry: fxp.Int.from(bl * 2, 4),
				penalty: -1,
				name: LocalizeGURPS.translations.gurps.character.encumbrance[1],
			},
			{
				level: 2,
				maximum_carry: fxp.Int.from(bl * 3, 4),
				penalty: -2,
				name: LocalizeGURPS.translations.gurps.character.encumbrance[2],
			},
			{
				level: 3,
				maximum_carry: fxp.Int.from(bl * 6, 4),
				penalty: -3,
				name: LocalizeGURPS.translations.gurps.character.encumbrance[3],
			},
			{
				level: 4,
				maximum_carry: fxp.Int.from(bl * 10, 4),
				penalty: -4,
				name: LocalizeGURPS.translations.gurps.character.encumbrance[4],
			},
		]
		return ae
	}

	// Bonuses
	get size_modifier_bonus(): number {
		return this.attributeBonusFor(attrPrefix + gid.SizeModifier, stlimit.Option.None)
	}

	get striking_st_bonus(): number {
		return this.system.calc?.striking_st_bonus ?? 0
	}

	set striking_st_bonus(v: number) {
		this.system.calc.striking_st_bonus = v
	}

	get lifting_st_bonus(): number {
		return this.calc?.lifting_st_bonus ?? 0
	}

	set lifting_st_bonus(v: number) {
		this.system.calc.lifting_st_bonus = v
	}

	get throwing_st_bonus(): number {
		return this.system?.calc?.throwing_st_bonus ?? 0
	}

	set throwing_st_bonus(v: number) {
		this.system.calc.throwing_st_bonus = v
	}

	get parryBonus(): number {
		return this.calc?.parry_bonus ?? 0
	}

	get blockBonus(): number {
		return this.calc?.block_bonus ?? 0
	}

	get dodgeBonus(): number {
		return this.calc?.dodge_bonus ?? 0
	}

	override get sizeMod(): number {
		if (!this.system?.profile) return 0
		return this.system.profile.SM + this.SizeModBonus
	}

	get hitLocationTable(): HitLocationTable {
		return this.BodyType
	}

	// Flat list of all hit locations
	get HitLocations(): HitLocation[] {
		const recurseLocations = function(table: HitLocationTable, locations: HitLocation[] = []): HitLocation[] {
			table.locations.forEach(e => {
				locations.push(e)
				if (e.subTable) locations = recurseLocations(e.subTable, locations)
			})
			return locations
		}

		return recurseLocations(this.BodyType, [])
	}

	// Item Types
	get traits(): Collection<TraitGURPS | TraitContainerGURPS> {
		// const traits: Collection<TraitGURPS | TraitContainerGURPS> = new Collection()
		// for (const item of this.items) {
		// 	if (item instanceof TraitGURPS || item instanceof TraitContainerGURPS) traits.set(item._id, item)
		// }
		// return traits
		return new Collection(
			[...this.itemTypes[ItemType.Trait], ...this.itemTypes[ItemType.TraitContainer]].map(e => [
				e.id,
				e,
			]) as readonly [string, Item][]
		) as Collection<TraitGURPS | TraitContainerGURPS>
	}

	get skills(): Collection<SkillGURPS | TechniqueGURPS | SkillContainerGURPS> {
		return new Collection(
			[
				...this.itemTypes[ItemType.Skill],
				...this.itemTypes[ItemType.Technique],
				...this.itemTypes[ItemType.SkillContainer],
			].map(e => [e.id, e]) as readonly [string, Item][]
		) as Collection<SkillGURPS | TechniqueGURPS | SkillContainerGURPS>
	}

	get spells(): Collection<SpellGURPS | RitualMagicSpellGURPS | SpellContainerGURPS> {
		return new Collection(
			[
				...this.itemTypes[ItemType.Spell],
				...this.itemTypes[ItemType.RitualMagicSpell],
				...this.itemTypes[ItemType.SpellContainer],
			].map(e => [e.id, e]) as readonly [string, Item][]
		) as Collection<SpellGURPS | RitualMagicSpellGURPS | SpellContainerGURPS>
	}

	get equipment(): Collection<EquipmentGURPS | EquipmentContainerGURPS> {
		return new Collection(
			[...this.itemTypes[ItemType.Equipment], ...this.itemTypes[ItemType.EquipmentContainer]].map(e => [
				e.id,
				e,
			]) as readonly [string, Item][]
		) as Collection<EquipmentGURPS | EquipmentContainerGURPS>
	}

	get carriedEquipment(): Collection<EquipmentGURPS | EquipmentContainerGURPS> {
		return new Collection(
			this.equipment
				.filter(item => !item.other)
				.map(item => {
					return [item._id, item]
				})
		)
	}

	get other_equipment(): Collection<EquipmentGURPS | EquipmentContainerGURPS> {
		return new Collection(
			this.equipment
				.filter(item => item.other)
				.map(item => {
					return [item._id, item]
				})
		)
	}

	get notes(): Collection<NoteGURPS | NoteContainerGURPS> {
		const notes: Collection<NoteGURPS | NoteContainerGURPS> = new Collection()
		for (const item of this.items) {
			if (item instanceof NoteGURPS || item instanceof NoteContainerGURPS) notes.set(item._id, item)
		}
		return notes
	}

	// Weapons
	get meleeWeapons(): Collection<MeleeWeaponGURPS> {
		const meleeWeapons: Collection<MeleeWeaponGURPS> = new Collection()
		for (const item of this.items) {
			if (item instanceof MeleeWeaponGURPS) meleeWeapons.set(item._id, item)
		}
		return meleeWeapons
	}

	get rangedWeapons(): Collection<RangedWeaponGURPS> {
		const rangedWeapons: Collection<RangedWeaponGURPS> = new Collection()
		for (const item of this.items) {
			if (item instanceof RangedWeaponGURPS) rangedWeapons.set(item._id, item)
		}
		return rangedWeapons
	}

	get weapons(): Collection<WeaponGURPS> {
		const weapons: Collection<WeaponGURPS> = new Collection()
		for (const item of this.items) {
			if (item instanceof MeleeWeaponGURPS) weapons.set(item._id, item)
			if (item instanceof RangedWeaponGURPS) weapons.set(item._id, item)
		}
		return weapons
	}

	equippedWeapons(type: WeaponType): MeleeWeaponGURPS[] | RangedWeaponGURPS[] {
		switch (type) {
			case ItemType.MeleeWeapon:
				return this.meleeWeapons
					.filter(e => e.equipped)
					.sort((a, b) => (a.usage > b.usage ? 1 : b.usage > a.usage ? -1 : 0))
					.sort((a, b) => (a.itemName > b.itemName ? 1 : b.itemName > a.itemName ? -1 : 0))
			case ItemType.RangedWeapon:
				return this.rangedWeapons
					.filter(e => e.equipped)
					.sort((a, b) => (a.usage > b.usage ? 1 : b.usage > a.usage ? -1 : 0))
					.sort((a, b) => (a.itemName > b.itemName ? 1 : b.itemName > a.itemName ? -1 : 0))
		}
	}

	get reactions(): ConditionalModifier[] {
		let reactionMap: Map<string, ConditionalModifier> = new Map()
		for (const t of this.traits) {
			let source = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.reaction.from_trait, {
				name: t.name ?? "",
			})
			this.reactionsFromFeatureList(source, t.features, reactionMap)
			for (const mod of t.deepModifiers) {
				if (!mod.enabled) continue
				this.reactionsFromFeatureList(source, mod.features, reactionMap)
			}
			if (t.CR !== 0 && t.CRAdj === selfctrl.Adjustment.ReactionPenalty) {
				let amount = selfctrl.Adjustment.adjustment(t.CRAdj, t.CR)
				let situation = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.reaction.cr, {
					trait: t.name ?? "",
				})
				if (reactionMap.has(situation)) reactionMap.get(situation)!.add(source, amount)
				else reactionMap.set(situation, new ConditionalModifier(source, situation, amount))
			}
		}
		for (const e of this.carriedEquipment) {
			if (e.equipped && e.system.quantity > 0) {
				let source = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.reaction.from_equipment, {
					name: e.name ?? "",
				})
				this.reactionsFromFeatureList(source, e.features, reactionMap)
				for (const mod of e.deepModifiers) {
					this.reactionsFromFeatureList(source, mod.features, reactionMap)
				}
			}
		}
		for (const sk of this.skills) {
			let source = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.reaction.from_skill, {
				name: sk.name ?? "",
			})
			if (sk instanceof TechniqueGURPS)
				source = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.reaction.from_technique, {
					name: sk.name ?? "",
				})
			this.reactionsFromFeatureList(source, sk.features, reactionMap)
		}
		let reactionList = Array.from(reactionMap.values()).sort((a, b) => (a.from < b.from) ? -1 : (a.from > b.from) ? 1 : 0)
		return reactionList
	}

	reactionsFromFeatureList(source: string, features: Feature[], m: Map<string, ConditionalModifier>): void {
		for (const f of features) {
			if (f instanceof ReactionBonus) {
				const amt = f.adjustedAmount
				if (m.has(f.situation)) m.get(f.situation)!.add(source, amt)
				else m.set(f.situation, new ConditionalModifier(source, f.situation, amt))
			}
		}
	}

	get conditionalModifiers(): ConditionalModifier[] {
		let reactionMap: Map<string, ConditionalModifier> = new Map()
		this.traits.forEach(t => {
			let source = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.reaction.from_trait, {
				name: t.name ?? "",
			})
			this.conditionalModifiersFromFeatureList(source, t.features, reactionMap)
			for (const mod of t.deepModifiers) {
				this.conditionalModifiersFromFeatureList(source, mod.features, reactionMap)
			}
		})
		for (const e of this.carriedEquipment) {
			if (e.equipped && e.system.quantity > 0) {
				let source = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.reaction.from_equipment, {
					name: e.name ?? "",
				})
				this.conditionalModifiersFromFeatureList(source, e.features, reactionMap)
				for (const mod of e.deepModifiers) {
					this.conditionalModifiersFromFeatureList(source, mod.features, reactionMap)
				}
			}
		}
		for (const sk of this.skills) {
			let source = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.reaction.from_skill, {
				name: sk.name ?? "",
			})
			if (sk instanceof TechniqueGURPS)
				source = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.reaction.from_technique, {
					name: sk.name ?? "",
				})
			this.conditionalModifiersFromFeatureList(source, sk.features, reactionMap)
		}
		let reactionList = Array.from(reactionMap.values())
		return reactionList
	}

	conditionalModifiersFromFeatureList(
		source: string,
		features: Feature[],
		m: Map<string, ConditionalModifier>
	): void {
		for (const f of features) {
			if (f instanceof ConditionalModifierBonus) {
				const amt = f.adjustedAmount
				if (m.has(f.situation)) m.get(f.situation)!.add(source, amt)
				else m.set(f.situation, new ConditionalModifier(source, f.situation, amt))
			}
		}
	}

	get maxHP(): number {
		return this.resolveAttributeMax(gid.HitPoints)
	}

	newAttributes(defs = this.system.settings.attributes, prev: AttributeObj[] = []): AttributeObj[] {
		const atts: AttributeObj[] = []
		if (!defs) return atts
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
		if (prev.length !== 0) {
			atts.forEach(attr => {
				const prev_attr = prev.find(e => e.attr_id === attr.attr_id)
				Object.assign(attr, prev_attr)
			})
		} else {
			this._prevAttributes = new Map()
		}
		return atts
	}

	newTrackers(defs = this.system.settings.resource_trackers, prev: ResourceTrackerObj[] = []): ResourceTrackerObj[] {
		const t: ResourceTrackerObj[] = []
		if (!defs) return t
		let i = 0
		for (const tracker_def of defs) {
			const tracker = new ResourceTracker(this, tracker_def.id, i)
			t.push({
				// order: tracker.order,
				tracker_id: tracker.tracker_id,
				damage: tracker.damage,
			})
			i++
		}
		if (prev.length !== 0) {
			t.forEach(tracker => {
				const prev_tracker = prev.find(e => e.tracker_id === tracker.tracker_id)
				Object.assign(tracker, prev_tracker)
			})
		}
		return t
	}

	newMoveTypes(defs = this.system.settings.move_types, prev: MoveTypeObj[] = []): MoveTypeObj[] {
		const m: MoveTypeObj[] = []
		let i = 0
		for (const def of defs) {
			const move_type = new MoveType(this, def.id, i)
			m.push({
				move_type_id: move_type.id,
				adj: move_type.adj,
			})
			i++
		}
		if (prev.length !== 0) {
			m.forEach(type => {
				const prev_move = prev.find(e => e.move_type_id === type.move_type_id)
				Object.assign(type, prev_move)
			})
		}
		return m
	}

	get BodyType(): HitLocationTable {
		let b = this.system.settings.body_type
		if (!b) return new HitLocationTable("", new DiceGURPS(), [], this, "")
		return new HitLocationTable(b.name, b.roll, b.locations, this, "")
	}

	getAttributes(att_array = this.system.attributes): Map<string, Attribute> {
		const attributes: Map<string, Attribute> = new Map()
		if (!att_array.length) return attributes
		att_array.forEach((v, k) => {
			attributes.set(v.attr_id, new Attribute(this, v.attr_id, k, v))
		})
		return attributes
	}

	getResourceTrackers(): Map<string, ResourceTracker> {
		const trackers: Map<string, ResourceTracker> = new Map()
		const tracker_array = this.system.resource_trackers
		if (!tracker_array?.length) return trackers
		tracker_array.forEach((v, k) => {
			trackers.set(v.tracker_id, new ResourceTracker(this, v.tracker_id, k, v))
		})
		return trackers
	}

	getMoveTypes(mt_array = this.system.move_types): Map<string, MoveType> {
		const move_types: Map<string, MoveType> = new Map()
		if (!mt_array?.length) return move_types
		mt_array.forEach((v, k) => {
			move_types.set(v.move_type_id, new MoveType(this, v.move_type_id, k, v))
		})
		return move_types
	}

	protected override _onCreateDescendantDocuments(
		embeddedName: string,
		documents: Document<any, any, Metadata<any>>[],
		result: Record<string, unknown>[],
		options: DocumentModificationOptionsGURPS,
		userId: string
	): void {
		super._onCreateDescendantDocuments(embeddedName, documents, result, options, userId)

		// Replace @X@ notation fields with given text
		if (embeddedName === "Item" && options.substitutions) {
			for (const item of documents.filter(e => e instanceof ItemGCS)) {
				const sheet = ModifierChoiceSheet.new([item as ItemGCS])
				if (game.userId === userId) sheet?.render(true)
			}
		}
		if (this.system.profile.tech_level !== "" && embeddedName === "Item") {
			for (const item of documents.filter(
				e => e instanceof SkillGURPS || e instanceof SpellGURPS || e instanceof RitualMagicSpellGURPS
			)) {
				if ((item as SkillGURPS).system.tech_level_required && !(item as SkillGURPS).system.tech_level)
					(item as SkillGURPS).system.tech_level = this.system.profile.tech_level
			}
		}
	}

	// Prepare data
	override prepareData(): void {
		super.prepareData()
		const pools: any = {}
		this.attributes?.forEach(e => {
			if (e.attribute_def.type === attribute.Type.Pool) {
				pools[e.id] = { value: e.current, min: -Infinity, max: e.max }
			}
		})
		this.resource_trackers?.forEach(e => {
			pools[e.id] = { value: e.current, min: e.min, max: e.max }
		})
		this.system.pools = pools
	}

	override prepareBaseData(): void {
		super.prepareBaseData()
		this.system.settings.attributes.forEach(e => (e.cost_adj_percent_per_sm ??= 0))
		if (this.system.attributes.length === 0) {
			this.system.attributes = this.newAttributes()
			this.attributes = this.getAttributes()
		}
		if (this.system.settings.resource_trackers.length === 0) {
			this.system.resource_trackers = this.newTrackers()
			this.resource_trackers = this.getResourceTrackers()
		}
		if (this.system.settings.move_types.length === 0) {
			this.system.move_types = this.newMoveTypes()
			this.move_types = this.getMoveTypes()
		}
	}

	override prepareEmbeddedDocuments(): void {
		super.prepareEmbeddedDocuments()
		if (this.noPrepare) {
			this.noPrepare = false
			return
		}
		this.updateSkills()
		this.updateSpells()
		for (let i = 0; i < 5; i++) {
			this.processFeatures()
			this.processPrereqs()
			let skillsChanged = this.updateSkills()
			let spellsChanged = this.updateSpells()
			if (!skillsChanged && !spellsChanged) break
		}
	}

	processFeatures() {
		this.features = {
			attributeBonuses: [],
			costReductions: [],
			drBonuses: [],
			skillBonuses: [],
			skillPointBonuses: [],
			spellBonuses: [],
			spellPointBonuses: [],
			weaponBonuses: [],
			moveBonuses: [],
		}
		for (const t of this.traits) {
			let levels = 0
			if (!t.enabled) continue
			if (t.isLeveled) levels = Math.max(t.levels, 0)
			if (t instanceof TraitGURPS) {
				if (t.features)
					for (const f of t.features) {
						this.processFeature(t, undefined, f, levels)
					}
			}
			if (CR_Features.has(t.CRAdj))
				for (const f of CR_Features?.get(t.CRAdj) || []) {
					this.processFeature(t, undefined, f, levels)
				}
			for (const m of t.deepModifiers) {
				if (m.enabled === false) continue
				for (const f of m.features) {
					this.processFeature(t, undefined, f, m.levels)
				}
			}
		}
		for (const s of this.skills) {
			if (!(s instanceof SkillContainerGURPS))
				for (const f of s.features) {
					this.processFeature(s, undefined, f, 0)
				}
		}
		for (const e of this.equipment) {
			if (!e.enabled) continue
			for (const f of e.features) {
				this.processFeature(e, undefined, f, 0)
			}
			for (const m of e.deepModifiers) {
				if (m.enabled === false) continue
				for (const f of m.features) {
					this.processFeature(e, undefined, f, 0)
				}
			}
		}
		for (const e of this.gEffects) {
			for (const f of e.features) {
				this.processFeature(e, undefined, f, 0)
			}
		}

		this.calc ??= {}
		this.lifting_st_bonus = this.attributeBonusFor(gid.Strength, stlimit.Option.LiftingOnly)
		this.striking_st_bonus = this.attributeBonusFor(gid.Strength, stlimit.Option.StrikingOnly)
		this.throwing_st_bonus = this.attributeBonusFor(gid.Strength, stlimit.Option.ThrowingOnly)

		this.attributes = this.getAttributes()
		this.processThresholds()

		this.resource_trackers = this.getResourceTrackers()
		this.move_types = this.getMoveTypes()

		this.calc.dodge_bonus = this.attributeBonusFor(gid.Dodge, stlimit.Option.None)
		this.calc.parry_bonus = this.attributeBonusFor(gid.Parry, stlimit.Option.None)
		this.calc.block_bonus = this.attributeBonusFor(gid.Block, stlimit.Option.None)
	}

	processThresholds() {
		if (!this.isOwner) return
		if (this._processingThresholds || !this._prevAttributes || this.attributes === this._prevAttributes) return

		this._processingThresholds = true

		const effects = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`)

		this.poolAttributes(false).forEach(e => {
			if (!this._prevAttributes.has(e.id)) return

			const prevState = this._prevAttributes.get(e.id)?.currentThreshold?.state
			const currentState = e.currentThreshold?.state

			if (prevState === currentState) return

			const enterActions = effects
				.filter((f: { attribute: string; state: string }) => f.attribute === e.id && f.state === currentState)
				.reduce((acc: any[], e: any) => {
					return [...acc, ...e.enter]
				}, [])
			const leaveActions = effects
				.filter((f: { attribute: string; state: string }) => f.attribute === e.id && f.state === prevState)
				.reduce((acc: any[], e: any) => {
					return [...acc, ...e.leave]
				}, [])

			let actions = [...enterActions, ...leaveActions]
			actions = actions.filter(a => {
				if (
					a.action === EFFECT_ACTION.REMOVE &&
					actions.some(x => x.id === a.id && x.action === EFFECT_ACTION.ADD)
				)
					return false
				return true
			})

			actions = actions.filter((item, index) => actions.indexOf(item) === index)

			const addActions = actions.filter(item => item.action === EFFECT_ACTION.ADD && !this.hasCondition(item.id))
			const removeActions = actions.filter(
				item => item.action === EFFECT_ACTION.REMOVE && this.hasCondition(item.id)
			)

			if (addActions.length) this.addConditions(addActions.map(e => e.id))
			if (removeActions.length) this.removeConditions(removeActions.map(e => e.id))
		})

		this._prevAttributes = this.attributes
		this._prevAttributes = new Map()
		this.attributes.forEach((e, k) => {
			if (e.attribute_def.type === attribute.Type.Pool) {
				e._overridenThreshold = new PoolThreshold({ ...e.currentThreshold } as any)
			}
			this._prevAttributes.set(k, e)
		})
		this._processingThresholds = false
	}

	processFeature(owner: Stringer, subOwner: Stringer | undefined, f: Feature, levels: number) {
		f.owner = owner
		f.subOwner = subOwner
		f.setLevel(levels)

		if (f instanceof AttributeBonus) return this.features.attributeBonuses.push(f)
		else if (f instanceof CostReduction) return this.features.costReductions.push(f)
		else if (f instanceof DRBonus) {
			if (f.location === "") {
				if (owner instanceof EquipmentGURPS || owner instanceof EquipmentContainerGURPS) {
					const allLocations: Map<string, boolean> = new Map()
					const locationsMatched: Map<string, boolean> = new Map()
					for (const f2 of owner.features) {
						if (f2 instanceof DRBonus && f2.location !== "") {
							allLocations.set(f2.location, true)
							if (f2.specialization === f.specialization) {
								locationsMatched.set(f2.location, true)
								const additionalDRBonus = new DRBonus()
								additionalDRBonus.location = f2.location
								additionalDRBonus.specialization = f.specialization
								additionalDRBonus.leveledAmount = f.leveledAmount
								additionalDRBonus.owner = owner
								additionalDRBonus.subOwner = subOwner
								additionalDRBonus.setLevel(levels)
								this.features.drBonuses.push(additionalDRBonus)
							}
						}
					}
				}
			} else this.features.drBonuses.push(f)
		} else if (f instanceof SkillBonus) return this.features.skillBonuses.push(f)
		else if (f instanceof SkillPointBonus) return this.features.skillPointBonuses.push(f)
		else if (f instanceof SpellBonus) return this.features.spellBonuses.push(f)
		else if (f instanceof SpellPointBonus) return this.features.spellPointBonuses.push(f)
		else if (f instanceof WeaponBonus) return this.features.weaponBonuses.push(f)
	}

	processPrereqs(): void {
		const not_met = LocalizeGURPS.translations.gurps.prereq.not_met
		for (const t of this.traits.filter(e => e instanceof TraitGURPS)) {
			t.unsatisfied_reason = ""
			if (t instanceof TraitGURPS && !t.prereqsEmpty) {
				const tooltip = new TooltipGURPS()
				if (!t.prereqs.satisfied(this, t, tooltip)) {
					t.unsatisfied_reason = not_met + tooltip.toString()
				}
			}
		}
		for (let k of this.skills.filter(e => !(e instanceof SkillContainerGURPS))) {
			k = k as SkillGURPS | TechniqueGURPS
			k.unsatisfied_reason = ""
			const tooltip = new TooltipGURPS()
			let satisfied = true
			let eqpPenalty = { value: false }
			if (!k.prereqsEmpty) satisfied = k.prereqs.satisfied(this, k, tooltip, eqpPenalty)
			if (satisfied && k instanceof TechniqueGURPS) satisfied = k.satisfied(tooltip)
			if (eqpPenalty) {
				const penalty = new SkillBonus()
				penalty.selection_type = skillsel.Type.Name
				penalty.name = <StringCriteria>{
					compare: StringCompareType.IsString,
					qualifier: k.name!,
				}
				penalty.specialization = <StringCriteria>{
					compare: StringCompareType.IsString,
					qualifier: k.specialization,
				}
				penalty.amount = k.techLevel && k.techLevel !== "" ? -10 : -5
				this.features.skillBonuses.push(penalty)
			}
			if (!satisfied) {
				k.unsatisfied_reason = not_met + tooltip.toString()
			}
		}
		for (let b of this.spells.filter(e => !(e instanceof SpellContainerGURPS))) {
			b = b as SpellGURPS | RitualMagicSpellGURPS
			b.unsatisfied_reason = ""
			const tooltip = new TooltipGURPS()
			let satisfied = true
			let eqpPenalty = { value: false }
			if (!b.prereqsEmpty) satisfied = b.prereqs.satisfied(this, b, tooltip, eqpPenalty)
			if (satisfied && b instanceof RitualMagicSpellGURPS) satisfied = b.satisfied(tooltip)
			if (eqpPenalty) {
				const penalty = new SkillBonus()
				penalty.name!.qualifier = b.name!
				if (b.techLevel && b.techLevel !== "") {
					penalty.amount = -10
				} else {
					penalty.amount = -5
				}
				this.features.skillBonuses.push(penalty)
			}
			if (!satisfied) b.unsatisfied_reason = not_met + tooltip.toString()
		}
		for (const e of this.equipment) {
			e.unsatisfied_reason = ""
			if (!e.prereqsEmpty) {
				const tooltip = new TooltipGURPS()
				if (!e.prereqs.satisfied(this, e, tooltip)) {
					e.unsatisfied_reason = not_met + tooltip.toString()
				}
			}
		}
	}

	updateSkills(): boolean {
		let changed = false
		for (const k of [...this.itemTypes[ItemType.Skill], ...this.itemTypes[ItemType.Technique]]) {
			if ((k as SkillGURPS).updateLevel()) changed = true
		}
		return changed
	}

	updateSpells(): boolean {
		let changed = false
		for (const b of [...this.itemTypes[ItemType.Spell], ...this.itemTypes[ItemType.RitualMagicSpell]]) {
			if ((b as SpellGURPS).updateLevel()) changed = true
		}
		return changed
	}

	// Directed Skill Getters
	baseSkill(def: SkillDefault, require_points: boolean): SkillGURPS | TechniqueGURPS | null {
		if (!def) return null
		if (!def.skillBased) return null
		return this.bestSkillNamed(def.name ?? "", def.specialization ?? "", require_points, null)
	}

	bestWeaponNamed(
		name: string,
		usage: string,
		type: WeaponType,
		excludes: Map<string, boolean> | null
	): WeaponGURPS | null {
		let best: WeaponGURPS | null = null
		let level = -Infinity
		for (const w of this.weaponNamed(name, usage, type, excludes)) {
			const skill_level = w.level
			if (!best || level < skill_level) {
				best = w
				level = skill_level
			}
		}
		return best
	}

	weaponNamed(
		name: string,
		usage: string,
		type: WeaponType,
		excludes: Map<string, boolean> | null
	): Collection<WeaponGURPS> {
		const weapons: Collection<WeaponGURPS> = new Collection()
		for (const wep of this.equippedWeapons(type)) {
			if (
				(excludes === null || !excludes.get(wep.name!)) &&
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
		excludes: Map<string, boolean> | null
	): SkillGURPS | TechniqueGURPS | null {
		let best: SkillGURPS | TechniqueGURPS | null = null
		let level = -Infinity
		for (const sk of this.skillNamed(name, specialization, require_points, excludes)) {
			const skill_level = sk.calculateLevel().level
			if (!best || level < skill_level) {
				best = sk
				level = skill_level
			}
		}
		return best
	}

	skillNamed(
		name: string,
		specialization: string,
		require_points: boolean,
		excludes: Map<string, boolean> | null
	): Collection<SkillGURPS | TechniqueGURPS> {
		const skills: Collection<SkillGURPS | TechniqueGURPS> = new Collection()
		const defaultSkills = CONFIG.GURPS.skillDefaults
		for (const item of defaultSkills) {
			if (
				(excludes === null || !excludes.get(item.name!)) &&
				(item instanceof SkillGURPS || item instanceof TechniqueGURPS) &&
				item.name === name &&
				(specialization === "" || specialization === item.specialization)
			) {
				item.dummyActor = this
				item.points = 0
				skills.set(item._id, item)
			}
		}
		for (const item of this.skills) {
			if (
				(excludes === null || !excludes.get(item.name!)) &&
				(item instanceof SkillGURPS || item instanceof TechniqueGURPS) &&
				item.name === name &&
				(!require_points || item instanceof TechniqueGURPS || item.adjustedPoints() > 0) &&
				(specialization === "" || specialization === item.specialization)
			)
				skills.set(item._id, item)
		}
		return skills
	}

	// Feature Processing
	moveBonusFor(
		id: string,
		limitation: MoveBonusType,
		effective = false,
		tooltip: TooltipGURPS | null = null
	): number {
		let total = 0
		for (const feature of this.features.moveBonuses) {
			if (feature.limitation === limitation && feature.move_type === id && feature.effective === effective) {
				total += feature.adjustedAmount
				feature.addToTooltip(tooltip)
			}
		}
		return total
	}

	attributeBonusFor(
		attributeId: string,
		limitation: stlimit.Option,
		effective = false,
		tooltip: TooltipGURPS | null = null
	): number {
		let total = 0
		for (const feature of this.features.attributeBonuses) {
			if (
				feature.limitation === limitation &&
				feature.attribute === attributeId &&
				feature.effective === effective
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
		tooltip: TooltipGURPS | null = null
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
		tooltip: TooltipGURPS | null = null
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
		tooltip: TooltipGURPS | null = null
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
		allowedFeatureTypes: Map<feature.Type, boolean> = new Map()
	): Map<WeaponBonus, boolean> {
		if (m === null) m = new Map()
		let rsl = -Infinity
		for (const sk of this.skillNamed(name, specialization, true, null)) {
			if (rsl < sk.level.relative_level) rsl = sk.level.relative_level
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
		allowedFeatureTypes: Map<feature.Type, boolean> = new Map()
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
		tooltip: TooltipGURPS | null
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

	addDRBonusesFor(
		locationID: string,
		tooltip: TooltipGURPS | null = null,
		drMap: Map<string, number> = new Map()
	): Map<string, number> {
		let isTopLevel = false
		for (const location of this.BodyType.locations) {
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

	// Resolve attributes
	resolveAttributeCurrent(attr_id: string): number {
		const att = this.attributes?.get(attr_id)?.current
		if (att) return att
		return -Infinity
	}

	resolveAttributeEffective(attr_id: string): number {
		const att = this.attributes?.get(attr_id)?.effective
		if (att) return att
		return -Infinity
	}

	resolveAttributeMax(attr_id: string): number {
		const att = this.attributes?.get(attr_id)?.max
		if (att) return att
		return -Infinity
	}

	resolveAttributeName(attr_id: string): string {
		const def = this.resolveAttributeDef(attr_id)
		if (def) return def.name
		return "unknown"
	}

	resolveAttributeDef(attr_id: string): AttributeDef | null {
		const a = this.attributes?.get(attr_id)
		if (a) return a.attribute_def
		return null
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
		let attr: Attribute | ResourceTracker | undefined = this.attributes.get(parts[0])
		if (!attr) attr = this.resource_trackers.get(parts[0])
		if (!attr) {
			console.warn(`No such variable: $${variableName}`)
			return ""
		}
		let def
		if (attr instanceof Attribute) {
			def = attr.attribute_def
		} else if (attr instanceof ResourceTracker) {
			def = attr.tracker_def
		}
		if (!def) {
			console.warn(`No such variable definition: $${variableName}`)
			return ""
		}
		if ((def instanceof ResourceTrackerDef || def.type === attribute.Type.Pool) && parts.length > 1) {
			switch (parts[1]) {
				case "current":
					return attr.current.toString()
				case "maximum":
				case "max":
					return attr.max.toString()
				default:
					console.warn(`No such variable: $${variableName}`)
					return ""
			}
		}
		this.variableResolverExclusions = new Map()
		return attr?.max.toString()
	}

	async saveLocal(path = "", extension = "gcs"): Promise<void> {
		const [system, name] = await this.exportSystemData()
		let data: any
		if (path === "") {
			data = system
		} else {
			data = getProperty(system, path)
			data.version = 4
			if (path === "settings.attributes") data.type = "attribute_settings"
			else if (path === "settings.body_type") data.type = "body_type"
		}
		return saveDataToFile(JSON.stringify(data, null, "\t"), extension, `${name}.${extension}`)
	}

	protected async exportSystemData(): Promise<[any, string]> {
		const system: any = duplicate(this.system)
		system.type = "character"
		system.calc = {
			thrust: this.thrust.string,
			swing: this.swing.string,
			basic_lift: Weight.format(this.basicLift, this.settings.default_weight_units),
			dodge: [0, 1, 2, 3, 4].map(e => this.dodge(this.allEncumbrance[e])),
			move: [0, 1, 2, 3, 4].map(e => this.move(this.allEncumbrance[e])),
			parry_bonus: this.parryBonus,
			block_bous: this.blockBonus,
			dodge_bonus: this.dodgeBonus,
		}
		const items = (this.items as unknown as Collection<BaseItemGURPS>)
			.filter(e => !e.getFlag(SYSTEM_NAME, ItemFlags.Container))
			.map((e: BaseItemGURPS) => e.exportSystemData(true))
		const third_party: any = {}

		third_party.settings = { resource_trackers: system.settings.resource_trackers }
		third_party.resource_trackers = system.resource_trackers
		third_party.import = system.import
		third_party.move = system.move
		system.third_party = third_party
		system.traits = items.filter(e => [ItemType.Trait, ItemType.TraitContainer].includes(e.type)) ?? []
		system.skills =
			items.filter(e => [ItemType.Skill, ItemType.SkillContainer, ItemType.Technique].includes(e.type)) ?? []
		system.spells =
			items.filter(e => [ItemType.Spell, ItemType.SpellContainer, ItemType.RitualMagicSpell].includes(e.type)) ??
			[]
		system.equipment =
			items
				.filter(
					e => [ItemType.Equipment, "equipment", ItemType.EquipmentContainer].includes(e.type) && !e.other
				)
				.map(e => {
					delete e.other
					return e
				}) ?? []
		system.other_equipment =
			items
				.filter(e => [ItemType.Equipment, "equipment", ItemType.EquipmentContainer].includes(e.type) && e.other)
				.map(e => {
					delete e.other
					return e
				}) ?? []
		system.notes = items.filter(e => [ItemType.Note, ItemType.NoteContainer].includes(e.type)) ?? []
		system.settings.attributes = system.settings.attributes.map((e: Partial<AttributeDef>) => {
			const f = { ...e }
			f.id = e.id
			delete f.id
			delete f.order
			if (f.type !== attribute.Type.Pool) delete f.thresholds
			return f
		})
		system.attributes = system.attributes.map((e: Partial<AttributeObj>) => {
			const f = { ...e }
			return f
		})
		if (this.img && !this.img.endsWith(".svg")) system.profile.portrait = await urlToBase64(this.img)

		delete system.resource_trackers
		delete system.settings.resource_trackers
		delete system.import
		delete system.move
		delete system.pools
		delete system.editing

		// const json = JSON.stringify(system, null, "\t")
		const filename = this.name ?? LocalizeGURPS.translations.TYPES.Actor.character_gcs

		// return { text: json, name: filename }
		return [system, filename]
	}

	async promptImport() {
		let dialog = new Dialog({
			title: LocalizeGURPS.translations.gurps.character.import_prompt.title,
			content: await renderTemplate(`systems/${SYSTEM_NAME}/templates/actor/import-prompt.hbs`, { object: this }),
			buttons: {
				import: {
					icon: '<i class="fas fa-file-import"></i>',
					label: LocalizeGURPS.translations.gurps.character.import_prompt.import,
					callback: _html => {
						let file: any = null
						if (game.settings.get(SYSTEM_NAME, SETTINGS.SERVER_SIDE_FILE_DIALOG)) {
							const filepicker = new FilePicker({
								callback: (path: string) => {
									const request = new XMLHttpRequest()
									request.open("GET", path)
									new Promise(resolve => {
										request.onload = () => {
											if (request.status === 200) {
												const text = request.response
												file = {
													text: text,
													name: path,
													path: request.responseURL,
												}
												CharacterImporter.import(this, file)
											}
											resolve(this)
										}
									})
									request.send(null)
								},
							})
							filepicker.extensions = [".gcs", ".xml", ".gca5"]
							filepicker.render(true)
						} else {
							const inputEl = document.createElement("input")
							inputEl.type = "file"
							$(inputEl).on("change", event => {
								const rawFile = $(event.currentTarget).prop("files")[0]
								file = {
									text: "",
									name: rawFile.name,
									path: rawFile.path,
								}
								readTextFromFile(rawFile).then(text => {
									CharacterImporter.import(this, {
										text: text,
										name: rawFile.name,
										path: rawFile.path,
									})
								})
							})
							$(inputEl).trigger("click")
						}
					},
				},
			},
		})
		dialog.render(true)
	}

	isSkillLevelResolutionExcluded(name: string, specialization: string): boolean {
		if (this.skillResolverExclusions.has(this.skillLevelResolutionKey(name, specialization))) {
			if (specialization) name += ` (${specialization})`
			console.error(`Attempt to resolve skill level via itself: ${name}`)
			return true
		}
		return false
	}

	registerSkillLevelResolutionExclusion(name: string, specialization: string) {
		this.skillResolverExclusions ??= new Map()
		this.skillResolverExclusions.set(this.skillLevelResolutionKey(name, specialization), true)
	}

	unregisterSkillLevelResolutionExclusion(name: string, specialization: string) {
		this.skillResolverExclusions.delete(this.skillLevelResolutionKey(name, specialization))
	}

	skillLevelResolutionKey(name: string, specialization: string): string {
		return `${name}\u0000${specialization}`
	}

	getRollData(): object {
		return {
			id: this.id,
			actor: this,
			system: this.system,
		}
	}

	getTrait(name: string): TraitGURPS {
		return this.traits
			.filter(e => e instanceof TraitGURPS)
			?.filter(e => e.name === name && e.enabled)[0] as TraitGURPS
	}

	hasTrait(name: string): boolean {
		return this.traits.some(e => e instanceof TraitGURPS && e.name === name && e.enabled)
	}

	override async modifyTokenAttribute(attribute: string, value: number, isDelta = false, isBar = true) {
		if (!attribute.startsWith("pools")) return super.modifyTokenAttribute(attribute, value, isDelta, isBar)

		const current = getProperty(this.system, attribute)
		const id = attribute.replace("pools.", "")
		const index = this.system.attributes.findIndex(e => e.attr_id === id)
		if (index === -1) return this
		let updates
		if (isDelta) value = Math.clamped(current.min, Number(current.value) + value, current.max)
		const attributes = this.system.attributes
		attributes[index].damage = Math.max(this.attributes.get(id)!.max - value, 0)
		updates = { "system.attributes": attributes }

		const allowed = Hooks.call("modifyTokenAttribute", { attribute, value, isDelta, isBar }, updates)
		return allowed !== false ? this.update(updates) : this
	}
}

export function addWeaponBonusToMap(
	bonus: WeaponBonus,
	dieCount: number,
	tooltip: TooltipGURPS | null = null,
	m: Map<WeaponBonus, boolean> = new Map()
) {
	const savedLevel = bonus.leveledAmount.level
	const savedDieCount = bonus.leveledAmount.dieCount
	bonus.leveledAmount.dieCount = Int.from(dieCount)
	bonus.leveledAmount.level = bonus.derivedLevel
	bonus.addToTooltip(tooltip)
	bonus.leveledAmount.level = savedLevel
	bonus.leveledAmount.dieCount = savedDieCount
	m.set(bonus, true)
}
