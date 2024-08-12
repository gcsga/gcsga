import fields = foundry.data.fields
import {
	AbstractContainerSource,
	AbstractContainerSystemData,
	AbstractContainerSystemSchema,
} from "@item/abstract-container/data.ts"
import { ItemType } from "@module/data/constants.ts"
import { EquipmentModifierContainerGURPS } from "./document.ts"
import { RecordField } from "@system/schema-data-fields.ts"

class EquipmentModifierContainerSystemData extends AbstractContainerSystemData<
	EquipmentModifierContainerGURPS,
	EquipmentModifierContainerSystemSchema
> {
	static override defineSchema(): EquipmentModifierContainerSystemSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({ required: true, initial: ItemType.EquipmentModifierContainer }),
			name: new fields.StringField({
				required: true,
			}),
			reference: new fields.StringField(),
			reference_highlight: new fields.StringField(),
			notes: new fields.StringField(),
			vtt_notes: new fields.StringField(),
			tags: new fields.ArrayField(new foundry.data.fields.StringField()),
			open: new fields.BooleanField({ initial: true }),
			replacements: new RecordField(new fields.StringField({required: true, nullable: false}), new fields.StringField()),
		}
	}
}

interface EquipmentModifierContainerSystemData
	extends AbstractContainerSystemData<EquipmentModifierContainerGURPS, EquipmentModifierContainerSystemSchema>,
		ModelPropsFromSchema<EquipmentModifierContainerSystemSchema> {}

type EquipmentModifierContainerSystemSchema = AbstractContainerSystemSchema & {
	type: fields.StringField<
		ItemType.EquipmentModifierContainer,
		ItemType.EquipmentModifierContainer,
		true,
		false,
		true
	>
	name: fields.StringField<string, string, true, false, true>
	reference: fields.StringField
	reference_highlight: fields.StringField
	notes: fields.StringField
	vtt_notes: fields.StringField
	tags: fields.ArrayField<fields.StringField>
	open: fields.BooleanField
	replacements: RecordField<fields.StringField<string, string, true, false, false>, fields.StringField>
}

type EquipmentModifierContainerSystemSource = SourceFromSchema<EquipmentModifierContainerSystemSchema>

type EquipmentModifierContainerSource = AbstractContainerSource<
	ItemType.EquipmentModifierContainer,
	EquipmentModifierContainerSystemSource
>

export type { EquipmentModifierContainerSource, EquipmentModifierContainerSystemSource }
export { EquipmentModifierContainerSystemData }
