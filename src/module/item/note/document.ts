import { ActorGURPS } from "@actor"
import { ItemGURPS } from "@item"
import { NoteSource, NoteSystemData } from "./data.ts"

class NoteGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGURPS<TParent> {
}

interface NoteGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGURPS<TParent> {
	readonly _source: NoteSource
	system: NoteSystemData
}

export { NoteGURPS }
