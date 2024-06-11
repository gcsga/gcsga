import { ActorGURPS } from "@actor"
import { AbstractContainerGURPS } from "@item"
import { SpellContainerSource, SpellContainerSystemData } from "./data.ts"

class SpellContainerGURPS<
	TParent extends ActorGURPS | null = ActorGURPS | null,
> extends AbstractContainerGURPS<TParent> {}

interface SpellContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
	extends AbstractContainerGURPS<TParent> {
	readonly _source: SpellContainerSource
	system: SpellContainerSystemData
}

export { SpellContainerGURPS }
