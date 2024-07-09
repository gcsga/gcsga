import fields = foundry.data.fields

type AbstractAttributeSchema = {
	id: fields.StringField<string, string, true, true>
}

type AbstractAttributeDefSchema = {
	id: fields.StringField<string, string, true, true>
	base: fields.StringField
}

export type { AbstractAttributeSchema, AbstractAttributeDefSchema }
