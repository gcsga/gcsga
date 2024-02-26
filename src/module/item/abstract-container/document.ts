import { ActorGURPS } from "@actor"
import { ItemGURPS } from "@item"
import { ContainerSource, ItemSystemData } from "@item/data/index.ts"

abstract class AbstractContainerGURPS<
	TParent extends ActorGURPS | null = ActorGURPS | null,
> extends ItemGURPS<TParent> {}

interface AbstractContainerGURPS<TParent extends ActorGURPS | null> extends ItemGURPS<TParent> {
	readonly _source: ContainerSource
	system: ItemSystemData
}

export { AbstractContainerGURPS }
