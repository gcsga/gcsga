import { feature } from "@util/enum/feature.ts"
import { skillsel } from "@util/enum/skillsel.ts"
import { spellmatch } from "@util/enum/spellmatch.ts"
import { stlimit } from "@util/enum/stlimit.ts"
import { wsel } from "@util/enum/wsel.ts"
import { wswitch } from "@util/enum/wswitch.ts"
import { NumericCriteriaObj } from "@util/numeric-criteria.ts"
import { StringCriteriaObj } from "@util/string-criteria.ts"

export interface BaseFeatureObj<TType extends feature.Type> {
	type: TType
}

export interface AttributeBonusObj extends LeveledAmountObj, BaseFeatureObj<feature.Type.AttributeBonus> {
	limitation?: stlimit.Option
	attribute: string
}

export interface ConditionalModifierBonusObj
	extends LeveledAmountObj,
		BaseFeatureObj<feature.Type.ConditionalModifierBonus> {
	situation: string
}

export interface ContainedWeightReductionObj extends BaseFeatureObj<feature.Type.ContainedWeightReduction> {
	reduction: string
}

export interface CostReductionObj extends BaseFeatureObj<feature.Type.CostReduction> {
	attribute?: string
	percentage?: number
}

export interface DRBonusObj extends LeveledAmountObj, BaseFeatureObj<feature.Type.DRBonus> {
	location: string
	specialization?: string
}

export interface LeveledAmountObj {
	amount: number
	per_level?: boolean
	effective?: boolean
}

export enum MoveBonusType {
	Base = "base",
	Enhanced = "enhanced",
}
export interface MoveBonusObj extends LeveledAmountObj, BaseFeatureObj<feature.Type.MoveBonus> {
	move_type: string
	limitation: MoveBonusType
}
export interface ReactionBonusObj extends LeveledAmountObj, BaseFeatureObj<feature.Type.ReactionBonus> {
	situation: string
}
export interface SkillBonusObj extends LeveledAmountObj, BaseFeatureObj<feature.Type.SkillBonus> {
	selection_type: skillsel.Type
	name?: StringCriteriaObj
	specialization?: StringCriteriaObj
	tags?: StringCriteriaObj
}
export interface SkillPointBonusObj extends LeveledAmountObj, BaseFeatureObj<feature.Type.SkillPointBonus> {
	name?: StringCriteriaObj
	specialization?: StringCriteriaObj
	tags?: StringCriteriaObj
}
export interface SpellBonusObj extends LeveledAmountObj, BaseFeatureObj<feature.Type.SpellBonus> {
	match: spellmatch.Type
	name?: StringCriteriaObj
	tags?: StringCriteriaObj
}
export interface SpellPointBonusObj extends LeveledAmountObj, BaseFeatureObj<feature.Type.SpellPointBonus> {
	match: spellmatch.Type
	name?: StringCriteriaObj
	tags?: StringCriteriaObj
}
export interface WeaponBonusObj<TType extends feature.WeaponBonusType>
	extends WeaponLeveledAmountObj,
		BaseFeatureObj<TType> {
	percent?: boolean
	switch_type_value?: boolean
	selection_type: wsel.Type
	switch_type?: wswitch.Type
	name?: StringCriteriaObj
	specialization?: StringCriteriaObj
	level?: NumericCriteriaObj
	usage?: StringCriteriaObj
	tags?: StringCriteriaObj
}

export interface WeaponLeveledAmountObj {
	amount: number
	leveled?: boolean
	per_die?: boolean
}
