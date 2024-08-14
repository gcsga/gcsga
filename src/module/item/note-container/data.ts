import fields = foundry.data.fields
import {
	AbstractContainerSource,
	AbstractContainerSystemData,
	AbstractContainerSystemSchema,
} from "@item/abstract-container/data.ts"
import { ItemType } from "@module/data/constants.ts"
import { NoteContainerGURPS } from "./document.ts"
import { RecordField } from "@system/schema-data-fields.ts"

class NoteContainerSystemData extends AbstractContainerSystemData<NoteContainerGURPS, NoteContainerSystemSchema> {
	static override defineSchema(): NoteContainerSystemSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({ required: true, initial: ItemType.NoteContainer }),
			text: new fields.StringField({
				required: true,
			}),
			reference: new fields.StringField(),
			reference_highlight: new fields.StringField(),
			open: new fields.BooleanField({ initial: true }),
			replacements: new RecordField(new fields.StringField({required: true, nullable: false}), new fields.StringField({required: true, nullable: false})),
		}
	}
}

interface NoteContainerSystemData
	extends AbstractContainerSystemData<NoteContainerGURPS, NoteContainerSystemSchema>,
		ModelPropsFromSchema<NoteContainerSystemSchema> {}

type NoteContainerSystemSchema = AbstractContainerSystemSchema & {
	type: fields.StringField<ItemType.NoteContainer, ItemType.NoteContainer, true, false, true>
	text: fields.StringField<string, string, true, false, true>
	reference: fields.StringField
	reference_highlight: fields.StringField
	open: fields.BooleanField
	replacements: RecordField<fields.StringField<string, string, true, false, false>,  fields.StringField<string,string,true,false,false>>
}

type NoteContainerSystemSource = SourceFromSchema<NoteContainerSystemSchema>

type NoteContainerSource = AbstractContainerSource<ItemType.NoteContainer, NoteContainerSystemSource>

export type { NoteContainerSource, NoteContainerSystemSource }
export { NoteContainerSystemData }
