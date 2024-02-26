import { ActorGURPS } from "@actor"
import type { ItemFlagsGURPS, ItemSystemData } from "./data.ts"
import type { ItemSourceGURPS } from "@item/data/index.ts"
import type { ItemSheetGURPS } from "./sheet.ts"

/** The basic `Item` subclass for the system */
class ItemGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends Item<TParent> {
	/** The recorded schema version of this item, updated after each data migration */
	get schemaVersion(): number | null {
		return Number(this.system._migration?.version) || null
	}
}

interface ItemGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends Item<TParent> {
	constructor: typeof ItemGURPS
	flags: ItemFlagsGURPS
	readonly _source: ItemSourceGURPS
	system: ItemSystemData

	_sheet: ItemSheetGURPS<this> | null

	get sheet(): ItemSheetGURPS<this>
}

/** A `Proxy` to to get Foundry to construct `ItemGURPS` subclasses */
const ItemProxyGURPS = new Proxy(ItemGURPS, {
	construct(
		_target,
		args: [source: PreCreate<ItemSourceGURPS>, context?: DocumentConstructionContext<ActorGURPS | null>],
	) {
		const source = args[0]
		const type = source?.type
		const ItemClass: typeof ItemGURPS = CONFIG.GURPS.Item.documentClasses[type] ?? ItemGURPS
		return new ItemClass(...args)
	},
})

export { ItemGURPS, ItemProxyGURPS }
