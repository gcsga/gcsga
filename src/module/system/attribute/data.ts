import fields = foundry.data.fields
import { gid } from "@module/data/constants.ts"
import { AbstractAttributeDefSchema, AbstractAttributeSchema } from "@system/abstract-attribute/data.ts"
import { threshold } from "@util"
import { attribute } from "@util/enum/attribute.ts"

const RESERVED_IDS: string[] = [gid.Skill, gid.Parry, gid.Block, gid.Dodge, gid.SizeModifier, gid.Ten]

type AttributeSchema = AbstractAttributeSchema & {
	adj: fields.NumberField<number, number, true, false, true>
	damage: fields.NumberField<number, number, true, true, true>
	applyOps: fields.BooleanField<boolean, boolean, true, true, true>
	manualThreshold: fields.NumberField<number, number, true, true, true>
}

type AttributeDefSchema = AbstractAttributeDefSchema & {
	type: fields.StringField<attribute.Type, attribute.Type, true>
	name: fields.StringField<string, string, true, false, true>
	full_name: fields.StringField<string, string, true, false, true>
	cost_per_point: fields.NumberField<number, number, true, false, true>
	cost_adj_percent_per_sm: fields.NumberField<number, number, true, false, true>
	thresholds: fields.ArrayField<
		fields.SchemaField<PoolThresholdSchema>,
		Partial<SourceFromSchema<PoolThresholdSchema>>[],
		ModelPropsFromSchema<PoolThresholdSchema>[],
		false,
		true
	>
	order: fields.NumberField<number, number, true, false, true>
}

type PoolThresholdSchema = {
	state: fields.StringField<string, string, true, false, true>
	explanation: fields.StringField<string, string, true, false, true>
	expression: fields.StringField<string, string, true, false, true>
	ops: fields.ArrayField<fields.StringField<threshold.Op>>
}

export { RESERVED_IDS }
export type { AttributeSchema, AttributeDefSchema, PoolThresholdSchema }
