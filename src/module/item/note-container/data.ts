import fields = foundry.data.fields
import {
	AbstractContainerSource,
	AbstractContainerSystemData,
	AbstractContainerSystemSchema,
} from "@item/abstract-container/data.ts"
import { ItemType } from "@module/data/constants.ts"
import { LocalizeGURPS } from "@util"
import { NoteContainerGURPS } from "./document.ts"

class NoteContainerSystemData extends AbstractContainerSystemData<NoteContainerGURPS, NoteContainerSystemSchema> {
	static override defineSchema(): NoteContainerSystemSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({ required: true, initial: ItemType.NoteContainer }),
			text: new fields.StringField({
				required: true,
				initial: LocalizeGURPS.translations.TYPES.Item[ItemType.NoteContainer],
			}),
			reference: new fields.StringField(),
			reference_highlight: new fields.StringField(),
			open: new fields.BooleanField({ initial: true }),
		}

	}
}

interface NoteContainerSystemData
	extends AbstractContainerSystemData<NoteContainerGURPS, NoteContainerSystemSchema>,
	ModelPropsFromSchema<NoteContainerSystemSchema> { }

type NoteContainerSystemSchema = AbstractContainerSystemSchema & {
	type: fields.StringField<ItemType.NoteContainer, ItemType.NoteContainer, true, false, true>
	text: fields.StringField<string, string, true, false, true>
	reference: fields.StringField
	reference_highlight: fields.StringField
	open: fields.BooleanField
}

type NoteContainerSystemSource = SourceFromSchema<NoteContainerSystemSchema>

type NoteContainerSource = AbstractContainerSource<ItemType.NoteContainer, NoteContainerSystemSource>

export type { NoteContainerSource, NoteContainerSystemData, NoteContainerSystemSource }
