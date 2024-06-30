import fields = foundry.data.fields

type HitLocationSchema = {
	id: fields.StringField
	choice_name: fields.StringField
	table_name: fields.StringField
	slots: fields.NumberField
	hit_penalty: fields.NumberField
	dr_bonus: fields.NumberField
	description: fields.StringField<string, string, true, true>
	sub_table: fields.SchemaField<
		BodySchema,
		SourceFromSchema<BodySchema>,
		ModelPropsFromSchema<BodySchema>,
		true, true
	>
}

type BodySchema = {
	name: fields.StringField<string, string, false, true>
	roll: fields.StringField
	locations: fields.ArrayField<fields.SchemaField<HitLocationSchema>>
}

export type { BodySchema, HitLocationSchema }
