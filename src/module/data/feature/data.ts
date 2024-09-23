import { feature, skillsel, spellmatch, stlimit, wsel, wswitch } from "@util"
import fields = foundry.data.fields
import { NumericCriteriaField } from "../item/fields/numeric-criteria-field.ts"
import { StringCriteriaField } from "../item/fields/string-criteria-field.ts"

export enum MoveBonusType {
	Base = "base",
	Enhanced = "enhanced",
}

export type BaseFeatureSchema = {
	type: fields.StringField<feature.Type, feature.Type, true>
	amount: fields.NumberField<number, number, true, false>
	per_level: fields.BooleanField
	temporary: fields.BooleanField<boolean, boolean, true, false, true>
}
export type AttributeBonusSchema = BaseFeatureSchema & {
	limitation: fields.StringField<stlimit.Option>
	attribute: fields.StringField
}

export type ConditionalModifierBonusSchema = BaseFeatureSchema & {
	situation: fields.StringField
}

export type ContainedWeightReductionSchema = BaseFeatureSchema & {
	reduction: fields.StringField
}

export type CostReductionSchema = BaseFeatureSchema & {
	attribute: fields.StringField
	percentage: fields.NumberField
}

export type DRBonusSchema = BaseFeatureSchema & {
	locations: fields.ArrayField<fields.StringField>
	specialization: fields.StringField
}

export type MoveBonusSchema = BaseFeatureSchema & {
	move_type: fields.StringField
	limitation: fields.StringField<MoveBonusType>
}

export type ReactionBonusSchema = BaseFeatureSchema & {
	situation: fields.StringField
}

export type SkillBonusSchema = BaseFeatureSchema & {
	selection_type: fields.StringField<skillsel.Type>
	name: StringCriteriaField<true, false, true>
	specialization: StringCriteriaField<true, false, true>
	tags: StringCriteriaField<true, false, true>
}

export type SkillPointBonusSchema = BaseFeatureSchema & {
	name: StringCriteriaField<true, false, true>
	specialization: StringCriteriaField<true, false, true>
	tags: StringCriteriaField<true, false, true>
}

export type SpellBonusSchema = BaseFeatureSchema & {
	match: fields.StringField<spellmatch.Type>
	name: StringCriteriaField<true, false, true>
	tags: StringCriteriaField<true, false, true>
}

export type SpellPointBonusSchema = BaseFeatureSchema & {
	match: fields.StringField<spellmatch.Type>
	name: StringCriteriaField<true, false, true>
	tags: StringCriteriaField<true, false, true>
}

export type WeaponBonusSchema = BaseFeatureSchema & {
	percent: fields.BooleanField<boolean, boolean, true, true>
	switch_type: fields.StringField<wswitch.Type, wswitch.Type, true, true>
	switch_type_value: fields.BooleanField<boolean, boolean, true, true>
	selection_type: fields.StringField<wsel.Type>
	name: StringCriteriaField<true, false, true>
	specialization: StringCriteriaField<true, false, true>
	level: NumericCriteriaField<true, false, true>
	usage: StringCriteriaField<true, false, true>
	tags: StringCriteriaField<true, false, true>
	amount: fields.NumberField<number, number, true, false>
	leveled: fields.BooleanField
	per_die: fields.BooleanField
	effective: fields.BooleanField<boolean, boolean, false>
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
