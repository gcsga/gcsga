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

export type BaseFeatureSchema = {
	type: fields.StringField<feature.Type, feature.Type, true, false, true>
	amount: fields.NumberField<number, number, true, false>
	per_level: fields.BooleanField
	effective: fields.BooleanField<boolean, boolean, false>
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
	name: fields.SchemaField<StringCriteriaSchema>
	specialization: fields.SchemaField<StringCriteriaSchema>
	tags: fields.SchemaField<StringCriteriaSchema>
}

export type SkillPointBonusSchema = BaseFeatureSchema & {
	name: fields.SchemaField<StringCriteriaSchema>
	specialization: fields.SchemaField<StringCriteriaSchema>
	tags: fields.SchemaField<StringCriteriaSchema>
}

export type SpellBonusSchema = BaseFeatureSchema & {
	match: fields.StringField<spellmatch.Type>
	name: fields.SchemaField<StringCriteriaSchema>
	tags: fields.SchemaField<StringCriteriaSchema>
}

export type SpellPointBonusSchema = BaseFeatureSchema & {
	match: fields.StringField<spellmatch.Type>
	name: fields.SchemaField<StringCriteriaSchema>
	tags: fields.SchemaField<StringCriteriaSchema>
}

export type WeaponBonusSchema = BaseFeatureSchema & {
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
	| BaseFeatureSchema
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
