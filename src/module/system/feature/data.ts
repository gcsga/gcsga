import { NullField } from "@system/schema-data-fields.ts"
import { feature } from "@util/enum/feature.ts"
import { skillsel } from "@util/enum/skillsel.ts"
import { spellmatch } from "@util/enum/spellmatch.ts"
import { stlimit } from "@util/enum/stlimit.ts"
import { wsel } from "@util/enum/wsel.ts"
import { wswitch } from "@util/enum/wswitch.ts"
import { NumericCriteriaSchema } from "@util/numeric-criteria.ts"
import { StringCriteriaSchema } from "@util/string-criteria.ts"
import fields = foundry.data.fields


export enum MoveBonusType {
	Base = "base",
	Enhanced = "enhanced",
}

// export type BaseFeatureSchema<TType extends feature.Type> = {
// 	type: fields.StringField<TType>
// }

export type BaseFeatureSchema = LeveledAmountSchema & {
	type: fields.StringField<feature.Type, feature.Type, true, false, true>
}

export type LeveledAmountSchema = {
	amount: fields.NumberField<number, number, true, false>
	per_level: fields.BooleanField
	effective: fields.BooleanField
}

export type WeaponLeveledAmountSchema = {
	amount: fields.NumberField
	leveled: fields.BooleanField
	per_die: fields.BooleanField
	effective: fields.BooleanField
}


export type AttributeBonusSchema = LeveledAmountSchema & BaseFeatureSchema & {
	limitation: fields.StringField<stlimit.Option>
	attribute: fields.StringField
}

export type ConditionalModifierBonusSchema = LeveledAmountSchema & BaseFeatureSchema & {
	situation: fields.StringField
}

export type ContainedWeightReductionSchema = BaseFeatureSchema & {
	reduction: fields.StringField
}

export type CostReductionSchema = BaseFeatureSchema & {
	attribute: fields.StringField
	percentage: fields.NumberField
}

export type DRBonusSchema = LeveledAmountSchema & BaseFeatureSchema & {
	location: fields.StringField
	specialization: fields.StringField
}

export type MoveBonusSchema = LeveledAmountSchema & BaseFeatureSchema & {
	move_type: fields.StringField
	limitation: fields.StringField<MoveBonusType>
}

export type ReactionBonusSchema = LeveledAmountSchema & BaseFeatureSchema & {
	situation: fields.StringField
}

export type SkillBonusSchema = LeveledAmountSchema & BaseFeatureSchema & {
	selection_type: fields.StringField<skillsel.Type>
	name: fields.SchemaField<StringCriteriaSchema>
	specialization: fields.SchemaField<StringCriteriaSchema>
	tags: fields.SchemaField<StringCriteriaSchema>
}

export type SkillPointBonusSchema = LeveledAmountSchema & BaseFeatureSchema & {
	name: fields.SchemaField<StringCriteriaSchema>
	specialization: fields.SchemaField<StringCriteriaSchema>
	tags: fields.SchemaField<StringCriteriaSchema>
}

export type SpellBonusSchema = LeveledAmountSchema & BaseFeatureSchema & {
	match: fields.StringField<spellmatch.Type>
	name: fields.SchemaField<StringCriteriaSchema>
	tags: fields.SchemaField<StringCriteriaSchema>
}

export type SpellPointBonusSchema = LeveledAmountSchema & BaseFeatureSchema & {
	match: fields.StringField<spellmatch.Type>
	name: fields.SchemaField<StringCriteriaSchema>
	tags: fields.SchemaField<StringCriteriaSchema>
}

export type WeaponBonusSchema = WeaponLeveledAmountSchema & {
	type: fields.StringField<feature.WeaponBonusType>
	percent: fields.BooleanField | NullField
	switch_type_value: fields.BooleanField | NullField
	selection_type: fields.StringField<wsel.Type>
	switch_type: fields.StringField<wswitch.Type> | NullField
	name: fields.SchemaField<StringCriteriaSchema> | NullField
	specialization: fields.SchemaField<StringCriteriaSchema> | NullField
	level: fields.SchemaField<NumericCriteriaSchema> | NullField
	usage: fields.SchemaField<StringCriteriaSchema> | NullField
	tags: fields.SchemaField<StringCriteriaSchema> | NullField
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
