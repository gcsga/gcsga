import { ActorGURPS } from "@actor"
import { LastActor } from "@util"

export class ActorDirectoryGURPS<TActor extends ActorGURPS<null>> extends ActorDirectory<TActor> {
	// Set LastActor value when clicking on entry
	protected override async _onClickEntryName(event: PointerEvent): Promise<void> {
		const element = event.currentTarget as HTMLElement
		const documentId = element.parentElement?.dataset.documentId as string
		const document = this.collection.get(documentId)
		if (document) LastActor.set(document)
		return super._onClickEntryName(event)
	}
}
