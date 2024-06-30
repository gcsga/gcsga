import fields = foundry.data.fields
import { AbstractAttributeDefSchema, AbstractAttributeSchema } from "@system"

enum MoveTypeOverrideConditionType {
	Trait = "trait",
	Skill = "skill",
	Condition = "condition",
}

const allMoveTypeOverrideConditions: MoveTypeOverrideConditionType[] = [
	MoveTypeOverrideConditionType.Trait,
	MoveTypeOverrideConditionType.Skill,
	MoveTypeOverrideConditionType.Condition,
]

type MoveTypeSchema = AbstractAttributeSchema & {
	adj: fields.NumberField<number, number, true, false, true>
}

type MoveTypeDefSchema = AbstractAttributeDefSchema & {
	name: fields.StringField
	cost_per_point: fields.NumberField
	overrides: fields.ArrayField<fields.SchemaField<MoveTypeOverrideSchema>>
	order: fields.NumberField
}

type MoveTypeOverrideSchema = {
	condition: fields.SchemaField<{
		type: fields.StringField<
			MoveTypeOverrideConditionType,
			MoveTypeOverrideConditionType,
			true,
			false,
			true
		>
		qualifier: fields.StringField
	}>
	base: fields.StringField
}

export { MoveTypeOverrideConditionType, allMoveTypeOverrideConditions }
export type { MoveTypeDefSchema, MoveTypeOverrideSchema, MoveTypeSchema }

