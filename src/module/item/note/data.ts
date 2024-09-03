import fields = foundry.data.fields
import { BaseItemSourceGURPS } from "@item/base/data.ts"
import { ItemSystemModel, ItemSystemSchema } from "@item/base/schema.ts"
import { ItemType } from "@module/data/constants.ts"
import { NoteGURPS } from "./document.ts"
import { RecordField } from "@system/schema-data-fields.ts"

class NoteSystemData extends ItemSystemModel<NoteGURPS, NoteSystemSchema> {
	static override defineSchema(): NoteSystemSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({ required: true, initial: ItemType.Note }),
			text: new fields.StringField({
				required: true,
			}),
			reference: new fields.StringField(),
			reference_highlight: new fields.StringField(),
			replacements: new RecordField(
				new fields.StringField({ required: true, nullable: false }),
				new fields.StringField({ required: true, nullable: false }),
			),
		}
	}
}

interface NoteSystemData extends ItemSystemModel<NoteGURPS, NoteSystemSchema>, ModelPropsFromSchema<NoteSystemSchema> {}

type NoteSystemSchema = ItemSystemSchema & {
	type: fields.StringField<ItemType.Note, ItemType.Note, true, false, true>
	text: fields.StringField<string, string, true, false, true>
	reference: fields.StringField
	reference_highlight: fields.StringField
	replacements: RecordField<
		fields.StringField<string, string, true, false, false>,
		fields.StringField<string, string, true, false, false>
	>
}

type NoteSystemSource = SourceFromSchema<NoteSystemSchema>

type NoteSource = BaseItemSourceGURPS<ItemType.Note, NoteSystemSource>

export type { NoteSource, NoteSystemSource }
export { NoteSystemData }
