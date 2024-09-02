import fields = foundry.data.fields
import { Mook } from "@system/mook/index.ts"
import { ActorDataModel } from "@module/data/abstract.ts"

type AbstractAttributeSchema = {
	id: fields.StringField<string, string, true, false>
}

type AbstractAttributeDefSchema = {
	id: fields.StringField<string, string, true, false>
	base: fields.StringField<string, string, true, false, true>
}

// interface AbstractAttributeConstructionOptions<TActor extends ActorGURPS | Mook>
// 	extends DataModelConstructionOptions<TActor> {
// 	order?: number
// }
interface AbstractAttributeConstructionOptions<TActor extends ActorDataModel | Mook>
	extends DataModelConstructionOptions<TActor> {
	order?: number
}

export type { AbstractAttributeSchema, AbstractAttributeDefSchema, AbstractAttributeConstructionOptions }
