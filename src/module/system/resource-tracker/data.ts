import fields = foundry.data.fields
import { AbstractAttributeDefSchema, AbstractAttributeSchema, PoolThresholdSchema } from "@system"

type ResourceTrackerSchema = AbstractAttributeSchema & {
	damage: fields.NumberField
}

type ResourceTrackerDefSchema = AbstractAttributeDefSchema & {
	name: fields.StringField
	full_name: fields.StringField
	max: fields.NumberField
	min: fields.NumberField
	isMaxEnforced: fields.BooleanField
	isMinEnforced: fields.BooleanField
	thresholds: fields.ArrayField<fields.SchemaField<PoolThresholdSchema>>
	order: fields.NumberField
}

export type { ResourceTrackerSchema, ResourceTrackerDefSchema }
