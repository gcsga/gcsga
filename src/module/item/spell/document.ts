import { ActorGURPS } from "@actor"
import { AbstractContainerGURPS } from "@item"
import { SpellSource, SpellSystemData } from "./data.ts"

class SpellGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractContainerGURPS<TParent> {}

interface SpellGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractContainerGURPS<TParent> {
	readonly _source: SpellSource
	system: SpellSystemData
}

export { SpellGURPS }
