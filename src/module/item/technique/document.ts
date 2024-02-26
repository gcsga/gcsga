import { ActorGURPS } from "@actor"
import { AbstractContainerGURPS } from "@item"
import { TechniqueSource, TechniqueSystemData } from "./data.ts"

class TechniqueGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractContainerGURPS<TParent> {}

interface TechniqueGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
	extends AbstractContainerGURPS<TParent> {
	readonly _source: TechniqueSource
	system: TechniqueSystemData
}

export { TechniqueGURPS }
