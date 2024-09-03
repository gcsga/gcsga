import fields = foundry.data.fields
import {
	AbstractContainerSource,
	AbstractContainerSystemData,
	AbstractContainerSystemSchema,
} from "@item/abstract-container/data.ts"
import { ItemType } from "@module/data/constants.ts"
import { TemplatePicker, TemplatePickerSchema } from "@system"
import { SkillContainerGURPS } from "./document.ts"
import { RecordField } from "@system/schema-data-fields.ts"

class SkillContainerSystemData extends AbstractContainerSystemData<SkillContainerGURPS, SkillContainerSystemSchema> {
	static override defineSchema(): SkillContainerSystemSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({ required: true, initial: ItemType.SkillContainer }),
			name: new fields.StringField({
				required: true,
			}),
			reference: new fields.StringField(),
			reference_highlight: new fields.StringField(),
			notes: new fields.StringField(),
			vtt_notes: new fields.StringField(),
			tags: new fields.ArrayField(new foundry.data.fields.StringField()),
			template_picker: new fields.SchemaField(TemplatePicker.defineSchema()),
			open: new fields.BooleanField({ initial: true }),
			replacements: new RecordField(
				new fields.StringField({ required: true, nullable: false }),
				new fields.StringField({ required: true, nullable: false }),
			),
		}
	}
}

interface SkillContainerSystemData
	extends AbstractContainerSystemData<SkillContainerGURPS, SkillContainerSystemSchema>,
		ModelPropsFromSchema<SkillContainerSystemSchema> {}

type SkillContainerSystemSchema = AbstractContainerSystemSchema & {
	type: fields.StringField<ItemType.SkillContainer, ItemType.SkillContainer, true, false, true>
	name: fields.StringField<string, string, true, false, true>
	reference: fields.StringField
	reference_highlight: fields.StringField
	notes: fields.StringField
	vtt_notes: fields.StringField
	tags: fields.ArrayField<fields.StringField>
	template_picker: fields.SchemaField<TemplatePickerSchema>
	open: fields.BooleanField
	replacements: RecordField<
		fields.StringField<string, string, true, false, false>,
		fields.StringField<string, string, true, false, false>
	>
}

type SkillContainerSystemSource = SourceFromSchema<SkillContainerSystemSchema>

type SkillContainerSource = AbstractContainerSource<ItemType.SkillContainer, SkillContainerSystemSource>

export type { SkillContainerSource, SkillContainerSystemSource }
export { SkillContainerSystemData }
