import { feature } from "@util/enum/feature.ts"
import { skillsel } from "@util/enum/skillsel.ts"
import { spellmatch } from "@util/enum/spellmatch.ts"
import { stlimit } from "@util/enum/stlimit.ts"
import { wsel } from "@util/enum/wsel.ts"
import { wswitch } from "@util/enum/wswitch.ts"
import { NumericCriteriaObj, NumericCriteriaSchema } from "@util/numeric-criteria.ts"
import { StringCriteriaObj, StringCriteriaSchema } from "@util/string-criteria.ts"

import fields = foundry.data.fields


export enum MoveBonusType {
	Base = "base",
	Enhanced = "enhanced",
}

export type BaseFeatureSchema<TType extends feature.Type> = {
	type: fields.StringField<TType>
}

export type LeveledAmountSchema = {
	amount: fields.NumberField
	per_level: fields.BooleanField
	effective: fields.BooleanField
}

export type WeaponLeveledAmountSchema = {
	amount: fields.NumberField
	leveled: fields.BooleanField
	per_die: fields.BooleanField
	effective: fields.BooleanField
}


export type AttributeBonusSchema = LeveledAmountSchema & BaseFeatureSchema<feature.Type.AttributeBonus> & {
	limitation: fields.StringField<stlimit.Option>
	attribute: fields.StringField
}

export type ConditionalModifierBonusSchema = LeveledAmountSchema & BaseFeatureSchema<feature.Type.ConditionalModifierBonus> & {
	situation: fields.StringField
}

export type ContainedWeightReductionSchema = BaseFeatureSchema<feature.Type.ConditionalModifierBonus> & {
	reduction: fields.StringField
}

export type CostReductionSchema = BaseFeatureSchema<feature.Type.CostReduction> & {
	attribute: fields.StringField
	percentage: fields.NumberField
}

export type DRBonusSchema = LeveledAmountSchema & BaseFeatureSchema<feature.Type.DRBonus> & {
	location: fields.StringField
	specialization: fields.StringField
}

export type MoveBonusSchema = LeveledAmountSchema & BaseFeatureSchema<feature.Type.MoveBonus> & {
	move_type: fields.StringField
	limitation: fields.StringField<MoveBonusType>
}

export type ReactionBonusSchema = LeveledAmountSchema & BaseFeatureSchema<feature.Type.ReactionBonus> & {
	situation: fields.StringField
}

export type SkillBonusSchema = LeveledAmountSchema & BaseFeatureSchema<feature.Type.SkillBonus> & {
	selection_type: fields.StringField<skillsel.Type>
	name: StringCriteriaSchema
	specialization: StringCriteriaSchema
	tags: StringCriteriaSchema
}

export type SkillPointBonusSchema = LeveledAmountSchema & BaseFeatureSchema<feature.Type.SkillPointBonus> & {
	name: StringCriteriaSchema
	specialization: StringCriteriaSchema
	tags: StringCriteriaSchema
}

export type SpellBonusSchema = LeveledAmountSchema & BaseFeatureSchema<feature.Type.SpellBonus> & {
	match: fields.StringField<spellmatch.Type>
	name: StringCriteriaSchema
	tags: StringCriteriaSchema
}

export type SpellPointBonusSchema = LeveledAmountSchema & BaseFeatureSchema<feature.Type.SpellPointBonus> & {
	match: fields.StringField<spellmatch.Type>
	name: StringCriteriaSchema
	tags: StringCriteriaSchema
}

export type WeaponBonusSchema = WeaponLeveledAmountSchema & {
	type: fields.StringField<feature.WeaponBonusType>
	percent: fields.BooleanField
	switch_type_value: fields.BooleanField
	selection_type: fields.StringField<wsel.Type>
	switch_type: fields.StringField<wswitch.Type>
	name: StringCriteriaSchema
	specialization: StringCriteriaSchema
	level: NumericCriteriaSchema
	usage: StringCriteriaSchema
	tags: StringCriteriaSchema
}

export type FeatureSchema =
	| AttributeBonusSchema
	| ConditionalModifierBonusSchema
	| ContainedWeightReductionSchema
	| CostReductionSchema
	| DRBonusSchema
	| MoveBonusSchema
	| ReactionBonusSchema
	| SkillBonusSchema
	| SkillPointBonusSchema
	| SpellBonusSchema
	| SpellPointBonusSchema
	| WeaponBonusSchema

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
