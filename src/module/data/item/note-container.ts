import { ItemDataModel } from "../abstract.ts"
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { ContainerTemplate, ContainerTemplateSchema } from "./templates/container.ts"
import { ItemType } from "../constants.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"

class NoteContainerData extends ItemDataModel.mixin(BasicInformationTemplate, ContainerTemplate, ReplacementTemplate) {
	static override childTypes = new Set([ItemType.Note, ItemType.NoteContainer])

	static override defineSchema(): NoteContainerSchema {
		return this.mergeSchema(super.defineSchema(), {}) as NoteContainerSchema
	}
}

interface NoteContainerData extends ModelPropsFromSchema<NoteContainerSchema> {}

type NoteContainerSchema = BasicInformationTemplateSchema & ContainerTemplateSchema & ReplacementTemplateSchema & {}

export { NoteContainerData, type NoteContainerSchema }
