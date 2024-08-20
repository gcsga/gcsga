import { ItemDataModel } from "../abstract.ts"
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { ContainerTemplate, ContainerTemplateSchema } from "./templates/container.ts"
import { ItemType } from "../constants.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"

class EquipmentModifierContainerData extends ItemDataModel.mixin(
	BasicInformationTemplate,
	ContainerTemplate,
	ReplacementTemplate,
) {
	static override childTypes = new Set([ItemType.EquipmentModifier, ItemType.EquipmentModifierContainer])

	static override defineSchema(): EquipmentModifierContainerSchema {
		return this.mergeSchema(super.defineSchema(), {}) as EquipmentModifierContainerSchema
	}
}

interface EquipmentModifierContainerData extends ModelPropsFromSchema<EquipmentModifierContainerSchema> {}

type EquipmentModifierContainerSchema = BasicInformationTemplateSchema &
	ContainerTemplateSchema &
	ReplacementTemplateSchema & {}

export { EquipmentModifierContainerData, type EquipmentModifierContainerSchema }
