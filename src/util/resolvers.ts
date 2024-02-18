import { ActorFlagsGURPS } from "@actor/base/data.ts"
import { CharacterFlags, CharacterProfile, Encumbrance } from "@actor/character/data.ts"
import { LootSettings } from "@actor/loot/data.ts"
import { SkillBonus, WeaponBonus } from "@feature"
import { MoveBonusType } from "@feature/data.ts"
import { DurationType } from "@item/effect/data.ts"
import { TraitSystemSource } from "@item/trait/data.ts"
import { TraitContainerSystemSource } from "@item/trait_container/data.ts"
import { WeaponType } from "@item/weapon/data.ts"
import {
	WeaponAccuracy,
	WeaponBlock,
	WeaponBulk,
	WeaponDamage,
	WeaponParry,
	WeaponROF,
	WeaponRange,
	WeaponReach,
	WeaponRecoil,
	WeaponShots,
	WeaponStrength,
} from "@item/weapon/index.ts"
import { SheetSettings } from "@module/data/sheet_settings.ts"
import { SkillDefault, SkillDefaultType } from "@sytem/default/index.ts"
import { TooltipGURPS } from "@sytem/tooltip/index.ts"
import { WeightUnits } from "./weight.ts"
import {
	affects,
	emcost,
	container,
	difficulty,
	display,
	feature,
	selfctrl,
	stlimit,
	tmcost,
	emweight,
} from "./enum/index.ts"
import { ActorType, ConditionID, ItemType, ManeuverID, RollType } from "@data"
import { SkillGURPS, TechniqueGURPS } from "@item"
import { BodyGURPS } from "@sytem/hit_location/object.ts"

export interface ActorResolver<T extends ActorType> {
	type: T
	// equipment: Collection<EquipmentResolver | EquipmentContainerResolver>
	// equipment: Collection<EquipmentResolver | EquipmentContainerResolver>
	flags: ActorFlagsGURPS
}

export interface LootResolver extends ActorResolver<ActorType.Loot> {
	settings: LootSettings
	equipment: Collection<EquipmentResolver | EquipmentContainerResolver>
}

export interface BodyOwner {
	hitLocationTable: BodyGURPS
	addDRBonusesFor: (
		locationID: string,
		tooltip: TooltipGURPS | null,
		drMap: Map<string, number>,
	) => Map<string, number>
}

export interface CharacterResolver extends ActorResolver<ActorType.Character> {
	// Profile & settings
	profile: CharacterProfile
	adjustedSizeModifier: number
	settings: SheetSettings
	flags: CharacterFlags
	// Items
	traits: Collection<TraitResolver | TraitContainerResovler>
	skills: Collection<SkillResolver | TechniqueResolver | SkillContainerResolver>
	spells: Collection<SpellResolver | SpellContainerResolver>
	equipment: Collection<EquipmentResolver | EquipmentContainerResolver>
	// notes: Collection<NoteResolver | NoteContainerResolver>
	conditions: Collection<ConditionResolver>
	// Attributes
	dodge: (enc: Encumbrance) => number
	effectiveST: (initialST: number) => number
	strikingST: number
	throwingST: number
	liftingST: number
	parryBonus: number
	blockBonus: number
	dodgeBonus: number
	// Hit Locations
	hitLocationTable: BodyGURPS
	// functions
	skillNamed: (
		name: string,
		specialization: string,
		require_points: boolean,
		excludes: Map<string, boolean> | null,
	) => Collection<SkillGURPS | TechniqueGURPS>
	attributeBonusFor: (
		attributeId: string,
		limitation: stlimit.Option,
		effective?: boolean,
		tooltip?: TooltipGURPS | null,
	) => number
	skillBonusFor: (name: string, specialization: string, tags: string[], tooltip: TooltipGURPS | null) => number
	namedWeaponSkillBonusesFor: (
		name: string,
		usage: string,
		tags: string[],
		tooltip: TooltipGURPS | null,
	) => SkillBonus[]
	addWeaponWithSkillBonusesFor: (
		name: string,
		specialization: string,
		usage: string,
		tags: string[],
		dieCount: number,
		tooltip: TooltipGURPS | null,
		m: Map<WeaponBonus, boolean> | null,
		allowedFeatureTypes: Map<feature.Type, boolean>,
	) => Map<WeaponBonus, boolean>
	addNamedWeaponBonusesFor: (
		name: string,
		usage: string,
		tags: string[],
		dieCount: number,
		tooltip: TooltipGURPS | null,
		m: Map<WeaponBonus, boolean>,
		allowedFeatureTypes: Map<feature.Type, boolean>,
	) => Map<WeaponBonus, boolean>
	moveBonusFor: (id: string, limitation: MoveBonusType, effective?: boolean, tooltip?: TooltipGURPS | null) => number
	resolveVariable: (variableName: string) => string
	resolveAttributeCurrent: (attr_id: string) => number
	resolveAttributeName: (attr_id: string) => string
	getFlag: (scope: string, key: string) => unknown
	costReductionFor: (attributeID: string) => number
	isSkillLevelResolutionExcluded: (name: string, specialization: string) => boolean
	registerSkillLevelResolutionExclusion: (name: string, specialization: string) => void
	unregisterSkillLevelResolutionExclusion: (name: string, specialization: string) => void
	encumbranceLevel: (forSkills: boolean) => {
		level: number
		maximum_carry: number
		penalty: number
		name: string
	}
	embeddedEval: (s: string) => string
}

