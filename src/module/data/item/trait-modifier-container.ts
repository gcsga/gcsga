import { ItemDataModel } from "../abstract.ts"
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { ContainerTemplate, ContainerTemplateSchema } from "./templates/container.ts"
import { ItemType } from "../constants.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"

class TraitModifierContainerData extends ItemDataModel.mixin(
	BasicInformationTemplate,
	ContainerTemplate,
	ReplacementTemplate,
) {
	static override childTypes = new Set([ItemType.TraitModifier, ItemType.TraitModifierContainer])

	static override defineSchema(): TraitModifierContainerSchema {
		return this.mergeSchema(super.defineSchema(), {}) as TraitModifierContainerSchema
	}
}

interface TraitModifierContainerData extends ModelPropsFromSchema<TraitModifierContainerSchema> {}

type TraitModifierContainerSchema = BasicInformationTemplateSchema &
	ContainerTemplateSchema &
	ReplacementTemplateSchema & {}

export { TraitModifierContainerData, type TraitModifierContainerSchema }
