import { feature } from "@util/enum/feature.ts"
import { skillsel } from "@util/enum/skillsel.ts"
import { spellmatch } from "@util/enum/spellmatch.ts"
import { stlimit } from "@util/enum/stlimit.ts"
import { wsel } from "@util/enum/wsel.ts"
import { wswitch } from "@util/enum/wswitch.ts"
import fields = foundry.data.fields
import type { NumericCriteriaSchema, StringCriteriaSchema } from "@module/util/data.ts"

export enum MoveBonusType {
	Base = "base",
	Enhanced = "enhanced",
}

// export type BaseFeatureSchema<TType extends feature.Type> = {
// 	type: fields.StringField<TType>
// }

export type BaseFeatureSchema<TType extends feature.Type> = {
	type: fields.StringField<TType, TType, true>
	amount: fields.NumberField<number, number, true, false>
	per_level: fields.BooleanField
	temporary: fields.BooleanField<boolean, boolean, true, false, true>
}

// export type LeveledAmountSchema = {
// 	amount: fields.NumberField<number, number, true, false>
// 	per_level: fields.BooleanField
// 	effective: fields.BooleanField<boolean, boolean, false>
// }

// export type WeaponLeveledAmountSchema = {
// 	amount: fields.NumberField<number, number, true, false>
// 	leveled: fields.BooleanField
// 	per_die: fields.BooleanField
// 	effective: fields.BooleanField<boolean, boolean, false>
// }

export type AttributeBonusSchema = BaseFeatureSchema<feature.Type.AttributeBonus> & {
	limitation: fields.StringField<stlimit.Option>
	attribute: fields.StringField
}

export type ConditionalModifierBonusSchema = BaseFeatureSchema<feature.Type.ConditionalModifierBonus> & {
	situation: fields.StringField
}

export type ContainedWeightReductionSchema = BaseFeatureSchema<feature.Type.ContainedWeightReduction> & {
	reduction: fields.StringField
}

export type CostReductionSchema = BaseFeatureSchema<feature.Type.CostReduction> & {
	attribute: fields.StringField
	percentage: fields.NumberField
}

export type DRBonusSchema = BaseFeatureSchema<feature.Type.DRBonus> & {
	locations: fields.ArrayField<fields.StringField>
	specialization: fields.StringField
}

export type MoveBonusSchema = BaseFeatureSchema<feature.Type.MoveBonus> & {
	move_type: fields.StringField
	limitation: fields.StringField<MoveBonusType>
}

export type ReactionBonusSchema = BaseFeatureSchema<feature.Type.ReactionBonus> & {
	situation: fields.StringField
}

export type SkillBonusSchema = BaseFeatureSchema<feature.Type.SkillBonus> & {
	selection_type: fields.StringField<skillsel.Type>
	name: fields.SchemaField<StringCriteriaSchema>
	specialization: fields.SchemaField<StringCriteriaSchema>
	tags: fields.SchemaField<StringCriteriaSchema>
}

export type SkillPointBonusSchema = BaseFeatureSchema<feature.Type.SkillPointBonus> & {
	name: fields.SchemaField<StringCriteriaSchema>
	specialization: fields.SchemaField<StringCriteriaSchema>
	tags: fields.SchemaField<StringCriteriaSchema>
}

export type SpellBonusSchema = BaseFeatureSchema<feature.Type.SpellBonus> & {
	match: fields.StringField<spellmatch.Type>
	name: fields.SchemaField<StringCriteriaSchema>
	tags: fields.SchemaField<StringCriteriaSchema>
}

export type SpellPointBonusSchema = BaseFeatureSchema<feature.Type.SpellPointBonus> & {
	match: fields.StringField<spellmatch.Type>
	name: fields.SchemaField<StringCriteriaSchema>
	tags: fields.SchemaField<StringCriteriaSchema>
}

export type WeaponBonusSchema = BaseFeatureSchema<feature.WeaponBonusType> & {
	percent: fields.BooleanField<boolean, boolean, true, true>
	switch_type: fields.StringField<wswitch.Type, wswitch.Type, true, true>
	switch_type_value: fields.BooleanField<boolean, boolean, true, true>
	selection_type: fields.StringField<wsel.Type>
	name: fields.SchemaField<
		StringCriteriaSchema,
		SourceFromSchema<StringCriteriaSchema>,
		NonNullable<ModelPropsFromSchema<StringCriteriaSchema>>,
		true,
		true
	>
	specialization: fields.SchemaField<
		StringCriteriaSchema,
		SourceFromSchema<StringCriteriaSchema>,
		NonNullable<ModelPropsFromSchema<StringCriteriaSchema>>,
		true,
		true
	>
	level: fields.SchemaField<
		NumericCriteriaSchema,
		SourceFromSchema<NumericCriteriaSchema>,
		NonNullable<ModelPropsFromSchema<NumericCriteriaSchema>>,
		true,
		true
	>
	usage: fields.SchemaField<
		StringCriteriaSchema,
		SourceFromSchema<StringCriteriaSchema>,
		NonNullable<ModelPropsFromSchema<StringCriteriaSchema>>,
		true,
		true
	>
	tags: fields.SchemaField<
		StringCriteriaSchema,
		SourceFromSchema<StringCriteriaSchema>,
		NonNullable<ModelPropsFromSchema<StringCriteriaSchema>>,
		true,
		true
	>
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
