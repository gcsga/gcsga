import { ActorGURPS } from "@actor/base.ts"
import {
	AttributeBonus,
	ConditionalModifierBonus,
	CostReduction,
	DRBonus,
	Feature,
	FeatureMap,
	MoveBonusType,
	ReactionBonus,
	SkillBonus,
	SkillPointBonus,
	SpellBonus,
	SpellPointBonus,
	WeaponBonus,
} from "@feature/index.ts"
import {
	ConditionEffect,
	EFFECT_ACTION,
	SETTINGS,
	SYSTEM_NAME,
	Stringer,
	TokenPool,
	attrPrefix,
	gid,
} from "@module/data/misc.ts"
import { MoveType, MoveTypeDef, MoveTypeDefObj, MoveTypeObj } from "@module/system/move_type/index.ts"
import {
	ResourceTracker,
	ResourceTrackerDef,
	ResourceTrackerDefObj,
	ResourceTrackerObj,
} from "@module/system/resource_tracker/index.ts"
import { TokenDocumentGURPS } from "@module/token/document.ts"
import { Attribute } from "@sytem/attribute/object.ts"
import { attribute } from "@util/enum/attribute.ts"
import { CharacterFlagDefaults, CharacterFlags, CharacterSource, CharacterSystemSource, Encumbrance } from "./data.ts"
import { getCurrentTime, urlToBase64 } from "@util/misc.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { SETTINGS_TEMP } from "@module/settings/index.ts"
import { AttributeDefObj, AttributeObj, ThresholdOp } from "@sytem/attribute/data.ts"
import { duplicate, getProperty, hasProperty, mergeObject, setProperty } from "types/foundry/common/utils/helpers.js"
import { ConditionID } from "@item/condition/data.ts"
import { Weight, WeightUnits } from "@util/weight.ts"
import { LengthUnits } from "@util/length.ts"
import { Evaluator } from "@util/eval.ts"
import { TooltipGURPS } from "@sytem/tooltip/index.ts"
import { Int } from "@util/fxp.ts"
import { ModifierChoiceSheet } from "@item/gcs/mod_sheet.ts"
import { ActorFlags } from "@actor/base/data.ts"
import { SheetSettings } from "@module/data/sheet_settings.ts"
import { AttributeDef } from "@sytem/attribute/attribute_def.ts"
import { progression } from "@util/enum/progression.ts"
import {
	CharacterResolver,
	FilePickerGURPS,
	StringCompareType,
	StringCriteria,
	damageProgression,
	equalFold,
	fxp,
} from "@util/index.ts"
import { stlimit } from "@util/enum/stlimit.ts"
import { DiceGURPS } from "@module/dice/index.ts"
import { HitLocationTable } from "./hit_location.ts"
import { ConditionalModifier } from "@module/conditional_modifier.ts"
import { selfctrl } from "@util/enum/selfctrl.ts"
import {
	BaseWeaponGURPS,
	CR_Features,
	EquipmentContainerGURPS,
	EquipmentGURPS,
	ItemGCS,
	MeleeWeaponGURPS,
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
} from "@item/index.ts"
import { ItemGURPS } from "@item/base/document.ts"
import { SkillDefault } from "@sytem/default/index.ts"
import { feature } from "@util/enum/feature.ts"
import { wsel } from "@util/enum/wsel.ts"
import { skillsel } from "@util/enum/skillsel.ts"
import { PoolThreshold } from "@sytem/attribute/pool_threshold.ts"
import { ItemFlags } from "@item/data.ts"
import { CharacterImporter } from "./import.ts"
import { ActorType } from "@actor"
import { ItemType } from "@item/types.ts"
import { ItemSourceGURPS } from "@item/data/index.ts"

export interface CharacterGURPS<TParent extends TokenDocumentGURPS | null> extends ActorGURPS<TParent> {
	type: ActorType.Character
	flags: CharacterFlags
	features: FeatureMap
	attributes: Map<string, Attribute>
	resourceTrackers: Map<string, ResourceTracker>
	moveTypes: Map<string, MoveType>
	SizeModBonus: number
	system: CharacterSystemSource
}

export class CharacterGURPS<
	TParent extends TokenDocumentGURPS | null = TokenDocumentGURPS | null,
