import { RollModifier } from "../roll-modifier.ts"
import fields = foundry.data.fields
import { EffectDataModel } from "./abstract.ts"
import { FeatureTemplate, FeatureTemplateSchema } from "../item/templates/features.ts"
import { CellData, CellDataOptions } from "../item/components/cell-data.ts"
import { cell } from "@util/enum/cell.ts"

class EffectData extends EffectDataModel.mixin(FeatureTemplate) {
	static override defineSchema(): EffectSchema {
		return this.mergeSchema(super.defineSchema(), {
			modifiers: new fields.ArrayField(new fields.EmbeddedDataField(RollModifier)),
			can_level: new fields.BooleanField({ required: true, nullable: false, initial: false }),
			levels: new fields.SchemaField({
				max: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
				current: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
			}),
		}) as EffectSchema
	}

	cellData(_options: CellDataOptions = {}): Record<string, CellData> {
		return {
			name: new CellData({
				type: cell.Type.Text,
				primary: this.parent.name,
			}),
		}
	}
}

interface EffectData extends ModelPropsFromSchema<EffectSchema> {}

type EffectSchema = FeatureTemplateSchema & {
	modifiers: fields.ArrayField<fields.EmbeddedDataField<RollModifier>>
	can_level: fields.BooleanField<boolean, boolean, true, false, true>
	levels: fields.SchemaField<{
		max: fields.NumberField<number, number, true, false, true>
		current: fields.NumberField<number, number, true, false, true>
	}>
}
export { EffectData, type EffectSchema }
