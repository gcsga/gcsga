import { prereq } from "@util/enum/prereq.ts"
import { spellcmp } from "@util/enum/spellcmp.ts"
import { NumericCriteria } from "@util/numeric_criteria.ts"
import { StringCriteria } from "@util/string_criteria.ts"
import { WeightCriteria } from "@util/weight_criteria.ts"

export interface AttributePrereqObj extends BasePrereqObj {
	which: string
	combined_with: string
	qualifier: NumericCriteria
}
export interface BasePrereqObj {
	type: prereq.Type
	has: boolean
}

export interface ContainedQuantityPrereqObj extends BasePrereqObj {
	qualifier: NumericCriteria
}

export interface ContainedWeightPrereqObj extends BasePrereqObj {
	qualifier: WeightCriteria
}
export interface EquippedEquipmentPrereqObj extends BasePrereqObj {
	name: StringCriteria
}

export interface PrereqListObj {
	type: prereq.Type
	all: boolean
	when_tl: NumericCriteria
	prereqs: (BasePrereqObj | PrereqListObj)[]
}
export interface SkillPrereqObj extends BasePrereqObj {
	name: StringCriteria
	level: NumericCriteria
	specialization: StringCriteria
}
export interface SpellPrereqObj extends BasePrereqObj {
	sub_type: spellcmp.Type
	qualifier: StringCriteria
	quantity: NumericCriteria
}
export interface TraitPrereqObj extends BasePrereqObj {
	name: StringCriteria
	level: NumericCriteria
	notes: StringCriteria
}