> extends ActorGURPS<TParent> {
	declare features: FeatureMap

	// Attributes and the like
	declare attributes: Map<string, Attribute>
	private declare _prevAttributes: Map<string, Attribute>
	declare resourceTrackers: Map<string, ResourceTracker>
	declare moveTypes: Map<string, MoveType>

	declare SizeModBonus: number

	declare variableResolverExclusions: Map<string, boolean>
	declare skillResolverExclusions: Map<string, boolean>

	private _processingThresholds = false

	// attributes: Map<string, Attribute> = new Map()
	//
	// private _prevAttributes: Map<string, Attribute> = new Map()
	//
	//
	// resource_trackers: Map<string, ResourceTracker> = new Map()
	//
	// move_types: Map<string, MoveType> = new Map()
	//
	// variableResolverExclusions: Map<string, boolean> = new Map()
	//
	// skillResolverExclusions: Map<string, boolean> = new Map()

	// constructor(data: CharacterSource, context: ActorConstructorContextGURPS = {}) {
	// 	super(data, context)
	// 	if (this.system.attributes) this.attributes = this.getAttributes()
	// 	if (this.system.resource_trackers) this.resource_trackers = this.getResourceTrackers()
	// 	if (this.system.move_types) this.move_types = this.getMoveTypes()
	// 	this.features = {
	// 		attributeBonuses: [],
	// 		costReductions: [],
	// 		drBonuses: [],
	// 		skillBonuses: [],
	// 		skillPointBonuses: [],
	// 		spellBonuses: [],
	// 		spellPointBonuses: [],
	// 		weaponBonuses: [],
	// 		moveBonuses: [],
	// 	}
	// }

	protected override _onCreate(
		data: this["_source"],
		options: DocumentModificationContext<TParent> & { promptImport: boolean },
		userId: string,
	): void {
		const default_settings = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.settings`)
		const default_attributes = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`)
		const default_resource_trackers = game.settings.get(
			SYSTEM_NAME,
			`${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`,
		)
		const default_hit_locations = {
			name: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.name`),
			roll: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.roll`),
			locations: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`),
		}
		const default_move_types = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`)
		const populate_description = game.settings.get(
			SYSTEM_NAME,
			`${SETTINGS.DEFAULT_SHEET_SETTINGS}.populate_description`,
		)
		const initial_points = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.initial_points`)
		const default_tech_level = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.tech_level`)
		const sd: DeepPartial<CharacterSystemSource> = {
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
		if (typeof sd.settings.attributes !== "object") sd.settings.attributes = []
		sd.settings.body_type = default_hit_locations
		sd.settings.resource_trackers = default_resource_trackers
		if (typeof sd.settings.resource_trackers !== "object") sd.settings.resource_trackers = []
		sd.settings.move_types = default_move_types
		if (typeof sd.settings.move_types !== "object") sd.settings.move_types = []
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

	protected override _preUpdate(
		changed: DeepPartial<this["_source"]>,
		options: DocumentModificationContext<TParent>,
		user: foundry.documents.BaseUser,
	): Promise<void> {
		changed = mergeObject(changed, {
			...this._updateAttributes(changed),
			...this._checkImport(changed),
		})
		return super._preUpdate(changed, options, user)
	}

	// override update(
	// 	data?: DeepPartial<ActorDataConstructorData | (ActorDataConstructorData & Record<string, unknown>)>,
	// 	context?: DocumentModificationContext & fu.MergeObjectOptions & { noPrepare?: boolean }
	// ): Promise<this | undefined> {
	// 	if (context?.noPrepare) this.noPrepare = true
	// 	// this.updateAttributes(data)
	// 	// this.checkImport(data)
	// 	return super.update(data, context)
	// }

	private _checkImport(data: DeepPartial<this["_source"]>): DeepPartial<CharacterSource> {
		if (hasProperty(data, "system.import")) return {}
		if (Object.keys(data).some(e => e.includes("ownership"))) return {}
		const additionalData: DeepPartial<CharacterSource> = {}
		setProperty(additionalData, "system.modified_date", new Date().toISOString())
		return additionalData
	}

	private _updateAttributes(data: DeepPartial<this["_source"]>): DeepPartial<this["_source"]> {
		if (Object.keys(data).some(e => e.includes("ownership"))) return data
		const additionalData: DeepPartial<CharacterSource> = {}
		if (this.system.attributes.length === 0) setProperty(additionalData, "system.attributes", this.newAttributes())
		if (hasProperty(data, "system.setings.attributes")) {
			const atts = getProperty(data, "system.settings.attributes") as AttributeDefObj[]
			setProperty(additionalData, "system.attributes", this.newAttributes(atts, this.system.attributes))
		}
		if (hasProperty(data, "system.setings.resource_trackers")) {
			const atts = getProperty(data, "system.settings.resource_trackers") as ResourceTrackerDefObj[]
			setProperty(
				additionalData,
				"system.resource_trackers",
				this.newTrackers(atts, this.system.resource_trackers),
			)
		}
		if (hasProperty(data, "system.setings.move_types")) {
			const atts = getProperty(data, "system.settings.move_types") as MoveTypeDefObj[]
			setProperty(additionalData, "system.move_types", this.newMoveTypes(atts, this.system.move_types))
		}
		return additionalData
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

	get editing(): boolean {
		return this.system.editing
	}

	get profile(): this["system"]["profile"] {
		return this.system.profile
	}

	get importData(): this["system"]["import"] {
		return this.system.import
	}

	// get calc() {
	// 	return this.system.calc
	// }
	//
	// set calc(v: any) {
	// 	this.system.calc = v
	// }

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
				([_k, v]) => !v.attribute_def.isPrimary && !v.attribute_def.type.includes("pool"),
			),
		)
		if (includeSeparators) return atts
		return new Map([...atts].filter(([_k, v]) => v.attribute_def.type !== attribute.Type.SecondarySeparator))
	}

	override poolAttributes(includeSeparators = false): Map<string, Attribute> {
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
			const [a, d, r, q] = t.calculatePoints()
			advantages += a
			disadvantages += d
			ancestry += r
			quirks += q
		}
		return { advantages, disadvantages, ancestry, quirks }
	}

	get skillPoints(): number {
		let total = 0
		for (const s of this.skills.filter(e => e instanceof SkillGURPS || e instanceof TechniqueGURPS) as (
			| SkillGURPS
			| TechniqueGURPS
		)[]) {
			total += s.points ?? 0
		}
		return total
	}

	get spellPoints(): number {
		let total = 0
		for (const s of this.spells.filter(e => e instanceof SpellGURPS || e instanceof RitualMagicSpellGURPS) as (
			| SpellGURPS
			| RitualMagicSpellGURPS
		)[]) {
			total += s.points ?? 0
		}
		return total
	}

	get currentMove(): number {
		return this.move(this.encumbranceLevel(true))
	}

	get effectiveMove(): number {
		return this.eMove(this.encumbranceLevel(true))
	}

	get effectiveSprint(): number {
		return Math.max(this.currentMove * 1.2, this.currentMove + 1)
	}

	get currentDodge(): number {
		return this.dodge(this.encumbranceLevel(true))
	}

	get effectiveDodge(): number {
		return this.eDodge(this.encumbranceLevel(true))
	}

	override get dodgeAttribute(): DeepPartial<Attribute> {
		return {
			id: gid.Dodge,
			attribute_def: {
				combinedName: LocalizeGURPS.translations.gurps.attributes.dodge,
			},
			effective: this.effectiveDodge,
			current: this.currentDodge,
		}
	}

	get sizeModAttribute(): DeepPartial<Attribute> {
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

	move(enc: Encumbrance, initialMove = this.resolveAttributeCurrent(gid.BasicMove)): number {
		// let initialMove = Math.max(0, this.resolveAttributeCurrent(gid.BasicMove))
		initialMove = Math.max(0, this.resolveAttributeCurrent(gid.BasicMove))
		const move = Math.trunc((initialMove * (10 + 2 * enc.penalty)) / 10)
		if (move < 1) {
			if (initialMove > 0) return 1
			return 0
		}
		return move
	}

	// Move accounting for pool thresholds
	// eMove(enc: Encumbrance): number {
	eMove(
		enc: Encumbrance,
		initialMove = this.resolveAttributeCurrent(gid.BasicMove),
		ops = this.countThresholdOpMet(ThresholdOp.HalveMove),
	): number {
		// Let initialMove = this.moveByType(Math.max(0, this.resolveAttributeCurrent(gid.BasicMove)))
		// let initialMove = this.resolveMove(this.moveType)
		let divisor = 2 * Math.min(ops, 2)
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
		const move = this.moveTypes?.get(type)?.base
		if (move) return move
		return 0
		// return -Infinity
	}

	get moveType(): string {
		return this.flags[SYSTEM_NAME][ActorFlags.MoveType]
	}

	dodge(enc: Encumbrance): number {
		const dodge =
			3 + (this.system.calc?.dodge_bonus ?? 0) + Math.max(this.resolveAttributeCurrent(gid.BasicSpeed), 0)
		return Math.floor(Math.max(dodge + enc.penalty, 1))
	}

	// Dodge accounting for pool thresholds
	eDodge(enc: Encumbrance, ops = this.countThresholdOpMet(ThresholdOp.HalveDodge)): number {
		let dodge = 3 + (this.system.calc?.dodge_bonus ?? 0) + Math.max(this.resolveAttributeCurrent(gid.BasicSpeed), 0)
		const divisor = 2 * Math.min(ops, 2)
		if (divisor > 0) {
			dodge = Math.ceil(dodge / divisor)
		}
		return Math.floor(Math.max(dodge + enc.penalty, 1))
	}

	countThresholdOpMet(op: ThresholdOp): number {
		let total = 0
		this.poolAttributes().forEach((a: Attribute) => {
			if (!a.apply_ops) return
			const threshold = a.currentThreshold
			if (threshold && threshold.ops?.includes(op)) total += 1
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
	basicLift = 0

	getBasicLift(): number {
		const ST = this.attributes.get(gid.Strength)?._effective(this.system.calc?.lifting_st_bonus ?? 0) || 0
		let basicLift = ST ** 2 / 5
		if (this.settings.damage_progression === progression.Option.KnowingYourOwnStrength)
			basicLift = Int.from(2 * 10 ** (ST / 10), 1)
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
		const autoEncumbrance = this.flags[SYSTEM_NAME][ActorFlags.AutoEncumbrance]
		const allEncumbrance = this.allEncumbrance
		if (autoEncumbrance && !autoEncumbrance.active) return allEncumbrance[autoEncumbrance?.manual || 0]
		for (const e of allEncumbrance) {
			if (carried <= e.maximum_carry) return e
		}
		return allEncumbrance[allEncumbrance.length - 1]
	}

	weightCarried(forSkills: boolean): number {
		const total = this.carriedEquipment.reduce((n, e) => {
			if (e.container === this) return n + e.extendedWeight(forSkills, this.system.settings.default_weight_units)
			return n
		}, 0)
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

	override get strengthOrZero(): number {
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

	thrustFor(st: number): DiceGURPS {
		return damageProgression.thrustFor(this.settings.damage_progression, st)
	}

	get swing(): DiceGURPS {
		if (this.flags[SYSTEM_NAME][ActorFlags.AutoDamage]?.active === false)
			return new DiceGURPS(this.flags[SYSTEM_NAME][ActorFlags.AutoDamage].swing)
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

	// get striking_st_bonus(): number {
	// 	return this.system.calc?.striking_st_bonus ?? 0
	// }

	// set striking_st_bonus(v: number) {
	// 	this.system.calc.striking_st_bonus = v
	// }

	// get lifting_st_bonus(): number {
	// 	return this.calc?.lifting_st_bonus ?? 0
	// }

	// set lifting_st_bonus(v: number) {
	// 	this.system.calc.lifting_st_bonus = v
	// }

	// get throwing_st_bonus(): number {
	// 	return this.system?.calc?.throwing_st_bonus ?? 0
	// }

	// set throwing_st_bonus(v: number) {
	// 	this.system.calc.throwing_st_bonus = v
	// }

	get parryBonus(): number {
		// return this.calc?.parry_bonus ?? 0
		return this.attributeBonusFor(gid.Parry, stlimit.Option.None) ?? 0
	}

	get blockBonus(): number {
		// return this.calc?.block_bonus ?? 0
		return this.attributeBonusFor(gid.Block, stlimit.Option.None) ?? 0
	}

	get dodgeBonus(): number {
		return this.attributeBonusFor(gid.Dodge, stlimit.Option.None) ?? 0
		// return this.calc?.dodge_bonus ?? 0
	}

	override get sizeMod(): number {
		if (!this.system?.profile) return 0
		return this.system.profile.SM + this.SizeModBonus
	}

	override get hitLocationTable(): HitLocationTable {
		return this.BodyType
	}

	// Flat list of all hit locations
	// get HitLocations(): HitLocation[] {
	// 	const recurseLocations = function (table: HitLocationTable, locations: HitLocation[] = []): HitLocation[] {
	// 		table.locations.forEach(e => {
	// 			locations.push(e)
	// 			if (e.subTable) locations = recurseLocations(e.subTable, locations)
	// 		})
	// 		return locations
	// 	}
	//
	// 	return recurseLocations(this.BodyType, [])
	// }

	// Item Types
	override get itemTypes(): Record<ItemType, ItemGURPS[]> {
		return super.itemTypes as Record<ItemType, ItemGURPS[]>
	}

	override get traits(): Collection<TraitGURPS | TraitContainerGURPS> {
		// const traits: Collection<TraitGURPS | TraitContainerGURPS> = new Collection()
		// for (const item of this.items) {
		// 	if (item instanceof TraitGURPS || item instanceof TraitContainerGURPS) traits.set(item._id, item)
		// }
		// return traits
		return new Collection(
			[...this.itemTypes[ItemType.Trait], ...this.itemTypes[ItemType.TraitContainer]].map(e => [
				e.id,
				e,
			]) as readonly [string, Item][],
		) as Collection<TraitGURPS | TraitContainerGURPS>
	}

	get skills(): Collection<SkillGURPS | TechniqueGURPS | SkillContainerGURPS> {
		return new Collection(
			[
				...this.itemTypes[ItemType.Skill],
				...this.itemTypes[ItemType.Technique],
				...this.itemTypes[ItemType.SkillContainer],
			].map(e => [e.id, e]) as readonly [string, Item][],
		) as Collection<SkillGURPS | TechniqueGURPS | SkillContainerGURPS>
	}

	get spells(): Collection<SpellGURPS | RitualMagicSpellGURPS | SpellContainerGURPS> {
		return new Collection(
			[
				...this.itemTypes[ItemType.Spell],
				...this.itemTypes[ItemType.RitualMagicSpell],
				...this.itemTypes[ItemType.SpellContainer],
			].map(e => [e.id, e]) as readonly [string, Item][],
		) as Collection<SpellGURPS | RitualMagicSpellGURPS | SpellContainerGURPS>
	}

	get equipment(): Collection<EquipmentGURPS | EquipmentContainerGURPS> {
		return new Collection(
			[...this.itemTypes[ItemType.Equipment], ...this.itemTypes[ItemType.EquipmentContainer]].map(e => [
				e.id,
				e,
			]) as readonly [string, Item][],
		) as Collection<EquipmentGURPS | EquipmentContainerGURPS>
	}

	get carriedEquipment(): Collection<EquipmentGURPS | EquipmentContainerGURPS> {
		return new Collection(
			this.equipment
				.filter(item => !item.other)
				.map(item => {
					return [item.id, item]
				}),
		)
	}

	get other_equipment(): Collection<EquipmentGURPS | EquipmentContainerGURPS> {
		return new Collection(
			this.equipment
				.filter(item => item.other)
				.map(item => {
					return [item.id, item]
				}),
		)
	}

	get notes(): Collection<NoteGURPS | NoteContainerGURPS> {
		const notes: Collection<NoteGURPS | NoteContainerGURPS> = new Collection()
		for (const item of this.items) {
			if (item instanceof NoteGURPS || item instanceof NoteContainerGURPS) notes.set(item.id, item)
		}
		return notes
	}

	// Weapons
	get meleeWeapons(): Collection<MeleeWeaponGURPS> {
		const meleeWeapons: Collection<MeleeWeaponGURPS> = new Collection()
		for (const item of this.items) {
			if (item instanceof MeleeWeaponGURPS) meleeWeapons.set(item.id, item)
		}
		return meleeWeapons
	}

	get rangedWeapons(): Collection<RangedWeaponGURPS> {
		const rangedWeapons: Collection<RangedWeaponGURPS> = new Collection()
		for (const item of this.items) {
			if (item instanceof RangedWeaponGURPS) rangedWeapons.set(item.id, item)
		}
		return rangedWeapons
	}

	get weapons(): Collection<BaseWeaponGURPS> {
		const weapons: Collection<BaseWeaponGURPS> = new Collection()
		this.meleeWeapons.forEach(e => weapons.set(e.id, e))
		this.rangedWeapons.forEach(e => weapons.set(e.id, e))
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
		const reactionMap: Map<string, ConditionalModifier> = new Map()
		for (const t of this.traits) {
			const source = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.reaction.from_trait, {
				name: t.name ?? "",
			})
			this.reactionsFromFeatureList(source, t.features, reactionMap)
			for (const mod of t.deepModifiers) {
				if (!mod.enabled) continue
				this.reactionsFromFeatureList(source, mod.features, reactionMap)
			}
			if (t.CR !== 0 && t.CRAdj === selfctrl.Adjustment.ReactionPenalty) {
				const amount = selfctrl.Adjustment.adjustment(t.CRAdj, t.CR)
				const situation = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.reaction.cr, {
					trait: t.name ?? "",
				})
				if (reactionMap.has(situation)) reactionMap.get(situation)!.add(source, amount)
				else reactionMap.set(situation, new ConditionalModifier(source, situation, amount))
			}
		}
		for (const e of this.carriedEquipment) {
			if (e.equipped && e.system.quantity > 0) {
				const source = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.reaction.from_equipment, {
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
		const reactionList = Array.from(reactionMap.values()).sort((a, b) =>
			a.from < b.from ? -1 : a.from > b.from ? 1 : 0,
		)
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
		const reactionMap: Map<string, ConditionalModifier> = new Map()
		this.traits.forEach(t => {
			const source = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.reaction.from_trait, {
				name: t.name ?? "",
			})
			this.conditionalModifiersFromFeatureList(source, t.features, reactionMap)
			for (const mod of t.deepModifiers) {
				this.conditionalModifiersFromFeatureList(source, mod.features, reactionMap)
			}
		})
		for (const e of this.carriedEquipment) {
			if (e.equipped && e.system.quantity > 0) {
				const source = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.reaction.from_equipment, {
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
		const reactionList = Array.from(reactionMap.values())
		return reactionList
	}

	conditionalModifiersFromFeatureList(
		source: string,
		features: Feature[],
		m: Map<string, ConditionalModifier>,
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
			if (def === null || def === undefined) continue
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
			i += 1
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
			if (tracker_def === null || tracker_def === undefined) continue
			const tracker = new ResourceTracker(this, tracker_def.id, i)
			t.push({
				// order: tracker.order,
				tracker_id: tracker.tracker_id,
				damage: tracker.damage,
			})
			i += 1
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
			i += 1
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
		const b = this.system.settings.body_type
		if (!b) return new HitLocationTable("", new DiceGURPS(), [], this, "")
		return new HitLocationTable(b.name, b.roll, b.locations, this, "")
	}

	prepareAttributes(att_array = this.system.attributes): Map<string, Attribute> {
		const attributes: Map<string, Attribute> = new Map()
		if (!att_array.length) return attributes
		att_array.forEach((v, k) => {
			attributes.set(v.attr_id, new Attribute(this, v.attr_id, k, v))
		})
		return attributes
	}

	prepareResourceTrackers(): Map<string, ResourceTracker> {
		const trackers: Map<string, ResourceTracker> = new Map()
		const tracker_array = this.system.resource_trackers
		if (!tracker_array?.length) return trackers
		tracker_array.forEach((v, k) => {
			trackers.set(v.tracker_id, new ResourceTracker(this, v.tracker_id, k, v))
		})
		return trackers
	}

	prepareMoveTypes(mt_array = this.system.move_types): Map<string, MoveType> {
		const move_types: Map<string, MoveType> = new Map()
		if (!mt_array?.length) return move_types
		mt_array.forEach((v, k) => {
			move_types.set(v.move_type_id, new MoveType(this, v.move_type_id, k, v))
		})
		return move_types
	}

	protected override _onCreateDescendantDocuments(
		parent: this,
		collection: "effects" | "items",
		documents: ActiveEffect<this>[] | Item<this>[],
		result: ActiveEffect<this>["_source"][] | Item<this>["_source"][],
		// @ts-expect-error type instantiation excessively deep (but it isn't)
		options: DocumentModificationContext<this> & { substitutions: boolean },
		userId: string,
	): void {
		super._onCreateDescendantDocuments(parent, collection, documents, result, options, userId)
		// Replace @X@ notation fields with given text
		if (collection === "items" && options.substitutions) {
			for (const item of documents.filter(e => e instanceof ItemGCS)) {
				const sheet = ModifierChoiceSheet.new([item as ItemGCS<this>])
				if (game.userId === userId) sheet?.render(true)
			}
		}
		if (this.system.profile.tech_level !== "" && collection === "items") {
			for (const item of documents.filter(
				e => e instanceof SkillGURPS || e instanceof SpellGURPS || e instanceof RitualMagicSpellGURPS,
			)) {
				const skill = item as unknown as SkillGURPS
				if (skill.system.tech_level_required && skill.system.tech_level)
					skill.system.tech_level = this.system.profile.tech_level
			}
		}
	}

	// Prepare data
	override prepareData(): void {
		super.prepareData()
		const pools: Record<string, TokenPool> = {}
		this.attributes?.forEach(e => {
			if (e.attribute_def.type === attribute.Type.Pool) {
				pools[e.id] = { value: e.current, min: -Infinity, max: e.max }
			}
		})
		this.resourceTrackers?.forEach(e => {
			pools[e.id] = { value: e.current, min: e.min, max: e.max }
		})
		this.system.pools = pools
	}

	override prepareBaseData(): void {
		super.prepareBaseData()

		// Attribute-like maps
		this.attributes = this.prepareAttributes()
		this.resourceTrackers = this.prepareResourceTrackers()
		this.moveTypes = this.prepareMoveTypes()

		// Reset features
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

		// this.system.settings.attributes.forEach(e => (e.cost_adj_percent_per_sm ??= 0))
		// if (this.system.attributes.length === 0) {
		// 	this.system.attributes = this.newAttributes()
		// 	this.attributes = this.getAttributes()
		// }
		// if (this.system.settings.resource_trackers.length === 0) {
		// 	this.system.resource_trackers = this.newTrackers()
		// 	this.resource_trackers = this.getResourceTrackers()
		// }
		// if (this.system.settings.move_types.length === 0) {
		// 	this.system.move_types = this.newMoveTypes()
		// 	this.move_types = this.getMoveTypes()
		// }
	}

	override prepareEmbeddedDocuments(): void {
		super.prepareEmbeddedDocuments()
		// if (this.noPrepare) {
		// 	this.noPrepare = false
		// 	return
		// }
		// this.updateSkills()
		// this.updateSpells()
		this.processFeatures()
		this.processPrereqs()
		// for (let i = 0; i < 5; i++) {
		// 	this.processFeatures()
		// 	this.processPrereqs()
		// 	// let skillsChanged = this.updateSkills()
		// 	// let spellsChanged = this.updateSpells()
		// 	if (!skillsChanged && !spellsChanged) break
		// }
	}

	processFeatures(): void {
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

		this.attributes = this.prepareAttributes()
		this.processThresholds()
		this.basicLift = this.getBasicLift()

		this.resourceTrackers = this.prepareResourceTrackers()
		this.moveTypes = this.prepareMoveTypes()
	}

	processThresholds(): void {
		if (!this.isOwner) return
		if (this._processingThresholds || !this._prevAttributes || this.attributes === this._prevAttributes) return

		this._processingThresholds = true

		const effects = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`)

		this.poolAttributes(false).forEach(e => {
			if (!this._prevAttributes.has(e.id)) return

			const prevState = this._prevAttributes.get(e.id)?.currentThreshold?.state
			const currentState = e.currentThreshold?.state

			if (prevState === currentState) return

			const enterActions: ConditionEffect[] = effects
				.filter((f: { attribute: string; state: string }) => f.attribute === e.id && f.state === currentState)
				.reduce((acc: ConditionEffect[], e: { enter: ConditionEffect[]; leave: ConditionEffect[] }) => {
					return [...acc, ...e.enter]
				}, [])
			const leaveActions = effects
				.filter((f: { attribute: string; state: string }) => f.attribute === e.id && f.state === prevState)
				.reduce((acc: ConditionEffect[], e: { enter: ConditionEffect[]; leave: ConditionEffect[] }) => {
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
				item => item.action === EFFECT_ACTION.REMOVE && this.hasCondition(item.id),
			)

			if (addActions.length) this.addConditions(addActions.map(e => e.id))
			if (removeActions.length) this.removeConditions(removeActions.map(e => e.id))
		})

		this._prevAttributes = this.attributes
		this._prevAttributes = new Map()
		this.attributes.forEach((e, k) => {
			if (e.attribute_def.type === attribute.Type.Pool) {
				e._overridenThreshold = new PoolThreshold({ ...e.currentThreshold })
			}
			this._prevAttributes.set(k, e)
		})
		this._processingThresholds = false
	}

	processFeature(owner: Stringer, subOwner: Stringer | undefined, f: Feature, levels: number): number | void {
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
		return
	}

	processPrereqs(): void {
		const not_met = LocalizeGURPS.translations.gurps.prereq.not_met
		for (const t of this.traits.filter(e => e instanceof TraitGURPS)) {
			t.unsatisfiedReason = ""
			if (t instanceof TraitGURPS && !t.prereqsEmpty) {
				const tooltip = new TooltipGURPS()
				if (!t.prereqs.satisfied(this, t, tooltip)) {
					t.unsatisfiedReason = not_met + tooltip.toString()
				}
			}
		}
		for (let k of this.skills.filter(e => !(e instanceof SkillContainerGURPS))) {
			k = k as SkillGURPS | TechniqueGURPS
			k.unsatisfiedReason = ""
			const tooltip = new TooltipGURPS()
			let satisfied = true
			const eqpPenalty = { value: false }
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
				k.unsatisfiedReason = not_met + tooltip.toString()
			}
		}
		for (let b of this.spells.filter(e => !(e instanceof SpellContainerGURPS))) {
			b = b as SpellGURPS | RitualMagicSpellGURPS
			b.unsatisfied_reason = ""
			const tooltip = new TooltipGURPS()
			let satisfied = true
			const eqpPenalty = { value: false }
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
			e.unsatisfiedReason = ""
			if (!e.prereqsEmpty) {
				const tooltip = new TooltipGURPS()
				if (!e.prereqs.satisfied(this, e, tooltip)) {
					e.unsatisfiedReason = not_met + tooltip.toString()
				}
			}
		}
	}

	// updateSkills(): boolean {
	// 	let changed = false
	// 	for (const k of [...this.itemTypes[ItemType.Skill], ...this.itemTypes[ItemType.Technique]]) {
	// 		if ((k as SkillGURPS).updateLevel()) changed = true
	// 	}
	// 	return changed
	// }

	// updateSpells(): boolean {
	// 	let changed = false
	// 	for (const b of [...this.itemTypes[ItemType.Spell], ...this.itemTypes[ItemType.RitualMagicSpell]]) {
	// 		if ((b as SpellGURPS).updateLevel()) changed = true
	// 	}
	// 	return changed
	// }

	// Directed Skill Getters
	baseSkill(def: SkillDefault | null, require_points: boolean): SkillGURPS | null {
		if (!def) return null
		if (!def.skillBased) return null
		return this.bestSkillNamed(def.name ?? "", def.specialization ?? "", require_points, null)
	}

	bestWeaponNamed(
		name: string,
		usage: string,
		type: WeaponType,
		excludes: Map<string, boolean> | null,
	): BaseWeaponGURPS | null {
		let best: BaseWeaponGURPS | null = null
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
		excludes: Map<string, boolean> | null,
	): Collection<BaseWeaponGURPS> {
		const weapons: Collection<BaseWeaponGURPS> = new Collection()
		for (const wep of this.equippedWeapons(type)) {
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
			if (sk instanceof TechniqueGURPS) continue
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
		excludes: Map<string, boolean> | null,
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
				item.dummyActor = this as CharacterResolver
				item.points = 0
				skills.set(item.id, item)
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
				skills.set(item.id, item)
		}
		return skills
	}

	// Feature Processing
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

	addDRBonusesFor(
		locationID: string,
		tooltip: TooltipGURPS | null = null,
		drMap: Map<string, number> = new Map(),
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
		if (!attr) attr = this.resourceTrackers.get(parts[0])
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
		let data: Record<string, unknown>
		if (path === "") {
			data = system
		} else {
			data = getProperty(system, path) as Record<string, unknown>
			data.version = 4
			if (path === "settings.attributes") data.type = "attribute_settings"
			else if (path === "settings.body_type") data.type = "body_type"
		}
		// return saveDataToFile(JSON.stringify(data, null, "\t"), extension, `${name}.${extension}`)
		fu.saveDataToFile(JSON.stringify(data, null, "\t"), extension, `${name}.${extension}`)
	}

	protected async exportSystemData(): Promise<[DeepPartial<CharacterSystemSource>, string]> {
		const system: DeepPartial<CharacterSystemSource> & Record<string, unknown> = { ...duplicate(this.system) }
		system.type = "character" as ActorType
		const items = (this.items as unknown as Collection<ItemGURPS>)
			.filter(e => !e.getFlag(SYSTEM_NAME, ItemFlags.Container))
			.map((e: ItemGURPS) => e.exportSystemData(true))
		const third_party: Record<string, unknown> = {}

		third_party.settings = { resource_trackers: system.settings?.resource_trackers }
		third_party.resource_trackers = system.resource_trackers
		third_party.import = system.import
		third_party.move = system.move
		system.third_party = third_party
		system.traits =
			items.filter((e: ItemSourceGURPS) => [ItemType.Trait, ItemType.TraitContainer].includes(e.type)) ?? []
		system.skills =
			items.filter((e: ItemSourceGURPS) =>
				[ItemType.Skill, ItemType.SkillContainer, ItemType.Technique].includes(e.type),
			) ?? []
		system.spells =
			items.filter((e: ItemSourceGURPS) =>
				[ItemType.Spell, ItemType.SpellContainer, ItemType.RitualMagicSpell].includes(e.type),
			) ?? []
		system.equipment =
			items
				.filter(
					(e: ItemSourceGURPS) =>
						[ItemType.Equipment, "equipment", ItemType.EquipmentContainer].includes(e.type) && !e.other,
				)
				.map((e: ItemSourceGURPS) => {
					delete e.other
					return e
				}) ?? []
		system.other_equipment =
			items
				.filter(
					(e: ItemSourceGURPS) =>
						[ItemType.Equipment, "equipment", ItemType.EquipmentContainer].includes(e.type) && e.other,
				)
				.map((e: ItemSourceGURPS) => {
					delete e.other
					return e
				}) ?? []
		system.notes =
			items.filter((e: ItemSourceGURPS) => [ItemType.Note, ItemType.NoteContainer].includes(e.type)) ?? []
		if (system.settings)
			system.settings.attributes = system.settings.attributes?.map(
				(e: DeepPartial<AttributeDefObj> | undefined) => {
					if (!e) return
					const f = { ...e }
					f.id = e.id
					delete f.id
					delete f.order
					if (f.type !== attribute.Type.Pool) delete f.thresholds
					return f as AttributeDefObj
				},
			)
		system.attributes = system.attributes?.map((e: Partial<AttributeObj> | undefined) => {
			return { ...e } as AttributeObj
		})
		if (system.profile && this.img && !this.img.endsWith(".svg"))
			system.profile.portrait = await urlToBase64(this.img)

		delete system.resource_trackers
		delete system.settings?.resource_trackers
		delete system.import
		delete system.move
		delete system.pools
		delete system.editing

		// const json = JSON.stringify(system, null, "\t")
		const filename = this.name ?? LocalizeGURPS.translations.TYPES.Actor.character_gcs

		// return { text: json, name: filename }
		return [system, filename]
	}

	async promptImport(): Promise<void> {
		const dialog = new Dialog({
			title: LocalizeGURPS.translations.gurps.character.import_prompt.title,
			content: await renderTemplate(`systems/${SYSTEM_NAME}/templates/actor/import-prompt.hbs`, { object: this }),
			buttons: {
				import: {
					icon: '<i class="fas fa-file-import"></i>',
					label: LocalizeGURPS.translations.gurps.character.import_prompt.import,
					callback: _html => {
						let file: { text: string; name: string; path: string } | null = null
						if (game.settings.get(SYSTEM_NAME, SETTINGS.SERVER_SIDE_FILE_DIALOG)) {
							const filepicker = new FilePickerGURPS({
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
							filepicker.extension = [".gcs", ".xml", ".gca5"]
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
								fu.readTextFromFile(rawFile).then((text: string) => {
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

	registerSkillLevelResolutionExclusion(name: string, specialization: string): void {
		this.skillResolverExclusions ??= new Map()
		this.skillResolverExclusions.set(this.skillLevelResolutionKey(name, specialization), true)
	}

	unregisterSkillLevelResolutionExclusion(name: string, specialization: string): void {
		this.skillResolverExclusions.delete(this.skillLevelResolutionKey(name, specialization))
	}

	skillLevelResolutionKey(name: string, specialization: string): string {
		return `${name}\u0000${specialization}`
	}

	override getRollData(): Record<string, unknown> {
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

	override async modifyTokenAttribute(
		attribute: string,
		value: number,
		isDelta?: boolean,
		isBar?: boolean,
	): Promise<this> {
		if (!attribute.startsWith("pools")) return super.modifyTokenAttribute(attribute, value, isDelta, isBar)

		const current = getProperty(this.system, attribute) as { min: number; max: number; value: number }
		const id = attribute.replace("pools.", "")
		const index = this.system.attributes.findIndex(e => e.attr_id === id)
		if (index === -1) return this
		if (isDelta) value = Math.clamped(current.min, Number(current.value) + value, current.max)
		const attributes = this.system.attributes
		attributes[index].damage = Math.max(this.attributes.get(id)!.max - value, 0)
		const updates = { "system.attributes": attributes }

		const allowed = Hooks.call("modifyTokenAttribute", { attribute, value, isDelta, isBar }, updates)
		return <this>(allowed !== false ? this.update(updates) : this)
	}
}

export function addWeaponBonusToMap(
	bonus: WeaponBonus,
	dieCount: number,
	tooltip: TooltipGURPS | null = null,
	m: Map<WeaponBonus, boolean> = new Map(),
): void {
	const savedLevel = bonus.leveledAmount.level
	const savedDieCount = bonus.leveledAmount.dieCount
	bonus.leveledAmount.dieCount = Int.from(dieCount)
	bonus.leveledAmount.level = bonus.derivedLevel
	bonus.addToTooltip(tooltip)
	bonus.leveledAmount.level = savedLevel
	bonus.leveledAmount.dieCount = savedDieCount
	m.set(bonus, true)
}
