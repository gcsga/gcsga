import { ItemDataModel } from "./abstract.ts"
import { ItemType } from "../constants.ts"
import {
	BasicInformationTemplate,
	BasicInformationTemplateSchema,
	ContainerTemplate,
	ContainerTemplateSchema,
	NoteTemplate,
	NoteTemplateSchema,
	ReplacementTemplate,
	ReplacementTemplateSchema,
} from "./templates/index.ts"

class NoteContainerData extends ItemDataModel.mixin(
	BasicInformationTemplate,
	ContainerTemplate,
	ReplacementTemplate,
	NoteTemplate,
) {
	static override childTypes = new Set([ItemType.Note, ItemType.NoteContainer])

	override async getSheetData(context: Record<string, unknown>): Promise<void> {
		context.detailsParts = ["gurps.details-note"]
		context.embedsParts = ["gurps.embeds-note"]
	}

	static override defineSchema(): NoteContainerSchema {
		return this.mergeSchema(super.defineSchema(), {}) as NoteContainerSchema
	}
}

interface NoteContainerData extends ModelPropsFromSchema<NoteContainerSchema> {}

type NoteContainerSchema = BasicInformationTemplateSchema &
	ContainerTemplateSchema &
	ReplacementTemplateSchema &
	NoteTemplateSchema

export { NoteContainerData, type NoteContainerSchema }
