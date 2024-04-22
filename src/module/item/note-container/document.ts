import { ActorGURPS } from "@actor"
import { AbstractContainerGURPS } from "@item"
import { NoteContainerSource, NoteContainerSystemData } from "./data.ts"
import { ItemInstances } from "@item/types.ts"
import { ItemType } from "@module/data/constants.ts"
import { LocalizeGURPS } from "@util"

const fields = foundry.data.fields

class NoteContainerGURPS<
	TParent extends ActorGURPS | null = ActorGURPS | null,
> extends AbstractContainerGURPS<TParent> {
	static override defineSchema(): foundry.documents.ItemSchema<string, object> {
		return this.mergeSchema(super.defineSchema(), {
			system: new fields.SchemaField({
				type: new fields.StringField({ required: true, initial: ItemType.NoteContainer }),
				text: new fields.StringField({
					required: true,
					initial: LocalizeGURPS.translations.TYPES.Item[ItemType.NoteContainer],
				}),
				reference: new fields.StringField(),
				reference_highlight: new fields.StringField(),
				open: new fields.BooleanField({ initial: false }),
			}),
		})
	}

	get children(): Collection<ItemInstances<TParent>[ItemType.Note] | ItemInstances<TParent>[ItemType.NoteContainer]> {
		return new Collection(
			this.contents
				.filter(item => item.isOfType(ItemType.Note, ItemType.NoteContainer))
				.map(item => [
					item.id,
					item as ItemInstances<TParent>[ItemType.Note] | ItemInstances<TParent>[ItemType.NoteContainer],
				]),
		)
	}
}

interface NoteContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
	extends AbstractContainerGURPS<TParent> {
	readonly _source: NoteContainerSource
	system: NoteContainerSystemData
}

export { NoteContainerGURPS }
