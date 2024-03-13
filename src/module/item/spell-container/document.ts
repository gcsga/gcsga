import { ActorGURPS } from "@actor"
import { AbstractContainerGURPS } from "@item"
import { SpellContainerSource, SpellContainerSystemData } from "./data.ts"
import { ItemType } from "@module/data/constants.ts"
import { ItemInstances } from "@item/types.ts"

class SpellContainerGURPS<
	TParent extends ActorGURPS | null = ActorGURPS | null,
> extends AbstractContainerGURPS<TParent> {
	get children(): Collection<
		| ItemInstances<TParent>[ItemType.Spell]
		| ItemInstances<TParent>[ItemType.RitualMagicSpell]
		| ItemInstances<TParent>[ItemType.SpellContainer]
	> {
		return new Collection(
			this.contents
				.filter(item => item.isOfType(ItemType.Spell, ItemType.RitualMagicSpell, ItemType.SpellContainer))
				.map(item => [
					item.id,
					item as
						| ItemInstances<TParent>[ItemType.Spell]
						| ItemInstances<TParent>[ItemType.RitualMagicSpell]
						| ItemInstances<TParent>[ItemType.SpellContainer],
				]),
		)
	}
}

interface SpellContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
	extends AbstractContainerGURPS<TParent> {
	readonly _source: SpellContainerSource
	system: SpellContainerSystemData
}

export { SpellContainerGURPS }
