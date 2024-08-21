import { ItemDataModel } from "../abstract.ts"
import { AbstractEffectTemplate, AbstractEffectTemplateSchema } from "./templates/abstract-effect.ts"
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { FeatureTemplate, FeatureTemplateSchema } from "./templates/features.ts"
import fields = foundry.data.fields
import { AllConditionSubtypes } from "@item/condition/data.ts"
import { RollModifier, RollModifierSchema } from "@system/roll-modifier.ts"

enum ConditionSubtype {
	Normal = "normal",
	Posture = "posture",
}

class ConditionData extends ItemDataModel.mixin(BasicInformationTemplate, FeatureTemplate, AbstractEffectTemplate) {
	static override defineSchema(): ConditionSchema {
		const fields = foundry.data.fields
		return this.mergeSchema(super.defineSchema(), {
			sub_type: new fields.StringField({ choices: AllConditionSubtypes, initial: ConditionSubtype.Normal }),
			checks: new fields.ArrayField(new fields.SchemaField(RollModifier.defineSchema())),
			consequences: new fields.ArrayField(
				new fields.SchemaField({
					margin: new fields.NumberField(),
				}),
			),
		}) as ConditionSchema
	}
}

interface ConditionData extends ModelPropsFromSchema<ConditionSchema> {}

type ConditionSchema = BasicInformationTemplateSchema &
	FeatureTemplateSchema &
	AbstractEffectTemplateSchema & {
		sub_type: fields.StringField<ConditionSubtype, ConditionSubtype, true, false, true>
		checks: fields.ArrayField<fields.SchemaField<RollModifierSchema>>
		consequences: fields.ArrayField<
			fields.SchemaField<{
				margin: fields.NumberField<number, number, true, false, true>
			}>
		>
	}

export { ConditionData, type ConditionSchema }
