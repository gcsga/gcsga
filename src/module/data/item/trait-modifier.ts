import { affects, tmcost } from "@util"
import { ItemDataModel } from "../abstract.ts"
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { FeatureTemplate, FeatureTemplateSchema } from "./templates/features.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"
import fields = foundry.data.fields

class TraitModifierData extends ItemDataModel.mixin(BasicInformationTemplate, FeatureTemplate, ReplacementTemplate) {
	static override defineSchema(): TraitModifierSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			...super.defineSchema(),
			cost: new fields.NumberField(),
			levels: new fields.NumberField(),
			affects: new fields.StringField<affects.Option>(),
			cost_type: new fields.StringField<tmcost.Type>(),
			disabled: new fields.BooleanField({ initial: false }),
		}) as TraitModifierSchema
	}
}

type TraitModifierSchema = BasicInformationTemplateSchema &
	FeatureTemplateSchema &
	ReplacementTemplateSchema & {
		cost: fields.NumberField<number, number, true, false, true>
		levels: fields.NumberField<number, number, true, false, true>
		affects: fields.StringField<affects.Option>
		cost_type: fields.StringField<tmcost.Type>
		disabled: fields.BooleanField<boolean>
	}

export { TraitModifierData, type TraitModifierSchema }
