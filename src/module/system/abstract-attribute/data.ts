import fields = foundry.data.fields

type AbstractAttributeSchema = {
	id: fields.StringField
}

type AbstractAttributeDefSchema = {
	id: fields.StringField
	base: fields.StringField
}

export type { AbstractAttributeSchema, AbstractAttributeDefSchema }
