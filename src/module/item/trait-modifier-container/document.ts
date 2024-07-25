import { ActorGURPS } from "@actor"
import { AbstractContainerGURPS } from "@item"
import { TraitModifierContainerSource, TraitModifierContainerSystemData } from "./data.ts"
import { ItemInstances } from "@item/types.ts"
import { ItemType } from "@module/data/constants.ts"

class TraitModifierContainerGURPS<
	TParent extends ActorGURPS | null = ActorGURPS | null,
> extends AbstractContainerGURPS<TParent> {
	get children(): Collection<
		ItemInstances<TParent>[ItemType.TraitModifier] | ItemInstances<TParent>[ItemType.TraitModifierContainer]
	> {
		return new Collection(
			this.contents
				.filter(item => item.isOfType(ItemType.TraitModifier, ItemType.TraitModifierContainer))
				.map(item => [
					item.id,
					item as
						| ItemInstances<TParent>[ItemType.TraitModifier]
						| ItemInstances<TParent>[ItemType.TraitModifierContainer],
				]),
		)
	}
}

interface TraitModifierContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
	extends AbstractContainerGURPS<TParent> {
	readonly _source: TraitModifierContainerSource
	system: TraitModifierContainerSystemData
}

export { TraitModifierContainerGURPS }
