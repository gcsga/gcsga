import { feature, skillsel, spellmatch, stlimit, wsel, wswitch } from "@util"
import fields = foundry.data.fields
import { NumericCriteria } from "@module/util/numeric-criteria.ts"
import { StringCriteria } from "@module/util/string-criteria.ts"

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
	name: fields.EmbeddedDataField<StringCriteria>
	specialization: fields.EmbeddedDataField<StringCriteria>
	tags: fields.EmbeddedDataField<StringCriteria>
}

export type SkillPointBonusSchema = BaseFeatureSchema & {
	name: fields.EmbeddedDataField<StringCriteria>
	specialization: fields.EmbeddedDataField<StringCriteria>
	tags: fields.EmbeddedDataField<StringCriteria>
}

export type SpellBonusSchema = BaseFeatureSchema & {
	match: fields.StringField<spellmatch.Type>
	name: fields.EmbeddedDataField<StringCriteria>
	tags: fields.EmbeddedDataField<StringCriteria>
}

export type SpellPointBonusSchema = BaseFeatureSchema & {
	match: fields.StringField<spellmatch.Type>
	name: fields.EmbeddedDataField<StringCriteria>
	tags: fields.EmbeddedDataField<StringCriteria>
}

export type WeaponBonusSchema = BaseFeatureSchema & {
	percent: fields.BooleanField<boolean, boolean, true, true>
	switch_type: fields.StringField<wswitch.Type, wswitch.Type, true, true>
	switch_type_value: fields.BooleanField<boolean, boolean, true, true>
	selection_type: fields.StringField<wsel.Type>
	name: fields.EmbeddedDataField<StringCriteria, true, true, true>
	specialization: fields.EmbeddedDataField<StringCriteria, true, true, true>
	level: fields.EmbeddedDataField<NumericCriteria, true, true, true>
	usage: fields.EmbeddedDataField<StringCriteria, true, true, true>
	tags: fields.EmbeddedDataField<StringCriteria, true, true, true>
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