export interface ItemResolver<T extends ItemType> {
	type: T
	name: string | null
	formattedName: string
	secondaryText: (optionChecker: (option: display.Option) => boolean) => string
	enabled: boolean
	tags: string[]
}

export interface ContainerResolver<T extends ItemType, C extends ItemResolver<ItemType>>
	extends ItemResolver<ItemType> {
	type: T
	children: Collection<C>
}

export interface TraitResolver extends ItemResolver<ItemType.Trait> {
	isLeveled: boolean
	levels: number
	basePoints: number
	pointsPerLevel: number
	CR: selfctrl.Roll
	CRAdj: selfctrl.Adjustment
	modifierNotes: string
	modifiers: Collection<TraitModifierResolver | TraitModifierContainerResolver>
	deepModifiers: Collection<TraitModifierResolver>
	unsatisfiedReason: string
	system: TraitSystemSource
}

export interface TraitContainerResovler
	extends ContainerResolver<ItemType.TraitContainer, TraitResolver | TraitContainerResovler> {
	containerType: container.Type
	isLeveled: boolean
	levels: number
	CR: selfctrl.Roll
	CRAdj: selfctrl.Adjustment
	modifierNotes: string
	modifiers: Collection<TraitModifierResolver | TraitModifierContainerResolver>
	deepModifiers: Collection<TraitModifierResolver>
	unsatisfiedReason: string
	system: TraitContainerSystemSource
}

export interface TraitModifierResolver extends ItemResolver<ItemType.TraitModifier> {
	isLeveled: boolean
	levels: number
	costDescription: string
	costType: tmcost.Type
	affects: affects.Option
	cost: number
	costModifier: number
	fullDescription: string
	// Unused
}

export interface TraitModifierContainerResolver
	extends ContainerResolver<
		ItemType.TraitModifierContainer,
		TraitModifierResolver | TraitModifierContainerResolver
	> {}

export interface LeveledItemResolver extends ItemResolver<ItemType> {
	points: number
	difficulty: difficulty.Level
	effectiveLevel: number
	skillLevel: string
	relativeLevel: string
	level: SkillLevelResolver
	calculateLevel: () => SkillLevelResolver
	updateLevel: () => boolean
	adjustedPoints: (tooltip?: TooltipGURPS) => number
}

export interface SkillResolver extends LeveledItemResolver {
	techLevel: string
	attribute: string
	specialization: string
	defaultedFrom: SkillDefaultResolver | null
	defaultSkill: SkillResolver | null
	defaults: SkillDefaultResolver[]
	encumbrancePenaltyMultiplier: number
}

export interface TechniqueResolver extends LeveledItemResolver {
	default: SkillDefaultResolver
	techLevel: string
	limit: number
	specialization: string
}

