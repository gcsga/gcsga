import { prereq } from "@util/enum/prereq.ts"
import { spellcmp } from "@util/enum/spellcmp.ts"
import { NumericCriteriaObj } from "@util/numeric-criteria.ts"
import { StringCriteriaObj } from "@util/string-criteria.ts"
import { WeightCriteriaObj } from "@util/weight-criteria.ts"

export interface BasePrereqObj<TType extends prereq.Type> {
	type: TType
}

export interface AttributePrereqObj extends BasePrereqObj<prereq.Type.Attribute> {
	has: boolean
	which: string
	combined_with?: string
	qualifier?: NumericCriteriaObj
}

export interface ContainedQuantityPrereqObj extends BasePrereqObj<prereq.Type.ContainedQuantity> {
	has: boolean
	qualifier?: NumericCriteriaObj
}

export interface ContainedWeightPrereqObj extends BasePrereqObj<prereq.Type.ContainedWeight> {
	has: boolean
	qualifier?: WeightCriteriaObj
}
export interface EquippedEquipmentPrereqObj extends BasePrereqObj<prereq.Type.EquippedEquipment> {
	name?: StringCriteriaObj
}

export interface PrereqListObj extends BasePrereqObj<prereq.Type.List> {
	all: boolean
	when_tl?: NumericCriteriaObj
	prereqs?: PrereqObj[]
}
export interface SkillPrereqObj extends BasePrereqObj<prereq.Type.Skill> {
	has: boolean
	name?: StringCriteriaObj
	level?: NumericCriteriaObj
	specialization?: StringCriteriaObj
}
export interface SpellPrereqObj extends BasePrereqObj<prereq.Type.Spell> {
	has: boolean
	sub_type: spellcmp.Type
	qualifier?: StringCriteriaObj
	quantity?: NumericCriteriaObj
}
export interface TraitPrereqObj extends BasePrereqObj<prereq.Type.Trait> {
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
