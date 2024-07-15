import { ActorGURPS } from "@actor"
import { LastActor } from "@module/util/last-actor.ts"

class ActorDirectoryGURPS<TActor extends ActorGURPS<null>> extends ActorDirectory<TActor> {
	// Set LastActor value when clicking on entry
	protected override async _onClickEntryName(event: PointerEvent): Promise<void> {
		const element = event.currentTarget as HTMLElement
		const documentId = element.parentElement?.dataset.documentId as string
		const document = ActorDirectoryGURPS.collection.get(documentId)
		if (document) LastActor.set(document as TActor)
		return super._onClickEntryName(event)
	}
}

export { ActorDirectoryGURPS }