export interface SkillContainerResolver
	extends ContainerResolver<ItemType.SkillContainer, SkillResolver | TechniqueResolver | SkillContainerResolver> {}

export interface SpellResolver extends LeveledItemResolver {
	rituals: string
	techLevel: string
	attribute: string
	powerSource: string
	college: string[]
}

export interface SpellContainerResolver
	extends ContainerResolver<ItemType.SpellContainer, SpellResolver | SpellContainerResolver> {}

export interface SkillLevelResolver {
	level: number
	relative_level: number
	tooltip: TooltipGURPS
}

export interface SkillDefaultResolver {
	type: SkillDefaultType
	name?: string
	specialization?: string
	modifier: number
	level: number
	adjusted_level: number
	points: number
}

export interface EquipmentResolver extends ItemResolver<ItemType.Equipment> {
	equipped: boolean
	quantity: number
	ratedStrength: number
	other: boolean
	weight: number
	weightUnits: WeightUnits
	weightString: string
	modifiers: Collection<EquipmentModifierResolver | EquipmentModifierContainerResolver>
	deepModifiers: Collection<EquipmentModifierResolver>
	adjustedValue: number
	adjustedWeight: (forSkills: boolean, defUnits: WeightUnits) => number
	adjustedWeightFast: string
	extendedWeight: (forSkills: boolean, defUnits: WeightUnits) => number
	extendedWeightFast: string
}

export interface EquipmentContainerResolver
	extends ContainerResolver<ItemType.EquipmentContainer, EquipmentResolver | EquipmentContainerResolver> {
	equipped: boolean
	quantity: number
	ratedStrength: number
	other: boolean
	weight: number
	weightUnits: WeightUnits
	weightString: string
	modifiers: Collection<EquipmentModifierResolver | EquipmentModifierContainerResolver>
	deepModifiers: Collection<EquipmentModifierResolver>
	adjustedValue: number
	adjustedWeight: (forSkills: boolean, defUnits: WeightUnits) => number
	adjustedWeightFast: string
	extendedWeight: (forSkills: boolean, defUnits: WeightUnits) => number
	extendedWeightFast: string
}

export interface EquipmentModifierResolver extends ItemResolver<ItemType.EquipmentModifier> {
	techLevel: string
	costType: emcost.Type
	weightType: emweight.Type
	costAmount: string
	weightAmount: string
	weightUnits: WeightUnits
	costDescription: string
	weightDescription: string
}

export interface EquipmentModifierContainerResolver
	extends ContainerResolver<
		ItemType.EquipmentModifierContainer,
		EquipmentModifierResolver | EquipmentModifierContainerResolver
	> {}

export interface NoteResolver extends ItemResolver<ItemType.Note> {
	formattedText: string
}

export interface NoteContainerResolver
	extends ContainerResolver<ItemType.NoteContainer, NoteResolver | NoteContainerResolver> {
	formattedText: string
}

export interface WeaponResolver<T extends WeaponType> extends ItemResolver<WeaponType> {
	type: T
	strength: WeaponStrength
	damage: WeaponDamage
	level: number
	equipped: boolean
	defaults: SkillDefault[]
	resolvedMinimumStrength: number
	checkUnready: (type: RollType) => void
}

export interface MeleeWeaponResolver extends WeaponResolver<ItemType.MeleeWeapon> {
	parry: WeaponParry
	block: WeaponBlock
	reach: WeaponReach
}

export interface RangedWeaponResolver extends WeaponResolver<ItemType.RangedWeapon> {
	accuracy: WeaponAccuracy
	range: WeaponRange
	rate_of_fire: WeaponROF
	shots: WeaponShots
	bulk: WeaponBulk
	recoil: WeaponRecoil
}

export interface ConditionResolver extends Omit<ItemResolver<ItemType.Condition>, "tags"> {
	duration: {
		remaining: number
		type: DurationType
		total: number
	}
	isExpired: boolean
	level: number
	canLevel: boolean
	system: {
		id: ConditionID | ManeuverID | null
	}
}
