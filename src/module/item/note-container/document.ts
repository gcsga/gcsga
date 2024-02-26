import { ActorGURPS } from "@actor"
import { AbstractContainerGURPS } from "@item"
import { NoteContainerSource, NoteContainerSystemData } from "./data.ts"

class NoteContainerGURPS<
	TParent extends ActorGURPS | null = ActorGURPS | null,
> extends AbstractContainerGURPS<TParent> {}

interface NoteContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
	extends AbstractContainerGURPS<TParent> {
	readonly _source: NoteContainerSource
	system: NoteContainerSystemData
}

export { NoteContainerGURPS }
