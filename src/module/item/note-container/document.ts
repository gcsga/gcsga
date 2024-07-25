import { ActorGURPS } from "@actor"
import { AbstractContainerGURPS } from "@item"
import { NoteContainerSource, NoteContainerSystemData } from "./data.ts"
import { ItemInstances } from "@item/types.ts"
import { ItemType } from "@module/data/constants.ts"

class NoteContainerGURPS<
	TParent extends ActorGURPS | null = ActorGURPS | null,
> extends AbstractContainerGURPS<TParent> {
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
