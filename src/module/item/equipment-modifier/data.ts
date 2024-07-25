import fields = foundry.data.fields
import { BaseItemSourceGURPS } from "@item/base/data.ts"
import { ItemSystemModel, ItemSystemSchema } from "@item/base/schema.ts"
import { ItemType } from "@module/data/constants.ts"
import { emcost, emweight } from "@util"
import { EquipmentModifierGURPS } from "./document.ts"
import { BaseFeature } from "@system/feature/base.ts"
import { FeatureSchema } from "@system"

class EquipmentModifierSystemData extends ItemSystemModel<EquipmentModifierGURPS, EquipmentModifierSystemSchema> {
	static override defineSchema(): EquipmentModifierSystemSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({ required: true, initial: ItemType.EquipmentModifier }),
			name: new fields.StringField({
				required: true,
			}),
			reference: new fields.StringField(),
			reference_highlight: new fields.StringField(),
			notes: new fields.StringField(),
			vtt_notes: new fields.StringField(),
			tags: new fields.ArrayField(new foundry.data.fields.StringField()),
			cost_type: new fields.StringField<emcost.Type>(),
			weight_type: new fields.StringField<emweight.Type>(),
			disabled: new fields.BooleanField({ initial: false }),
			tech_level: new fields.StringField(),
			cost: new fields.StringField(),
			weight: new fields.StringField(),
			features: new fields.ArrayField(new fields.SchemaField(BaseFeature.defineSchema())),
		}
	}
}

interface EquipmentModifierSystemData
	extends ItemSystemModel<EquipmentModifierGURPS, EquipmentModifierSystemSchema>,
		ModelPropsFromSchema<EquipmentModifierSystemSchema> {}

type EquipmentModifierSystemSchema = ItemSystemSchema & {
	type: fields.StringField<ItemType.EquipmentModifier, ItemType.EquipmentModifier, true, false, true>
	name: fields.StringField<string, string, true, false, true>
	reference: fields.StringField
	reference_highlight: fields.StringField
	notes: fields.StringField
	vtt_notes: fields.StringField
	tags: fields.ArrayField<fields.StringField>
	cost_type: fields.StringField<emcost.Type>
	weight_type: fields.StringField<emweight.Type>
	disabled: fields.BooleanField
	tech_level: fields.StringField
	cost: fields.StringField
	weight: fields.StringField
	features: fields.ArrayField<fields.SchemaField<FeatureSchema>>
}

type EquipmentModifierSystemSource = SourceFromSchema<EquipmentModifierSystemSchema>

type EquipmentModifierSource = BaseItemSourceGURPS<ItemType.EquipmentModifier, EquipmentModifierSystemSource>

export type { EquipmentModifierSource, EquipmentModifierSystemSource }
export { EquipmentModifierSystemData }
