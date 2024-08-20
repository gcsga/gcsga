import { ItemDataModel } from "../abstract.ts"
import fields = foundry.data.fields
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { ContainerTemplate, ContainerTemplateSchema } from "./templates/container.ts"
import { ItemType } from "../constants.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"
import { TemplatePicker, TemplatePickerSchema } from "@system"

class SkillContainerData extends ItemDataModel.mixin(BasicInformationTemplate, ContainerTemplate, ReplacementTemplate) {
	static override childTypes = new Set([ItemType.Skill, ItemType.SkillContainer, ItemType.Technique])

	static override defineSchema(): SkillContainerSchema {
		const fields = foundry.data.fields
		return this.mergeSchema(super.defineSchema(), {
			template_picker: new fields.SchemaField(TemplatePicker.defineSchema()),
		}) as SkillContainerSchema
	}
}

interface SkillContainerData extends ModelPropsFromSchema<SkillContainerSchema> {}

type SkillContainerSchema = BasicInformationTemplateSchema &
	ContainerTemplateSchema &
	ReplacementTemplateSchema & {
		template_picker: fields.SchemaField<TemplatePickerSchema>
	}

export { SkillContainerData, type SkillContainerSchema }
