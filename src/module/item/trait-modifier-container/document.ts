import { ActorGURPS } from "@actor"
import { AbstractContainerGURPS } from "@item"
import { TraitModifierContainerSource, TraitModifierContainerSystemData } from "./data.ts"

class TraitModifierContainerGURPS<
	TParent extends ActorGURPS | null = ActorGURPS | null,
> extends AbstractContainerGURPS<TParent> {}

interface TraitModifierContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
	extends AbstractContainerGURPS<TParent> {
	readonly _source: TraitModifierContainerSource
	system: TraitModifierContainerSystemData
}

export { TraitModifierContainerGURPS }
