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

export type BaseFeatureSchema<TType extends feature.Type> = {
	type: fields.StringField<TType>
}

export type BonusOwnerSchema<TType extends feature.Type> = {
	type: fields.StringField<TType, TType, true, false, true>
	amount: fields.NumberField
	per_level: fields.BooleanField
	effective: fields.BooleanField
	// effective: fields.NumberField
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

export type ContainedWeightReductionSchema = BaseFeatureSchema<feature.Type.ContainedWeightReduction> & {
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
	name: fields.SchemaField<StringCriteriaSchema>
	specialization: fields.SchemaField<StringCriteriaSchema>
	tags: fields.SchemaField<StringCriteriaSchema>
}

export type SkillPointBonusSchema = LeveledAmountSchema & BaseFeatureSchema<feature.Type.SkillPointBonus> & {
	name: fields.SchemaField<StringCriteriaSchema>
	specialization: fields.SchemaField<StringCriteriaSchema>
	tags: fields.SchemaField<StringCriteriaSchema>
}

export type SpellBonusSchema = LeveledAmountSchema & BaseFeatureSchema<feature.Type.SpellBonus> & {
	match: fields.StringField<spellmatch.Type>
	name: fields.SchemaField<StringCriteriaSchema>
	tags: fields.SchemaField<StringCriteriaSchema>
}

export type SpellPointBonusSchema = LeveledAmountSchema & BaseFeatureSchema<feature.Type.SpellPointBonus> & {
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
