import { ActorGURPS } from "@actor"
import { AbstractContainerGURPS } from "@item"
import { TraitSource, TraitSystemData } from "./data.ts"

class TraitGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractContainerGURPS<TParent> {}

interface TraitGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractContainerGURPS<TParent> {
	readonly _source: TraitSource
	system: TraitSystemData
}

export { TraitGURPS }
