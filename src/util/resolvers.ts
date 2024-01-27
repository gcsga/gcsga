import { ActorFlagsGURPS } from "@actor/base/data.ts"
import { CharacterProfile, Encumbrance } from "@actor/character/data.ts"
import { LootSettings } from "@actor/loot/data.ts"
import { ActorType, ItemType, RollType, SkillDefaultType } from "@module/data/misc.ts"
import { SheetSettings } from "@module/data/sheet_settings.ts"
import { stlimit } from "./enum/stlimit.ts"
import { TooltipGURPS } from "@sytem/tooltip/index.ts"
import { MoveBonusType } from "@feature/data.ts"
import { display } from "./enum/display.ts"
import { selfctrl } from "./enum/selfctrl.ts"
import { TraitSystemData } from "@item/trait/data.ts"
import { TraitContainerSystemData, TraitContainerType } from "@item/trait_container/data.ts"
import { affects } from "./enum/affects.ts"
import { difficulty } from "./enum/difficulty.ts"
import { WeightUnits } from "./weight.ts"
import { emweight } from "./enum/emweight.ts"
import { WeaponType } from "@item/weapon/data.ts"
import { WeaponStrength } from "@item/weapon/weapon_strength.ts"
import { WeaponDamage } from "@item/weapon/index.ts"
import { SkillDefault } from "@sytem/default/index.ts"
import { WeaponParry } from "@item/weapon/weapon_parry.ts"
import { WeaponBlock } from "@item/weapon/weapon_block.ts"
import { WeaponReach } from "@item/weapon/weapon_reach.ts"
import { WeaponAccuracy } from "@item/weapon/weapon_accuracy.ts"
import { WeaponRange } from "@item/weapon/weapon_range.ts"
import { WeaponROF } from "@item/weapon/weapon_rof.ts"
import { WeaponShots } from "@item/weapon/weapon_shots.ts"
import { WeaponBulk } from "@item/weapon/weapon_bulk.ts"
import { DurationType } from "@item/effect/data.ts"
import { ConditionID, ManeuverID } from "@item/condition/data.ts"
import { tmcost } from "./enum/tmcost.ts"
import { emcost } from "./enum/emcost.ts"
import { WeaponRecoil } from "@item/weapon/weapon_recoil.ts"

export interface ActorResolver<T extends ActorType> {
	type: T
	// equipment: Collection<EquipmentResolver | EquipmentContainerResolver>
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
		tooltip?: TooltipGURPS | null,
	) => number
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
}

export interface ContainerResolver<C extends ItemResolver<ItemType>> extends ItemResolver<ItemType> {
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
	unsatisfiedReason: string
	system: TraitContainerSystemData
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
	extends ContainerResolver<TraitModifierResolver | TraitModifierContainerResolver> {}

export interface LeveledItemResolver extends ItemResolver<ItemType> {
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
	extends ContainerResolver<SkillResolver | TechniqueResolver | SkillContainerResolver> {}

export interface SpellResolver extends LeveledItemResolver {
	rituals: string
	techLevel: string
	attribute: string
	powerSource: string
	college: string[]
}

export interface SpellContainerResolver extends ContainerResolver<SpellResolver | SpellContainerResolver> {}

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
	extends ContainerResolver<EquipmentModifierResolver | EquipmentModifierContainerResolver> {}

export interface NoteResolver extends ItemResolver<ItemType.Note> {
	formattedText: string
}

export interface NoteContainerResolver extends ContainerResolver<NoteResolver | NoteContainerResolver> {
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

export interface ConditionResolver extends ItemResolver<ItemType.Condition> {
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
