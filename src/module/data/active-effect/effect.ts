import { feature } from "@util"
import { Feature, FeatureTypes } from "../feature/types.ts"
import { RollModifier } from "../roll-modifier.ts"
import fields = foundry.data.fields
import { EffectDataModel } from "../abstract.ts"

class EffectData extends EffectDataModel {
	static override defineSchema(): EffectSchema {
		return {
			features: new fields.ArrayField(new fields.TypedSchemaField(FeatureTypes)),
			modifiers: new fields.ArrayField(new fields.EmbeddedDataField(RollModifier)),
			can_level: new fields.BooleanField({ required: true, nullable: false, initial: false }),
			levels: new fields.SchemaField({
				max: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
				current: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
			}),
		}
	}
}

interface EffectData extends ModelPropsFromSchema<EffectSchema> {}

type EffectSchema = {
	features: fields.ArrayField<fields.TypedSchemaField<Record<feature.Type, ConstructorOf<Feature>>>>
	modifiers: fields.ArrayField<fields.EmbeddedDataField<RollModifier>>
	can_level: fields.BooleanField<boolean, boolean, true, false, true>
	levels: fields.SchemaField<{
		max: fields.NumberField<number, number, true, false, true>
		current: fields.NumberField<number, number, true, false, true>
	}>
}
export { EffectData, type EffectSchema }
