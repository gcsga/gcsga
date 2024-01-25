import { feature } from "@util/enum/feature.ts"
import { skillsel } from "@util/enum/skillsel.ts"
import { spellmatch } from "@util/enum/spellmatch.ts"
import { stlimit } from "@util/enum/stlimit.ts"
import { wsel } from "@util/enum/wsel.ts"
import { wswitch } from "@util/enum/wswitch.ts"
import { NumericCriteria } from "@util/numeric_criteria.ts"
import { StringCriteria } from "@util/string_criteria.ts"

export interface AttributeBonusObj extends LeveledAmountObj {
	limitation?: stlimit.Option
	attribute: string
}

export interface ConditionalModifierBonusObj extends LeveledAmountObj {
	situation: string
}

export interface ContainedWeightReductionObj {
	reduction: string
}

export interface CostReductionObj {
	type: feature.Type
	attribute: string
	percentage?: number
}

export interface DRBonusObj extends LeveledAmountObj {
	location: string
	specialization?: string
}

export interface LeveledAmountObj {
	type: feature.Type
	amount: number
	per_level: boolean
	effective: boolean
}

export enum MoveBonusType {
	Base = "base",
	Enhanced = "enhanced",
}
export interface MoveBonusObj extends LeveledAmountObj {
	move_type: string
	limitation: MoveBonusType
}
export interface ReactionBonusObj extends LeveledAmountObj {
	situation: string
}
export interface SkillBonusObj extends LeveledAmountObj {
	selection_type: skillsel.Type
	name?: StringCriteria
	specialization?: StringCriteria
	tags?: StringCriteria
}
export interface SkillPointBonusObj extends LeveledAmountObj {
	name?: StringCriteria
	specialization?: StringCriteria
	tags?: StringCriteria
}
export interface SpellBonusObj extends LeveledAmountObj {
	match: spellmatch.Type
	name: StringCriteria
	tags: StringCriteria
}
export interface SpellPointBonusObj extends LeveledAmountObj {
	match: spellmatch.Type
	name: StringCriteria
	tags: StringCriteria
}
export interface WeaponBonusObj extends WeaponLeveledAmountObj {
	type: feature.WeaponBonusType
	percent?: boolean
	switch_type_value?: boolean
	selection_type: wsel.Type
	switch_type?: wswitch.Type
	name?: StringCriteria
	specialization?: StringCriteria
	level?: NumericCriteria
	usage?: StringCriteria
	tags?: StringCriteria
}
export interface WeaponLeveledAmountObj {
	amount: number
	leveled: boolean
	per_die: boolean
}
