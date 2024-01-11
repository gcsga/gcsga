import { ActorType, ItemType, SkillDefaultType } from "@module/data"
import { affects, difficulty, emcost, emweight, selfctrl, stlimit, tmcost } from "./enum"
import { TooltipGURPS } from "@module/tooltip"
import { WeightUnits } from "./weight"
import { TraitContainerSystemData, TraitContainerType } from "@item/trait_container/data"
import { CharacterProfile, CharacterSettings, Encumbrance } from "@actor/character/data"
import { MoveBonusType } from "@feature/data"
import { DurationType } from "@item/effect/data"
import { ConditionID, ManeuverID } from "@item/condition/data"
import { TraitSystemData } from "@item/trait/data"
import { LootSettings } from "@actor/loot/data"

export interface ActorResolver<T extends ActorType> {
	type: T
	equipment: Collection<EquipmentResolver | EquipmentContainerResolver>
}

export interface LootResolver extends ActorResolver<ActorType.Loot> {
	settings: LootSettings
}

export interface CharacterResolver extends ActorResolver<ActorType.Character> {
	// Profile & settings
	profile: CharacterProfile
	adjustedSizeModifier: number
	settings: CharacterSettings
	// settings: {
	// 	attributes: AttributeDefObj[]
	// 	damage_progression: DamageProgression
	// 	move_types: MoveTypeDefObj[]
	// 	default_weight_units: WeightUnits
	// }
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
}

export interface ItemResolver {
	name: string | null
	type: ItemType
	formattedName: string
	secondaryText: string
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
