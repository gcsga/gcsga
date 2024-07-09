import fields = foundry.data.fields
import { gid } from "@module/data/constants.ts"
import { AbstractAttributeDefSchema, AbstractAttributeSchema } from "@system/abstract-attribute/data.ts"
import { attribute } from "@util/enum/attribute.ts"

enum ThresholdOp {
	HalveMove = "halve_move",
	HalveDodge = "halve_dodge",
	HalveST = "halve_st",
}

const RESERVED_IDS: string[] = [gid.Skill, gid.Parry, gid.Block, gid.Dodge, gid.SizeModifier, gid.Ten]

type AttributeSchema = AbstractAttributeSchema & {
	adj: fields.NumberField<number, number, true, false, true>
	damage: fields.NumberField<number, number, true, true, true>
	// attribute_def: fields.SchemaField<AttributeDefSchema>
	apply_ops: fields.BooleanField<boolean, boolean, false, true, true>
}

type AttributeDefSchema = AbstractAttributeDefSchema & {
	type: fields.StringField<attribute.Type, attribute.Type, true>
	name: fields.StringField
	full_name: fields.StringField
	cost_per_point: fields.NumberField
	cost_adj_percent_per_sm: fields.NumberField
	thresholds: fields.ArrayField<fields.SchemaField<PoolThresholdSchema>>
	order: fields.NumberField
}

type PoolThresholdSchema = {
	state: fields.StringField
	explanation: fields.StringField
	expression: fields.StringField
	ops: fields.ArrayField<fields.StringField<ThresholdOp>>
}

export { RESERVED_IDS, ThresholdOp }
export type { AttributeSchema, AttributeDefSchema, PoolThresholdSchema }
