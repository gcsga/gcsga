import { ActorGURPS } from "@actor"
import { ItemGURPS } from "@item"
import { ContainerSource, ItemSystemData } from "@item/data/index.ts"
import { ItemFlags, SYSTEM_NAME } from "@module/data/constants.ts"

abstract class AbstractContainerGURPS<
	TParent extends ActorGURPS | null = ActorGURPS | null,
> extends ItemGURPS<TParent> {
	/** This container's contents, reloaded every data preparation cycle */
	contents: Collection<ItemGURPS<NonNullable<TParent>>> = new Collection()

	get deepContents(): Collection<ItemGURPS<NonNullable<TParent>>> {
		const items: ItemGURPS<NonNullable<TParent>>[] = []
		for (const item of this.contents) {
			items.push(item)
			if (item.isOfType("container")) items.push(...item.deepContents)
		}
		return new Collection(items.map(item => [item.id, item]))
	}

	/** Reload this container's contents following Actor embedded-document preparation */
	override prepareSiblingData(this: AbstractContainerGURPS<ActorGURPS>): void {
		super.prepareSiblingData()

		if (this.flags[SYSTEM_NAME][ItemFlags.Container] === this.id)
			this.setFlag(SYSTEM_NAME, ItemFlags.Container, null)
		this.contents = new Collection(
			this.actor.items.filter(i => i.container?.id === this.id).map(item => [item.id, item]),
		)
	}

	get enabled(): boolean {
		return true
	}
}

interface AbstractContainerGURPS<TParent extends ActorGURPS | null> extends ItemGURPS<TParent> {
	readonly _source: ContainerSource
	system: ItemSystemData
}

export { AbstractContainerGURPS }
