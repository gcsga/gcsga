import { ActorType, ItemType, RollType, SheetSettings, SkillDefaultType } from "@module/data"
import { affects, difficulty, display, emcost, emweight, selfctrl, stlimit, tmcost } from "./enum"
import { TooltipGURPS } from "@module/tooltip"
import { WeightUnits } from "./weight"
import { TraitContainerSystemData, TraitContainerType } from "@item/trait_container/data"
import { CharacterProfile, Encumbrance } from "@actor/character/data"
import { MoveBonusType } from "@feature/data"
import { DurationType } from "@item/effect/data"
import { ConditionID, ManeuverID } from "@item/condition/data"
import { TraitSystemData } from "@item/trait/data"
import { LootSettings } from "@actor/loot/data"
import { WeaponStrength } from "@item/weapon/weapon_strength"
import { WeaponDamage, WeaponType } from "@item"
import { SkillDefault } from "@module/default"
import { WeaponParry } from "@item/weapon/weapon_parry"
import { WeaponBlock } from "@item/weapon/weapon_block"
import { WeaponReach } from "@item/weapon/weapon_reach"
import { WeaponAccuracy } from "@item/weapon/weapon_accuracy"
import { WeaponRange } from "@item/weapon/weapon_range"
import { WeaponROF } from "@item/weapon/weapon_rof"
import { WeaponShots } from "@item/weapon/weapon_shots"
import { WeaponBulk } from "@item/weapon/weapon_bulk"
import { WeaponRecoil } from "@item/weapon/weapon_recoil"
import { ActorFlagsGURPS } from "@actor"

export interface ActorResolver<T extends ActorType> {
	type: T
	equipment: Collection<EquipmentResolver | EquipmentContainerResolver>
	flags: ActorFlagsGURPS
}

export interface LootResolver extends ActorResolver<ActorType.Loot> {
	settings: LootSettings
}

export interface CharacterResolver extends ActorResolver<ActorType.Character> {
	// Profile & settings
	profile: CharacterProfile
	adjustedSizeModifier: number
	settings: SheetSettings
	// Items
	traits: Collection<TraitResolver | TraitContainerResovler>
	skills: Collection<SkillResolver | TechniqueResolver | SkillContainerResolver>
	spells: Collection<SpellResolver | SpellContainerResolver>
	equipment: Collection<EquipmentResolver | EquipmentContainerResolver>
	notes: Collection<NoteResolver | NoteContainerResolver>
	conditions: Collection<ConditionResolver>
	// Attributes
	dodge: (enc: Encumbrance) => number
	effectiveST: (initialST: number) => number
	strikingST: number
	throwingST: number
	liftingST: number
	// functions
	attributeBonusFor: (
		attributeId: string,
		limitation: stlimit.Option,
		effective?: boolean,
		tooltip?: TooltipGURPS | null
	) => number
	moveBonusFor: (id: string, limitation: MoveBonusType, effective?: boolean, tooltip?: TooltipGURPS | null) => number
	resolveVariable: (variableName: string) => string
	resolveAttributeCurrent: (attr_id: string) => number
	resolveAttributeName: (attr_id: string) => string
	getFlag: (scope: any, key: string) => unknown
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

export interface ItemResolver {
	name: string | null
	type: ItemType
	formattedName: string
	secondaryText: (optionChecker: (option: display.Option) => boolean) => string
	enabled: boolean
}

export interface ContainerResolver<C extends ItemResolver> extends ItemResolver {
	children: Collection<C>
}

export interface TraitResolver extends ItemResolver {
	isLeveled: boolean
	levels: number
	basePoints: number
	pointsPerLevel: number
	CR: selfctrl.Roll
	CRAdj: selfctrl.Adjustment
	modifierNotes: string
	modifiers: Collection<TraitModifierResolver | TraitModifierContainerResolver>
	deepModifiers: Collection<TraitModifierResolver>
	unsatisfied_reason: string
	system: TraitSystemData
}

export interface TraitContainerResovler extends ContainerResolver<TraitResolver | TraitContainerResovler> {
	containerType: TraitContainerType
	isLeveled: boolean
	levels: number
	CR: selfctrl.Roll
	CRAdj: selfctrl.Adjustment
	modifierNotes: string
	modifiers: Collection<TraitModifierResolver | TraitModifierContainerResolver>
	deepModifiers: Collection<TraitModifierResolver>
	unsatisfied_reason: string
	system: TraitContainerSystemData
}

export interface TraitModifierResolver extends ItemResolver {
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
	extends ContainerResolver<TraitModifierResolver | TraitModifierContainerResolver> { }

export interface LeveledItemResolver extends ItemResolver {
	points: number
	difficulty: difficulty.Level
	defaultedFrom: SkillDefaultResolver | null
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
	defaultSkill?: SkillResolver
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
	extends ContainerResolver<SkillResolver | TechniqueResolver | SkillContainerResolver> { }

export interface SpellResolver extends LeveledItemResolver {
	rituals: string
	techLevel: string
	attribute: string
	powerSource: string
	college: string[]
}

export interface SpellContainerResolver extends ContainerResolver<SpellResolver | SpellContainerResolver> { }

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

export interface EquipmentResolver extends ItemResolver {
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

export interface EquipmentContainerResolver extends ContainerResolver<EquipmentResolver | EquipmentContainerResolver> {
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

export interface EquipmentModifierResolver extends ItemResolver {
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
	extends ContainerResolver<EquipmentModifierResolver | EquipmentModifierContainerResolver> { }

export interface NoteResolver extends ItemResolver {
	formattedText: string
}

export interface NoteContainerResolver extends ContainerResolver<NoteResolver | NoteContainerResolver> {
	formattedText: string
}

export interface WeaponResolver<T extends WeaponType> extends ItemResolver {
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

export interface ConditionResolver extends ItemResolver {
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
