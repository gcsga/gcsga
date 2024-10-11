import fields = foundry.data.fields
import { FeatureTemplate, FeatureTemplateSchema } from "../item/templates/features.ts"
import { RollModifier } from "../roll-modifier.ts"
import { EffectDataModel } from "./abstract.ts"

enum ConditionSubtype {
	Normal = "normal",
	Posture = "posture",
}

const ConditionSubTypes: ConditionSubtype[] = [ConditionSubtype.Normal, ConditionSubtype.Posture]

class ConditionData extends EffectDataModel.mixin(FeatureTemplate) {
	static override defineSchema(): ConditionSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			can_level: new fields.BooleanField({ required: true, nullable: false, initial: false }),
			levels: new fields.SchemaField({
				max: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
				current: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
			}),
			sub_type: new fields.StringField({ choices: ConditionSubTypes, initial: ConditionSubtype.Normal }),
			modifiers: new fields.ArrayField(new fields.EmbeddedDataField(RollModifier)),
			checks: new fields.ArrayField(new fields.EmbeddedDataField(RollModifier)),
			consequences: new fields.ArrayField(
				new fields.SchemaField({
					margin: new fields.NumberField(),
				}),
			),
		}) as ConditionSchema
	}
}

interface ConditionData extends ModelPropsFromSchema<ConditionSchema> {}

type ConditionSchema = FeatureTemplateSchema & {
	modifiers: fields.ArrayField<fields.EmbeddedDataField<RollModifier>>
	can_level: fields.BooleanField<boolean, boolean, true, false, true>
	levels: fields.SchemaField<{
		max: fields.NumberField<number, number, true, false, true>
		current: fields.NumberField<number, number, true, false, true>
	}>
	sub_type: fields.StringField<ConditionSubtype, ConditionSubtype, true, false, true>
	checks: fields.ArrayField<fields.EmbeddedDataField<RollModifier>>
	consequences: fields.ArrayField<
		fields.SchemaField<{
			margin: fields.NumberField<number, number, true, false, true>
		}>
	>
}
export { ConditionData, type ConditionSchema }
