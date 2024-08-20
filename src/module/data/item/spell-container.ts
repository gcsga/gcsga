import { ItemDataModel } from "../abstract.ts"
import fields = foundry.data.fields
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { ContainerTemplate, ContainerTemplateSchema } from "./templates/container.ts"
import { ItemType } from "../constants.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"
import { TemplatePicker, TemplatePickerSchema } from "@system"

class SpellContainerData extends ItemDataModel.mixin(BasicInformationTemplate, ContainerTemplate, ReplacementTemplate) {
	static override childTypes = new Set([ItemType.Spell, ItemType.SpellContainer, ItemType.RitualMagicSpell])

	static override defineSchema(): SpellContainerSchema {
		const fields = foundry.data.fields
		return this.mergeSchema(super.defineSchema(), {
			template_picker: new fields.SchemaField(TemplatePicker.defineSchema()),
		}) as SpellContainerSchema
	}
}

interface SpellContainerData extends ModelPropsFromSchema<SpellContainerSchema> {}

type SpellContainerSchema = BasicInformationTemplateSchema &
	ContainerTemplateSchema &
	ReplacementTemplateSchema & {
		template_picker: fields.SchemaField<TemplatePickerSchema>
	}

export { SpellContainerData, type SpellContainerSchema }
