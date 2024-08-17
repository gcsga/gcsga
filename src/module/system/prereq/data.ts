import { prereq } from "@util/enum/prereq.ts"
import { spellcmp } from "@util/enum/spellcmp.ts"
import fields = foundry.data.fields
import { NumericCriteriaSchema, StringCriteriaSchema, WeightCriteriaSchema } from "@module/util/data.ts"
import type { ItemGURPS } from "@item"
import { ItemType } from "@module/data/constants.ts"

export const ValidPrereqParentTypes = Object.freeze([
	ItemType.Trait,
	ItemType.TraitContainer,
	ItemType.Skill,
	ItemType.Technique,
	ItemType.Spell,
	ItemType.RitualMagicSpell,
	ItemType.Equipment,
	ItemType.EquipmentContainer,
])

export interface PrereqConstructionOptions extends DocumentConstructionContext<ItemGURPS> {}

export type BasePrereqSchema<TType extends prereq.Type> = {
	id: fields.StringField<string, string, true>
	type: fields.StringField<TType, TType, true>
}

export type AttributePrereqSchema = BasePrereqSchema<prereq.Type.Attribute> & {
	has: fields.BooleanField
	which: fields.StringField
	combined_with: fields.StringField
	qualifier: fields.SchemaField<NumericCriteriaSchema>
}

export type ContainedQuantityPrereqSchema = BasePrereqSchema<prereq.Type.ContainedQuantity> & {
	has: fields.BooleanField
	qualifier: fields.SchemaField<NumericCriteriaSchema>
}

export type ContainedWeightPrereqSchema = BasePrereqSchema<prereq.Type.ContainedWeight> & {
	has: fields.BooleanField
	qualifier: fields.SchemaField<WeightCriteriaSchema>
}

export type EquippedEquipmentPrereqSchema = BasePrereqSchema<prereq.Type.EquippedEquipment> & {
	name: fields.SchemaField<StringCriteriaSchema>
	tags: fields.SchemaField<StringCriteriaSchema>
}

export type PrereqListSchema = BasePrereqSchema<prereq.Type.List> & {
	all: fields.BooleanField<boolean, boolean, true, false, true>
	when_tl: fields.SchemaField<
		NumericCriteriaSchema,
		SourceFromSchema<NumericCriteriaSchema>,
		ModelPropsFromSchema<NumericCriteriaSchema>,
		false
	>
	prereqs: fields.ArrayField<fields.StringField<string, string, true, false, true>>
}

export type SkillPrereqSchema = BasePrereqSchema<prereq.Type.Skill> & {
	has: fields.BooleanField
	name: fields.SchemaField<StringCriteriaSchema>
	level: fields.SchemaField<NumericCriteriaSchema>
	specialization: fields.SchemaField<StringCriteriaSchema>
}

export type SpellPrereqSchema = BasePrereqSchema<prereq.Type.Spell> & {
	has: fields.BooleanField
	sub_type: fields.StringField<spellcmp.Type>
	qualifier: fields.SchemaField<StringCriteriaSchema>
	quantity: fields.SchemaField<NumericCriteriaSchema>
}

export type TraitPrereqSchema = BasePrereqSchema<prereq.Type.Trait> & {
	has: fields.BooleanField
	name: fields.SchemaField<StringCriteriaSchema>
	level: fields.SchemaField<NumericCriteriaSchema>
	notes: fields.SchemaField<StringCriteriaSchema>
}

export type PrereqSchema =
	| BasePrereqSchema<prereq.Type>
	| PrereqListSchema
	| TraitPrereqSchema
	| AttributePrereqSchema
	| ContainedQuantityPrereqSchema
	| ContainedWeightPrereqSchema
	| EquippedEquipmentPrereqSchema
	| SkillPrereqSchema
	| SpellPrereqSchema
