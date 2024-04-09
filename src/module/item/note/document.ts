import { ActorGURPS } from "@actor"
import { ItemGURPS } from "@item"
import { NoteSource, NoteSystemData } from "./data.ts"
import { ItemType } from "@module/data/constants.ts"
import { LocalizeGURPS } from "@util"

const fields = foundry.data.fields

class NoteGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGURPS<TParent> {
	static override defineSchema(): foundry.documents.ItemSchema<string, object> {
		return this.mergeSchema(super.defineSchema(), {
			system: new fields.SchemaField({
				type: new fields.StringField({ required: true, initial: ItemType.Note }),
				text: new fields.StringField({
					required: true,
					initial: LocalizeGURPS.translations.TYPES.Item[ItemType.Note],
				}),
				reference: new fields.StringField(),
				reference_highlight: new fields.StringField(),
			}),
		})
	}
}

interface NoteGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGURPS<TParent> {
	readonly _source: NoteSource
	system: NoteSystemData
}

export { NoteGURPS }
