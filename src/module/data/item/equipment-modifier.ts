import { emcost, emweight } from "@util"
import { ItemDataModel } from "../abstract.ts"
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { FeatureTemplate, FeatureTemplateSchema } from "./templates/features.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"
import fields = foundry.data.fields

class EquipmentModifierData extends ItemDataModel.mixin(
	BasicInformationTemplate,
	FeatureTemplate,
	ReplacementTemplate,
) {
	static override defineSchema(): EquipmentModifierSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			...super.defineSchema(),
			cost_type: new fields.StringField<emcost.Type>(),
			weight_type: new fields.StringField<emweight.Type>(),
			disabled: new fields.BooleanField({ initial: false }),
			tech_level: new fields.StringField(),
			cost: new fields.StringField(),
			weight: new fields.StringField(),
		}) as EquipmentModifierSchema
	}
}

type EquipmentModifierSchema = BasicInformationTemplateSchema &
	FeatureTemplateSchema &
	ReplacementTemplateSchema & {
		cost_type: fields.StringField<emcost.Type>
		weight_type: fields.StringField<emweight.Type>
		disabled: fields.BooleanField
		tech_level: fields.StringField
		cost: fields.StringField
		weight: fields.StringField
	}

export { EquipmentModifierData, type EquipmentModifierSchema }
