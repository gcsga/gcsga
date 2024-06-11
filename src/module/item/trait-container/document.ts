import { ActorGURPS } from "@actor"
import { AbstractContainerGURPS } from "@item"
import { TraitContainerSource, TraitContainerSystemData } from "./data.ts"

class TraitContainerGURPS<
	TParent extends ActorGURPS | null = ActorGURPS | null,
> extends AbstractContainerGURPS<TParent> {}

interface TraitContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
	extends AbstractContainerGURPS<TParent> {
	readonly _source: TraitContainerSource
	system: TraitContainerSystemData
}

export { TraitContainerGURPS }
