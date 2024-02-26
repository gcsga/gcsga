import { prereq } from "@util/enum/prereq.ts"
import { spellcmp } from "@util/enum/spellcmp.ts"
import { NumericCriteriaObj } from "@util/numeric-criteria.ts"
import { StringCriteriaObj } from "@util/string-criteria.ts"
import { WeightCriteriaObj } from "@util/weight-criteria.ts"

export interface AttributePrereqObj {
	type: prereq.Type.Attribute
	has: boolean
	which: string
	combined_with?: string
	qualifier?: NumericCriteriaObj
}

export interface ContainedQuantityPrereqObj {
	type: prereq.Type.ContainedQuantity
	has: boolean
	qualifier?: NumericCriteriaObj
}

export interface ContainedWeightPrereqObj {
	type: prereq.Type.ContainedWeight
	has: boolean
	qualifier?: WeightCriteriaObj
}
export interface EquippedEquipmentPrereqObj {
	type: prereq.Type.EquippedEquipment
	name?: StringCriteriaObj
}

export interface PrereqListObj {
	type: prereq.Type.List
	all: boolean
	when_tl?: NumericCriteriaObj
	prereqs?: PrereqObj[]
}
export interface SkillPrereqObj {
	type: prereq.Type.Skill
	has: boolean
	name?: StringCriteriaObj
	level?: NumericCriteriaObj
	specialization?: StringCriteriaObj
}
export interface SpellPrereqObj {
	type: prereq.Type.Spell
	has: boolean
	sub_type: spellcmp.Type
	qualifier?: StringCriteriaObj
	quantity?: NumericCriteriaObj
}
export interface TraitPrereqObj {
	type: prereq.Type.Trait
	has: boolean
	name?: StringCriteriaObj
	level?: NumericCriteriaObj
	notes?: StringCriteriaObj
}

export type PrereqObj =
	| PrereqListObj
	| TraitPrereqObj
	| AttributePrereqObj
	| ContainedQuantityPrereqObj
	| ContainedWeightPrereqObj
	| EquippedEquipmentPrereqObj
	| SkillPrereqObj
	| SpellPrereqObj
