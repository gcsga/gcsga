import { ActorGURPS } from "@actor"
import fields = foundry.data.fields

type AbstractAttributeSchema = {
	id: fields.StringField<string, string, true, false>
}

type AbstractAttributeDefSchema = {
	id: fields.StringField<string, string, true, false>
	base: fields.StringField
}

interface AbstractAttributeConstructionOptions<TActor extends ActorGURPS> extends DataModelConstructionOptions<TActor> {
	order?: number
}

export type { AbstractAttributeSchema, AbstractAttributeDefSchema, AbstractAttributeConstructionOptions }
