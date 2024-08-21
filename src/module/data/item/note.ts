import { ItemDataModel } from "../abstract.ts"
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"

class NoteData extends ItemDataModel.mixin(BasicInformationTemplate, ReplacementTemplate) {
	static override defineSchema(): NoteSchema {
		return this.mergeSchema(super.defineSchema(), {}) as NoteSchema
	}
}

interface NoteData extends ModelPropsFromSchema<NoteSchema> {}

type NoteSchema = BasicInformationTemplateSchema & ReplacementTemplateSchema & {}

export { NoteData, type NoteSchema }
