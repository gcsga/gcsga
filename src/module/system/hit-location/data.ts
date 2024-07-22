import { BodyGURPS } from "./index.ts"
import fields = foundry.data.fields

type HitLocationSchema = {
	id: fields.StringField
	choice_name: fields.StringField
	table_name: fields.StringField
	slots: fields.NumberField<number, number, true, false>
	hit_penalty: fields.NumberField
	dr_bonus: fields.NumberField<number, number, true, false>
	description: fields.StringField<string, string, true, true>
	sub_table: fields.ObjectField<BodyGURPS, BodyGURPS, false>
	// sub_table: fields.SchemaField<
	// 	BodySchema,
	// 	SourceFromSchema<BodySchema>,
	// 	ModelPropsFromSchema<BodySchema>,
	// 	true, false
	// >
}

type BodySchema = {
	name: fields.StringField<string, string, false, true>
	roll: fields.StringField
	locations: fields.ArrayField<fields.SchemaField<HitLocationSchema>>
}

export type { BodySchema, HitLocationSchema }
