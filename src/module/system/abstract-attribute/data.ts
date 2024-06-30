import fields = foundry.data.fields

// interface AbstractAttributeObj {
// 	id: string
// }
//
// interface AbstractAttributeDefObj {
// 	id: string
// 	base: string
// }

type AbstractAttributeSchema = {
	id: fields.StringField
}

type AbstractAttributeDefSchema = {
	id: fields.StringField
	base: fields.StringField
}

export type { AbstractAttributeSchema, AbstractAttributeDefSchema }
