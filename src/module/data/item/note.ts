import { ItemDataModel } from "./abstract.ts"
import {
	BasicInformationTemplate,
	BasicInformationTemplateSchema,
	NoteTemplate,
	NoteTemplateSchema,
	ReplacementTemplate,
	ReplacementTemplateSchema,
} from "./templates/index.ts"

class NoteData extends ItemDataModel.mixin(BasicInformationTemplate, ReplacementTemplate, NoteTemplate) {
	override async getSheetData(context: Record<string, unknown>): Promise<void> {
		context.detailsParts = ["gurps.details-note"]
	}

	static override defineSchema(): NoteSchema {
		return this.mergeSchema(super.defineSchema(), {}) as NoteSchema
	}
}

interface NoteData extends ModelPropsFromSchema<NoteSchema> {}

type NoteSchema = BasicInformationTemplateSchema & ReplacementTemplateSchema & NoteTemplateSchema

export { NoteData, type NoteSchema }
