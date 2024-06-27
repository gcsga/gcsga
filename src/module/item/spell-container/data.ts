import fields = foundry.data.fields
import {
	AbstractContainerSource,
	AbstractContainerSystemData,
	AbstractContainerSystemSchema,
} from "@item/abstract-container/data.ts"
import { ItemType } from "@module/data/constants.ts"
import { TemplatePicker, TemplatePickerSchema } from "@system"
import { LocalizeGURPS } from "@util"
import { SpellContainerGURPS } from "./document.ts"

class SpellContainerSystemData extends AbstractContainerSystemData<SpellContainerGURPS, SpellContainerSystemSchema> {
	static override defineSchema(): SpellContainerSystemSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({ required: true, initial: ItemType.SpellContainer }),
			name: new fields.StringField({
				required: true,
				initial: LocalizeGURPS.translations.TYPES.Item[ItemType.SpellContainer],
			}),
			reference: new fields.StringField(),
			reference_highlight: new fields.StringField(),
			notes: new fields.StringField(),
			vtt_notes: new fields.StringField(),
			tags: new fields.ArrayField(new foundry.data.fields.StringField()),
			template_picker: new fields.SchemaField(TemplatePicker.defineSchema()),
			open: new fields.BooleanField({ initial: true }),
		}

	}
}

interface SpellContainerSystemData
	extends AbstractContainerSystemData<SpellContainerGURPS, SpellContainerSystemSchema>,
	ModelPropsFromSchema<SpellContainerSystemSchema> { }

type SpellContainerSystemSchema = AbstractContainerSystemSchema & {
	type: fields.StringField<ItemType.SpellContainer, ItemType.SpellContainer, true, false, true>
	name: fields.StringField<string, string, true, false, true>
	reference: fields.StringField
	reference_highlight: fields.StringField
	notes: fields.StringField
	vtt_notes: fields.StringField
	tags: fields.ArrayField<fields.StringField>
	template_picker: fields.SchemaField<TemplatePickerSchema>
	open: fields.BooleanField
}

type SpellContainerSystemSource = SourceFromSchema<SpellContainerSystemSchema>

type SpellContainerSource = AbstractContainerSource<ItemType.SpellContainer, SpellContainerSystemSource>

export type { SpellContainerSource, SpellContainerSystemData, SpellContainerSystemSource }
