import { SystemDataModel } from "@module/data/abstract.ts"
import { ItemGURPS2 } from "@module/document/item.ts"

class ContainerTemplate extends SystemDataModel<ItemGURPS2, ContainerTemplateSchema> {
	static override defineSchema(): ContainerTemplateSchema {
		return {}
	}

	/**
	 * Get all of the items contained in this container. A promise if item is within a compendium.
	 */
	get contents(): Collection<ItemGURPS2> | Promise<Collection<ItemGURPS2>> {
		if (!this.parent) return new Collection()

		// If in a compendium, fetch using getDocuments and return a promise
		if (this.parent.pack && !this.parent.isEmbedded) {
			// @ts-expect-error will be fixed when migrating document class
			const pack = game.packs.get(this.parent.pack) as CompendiumCollection<ItemGURPS2>
			return pack!
				.getDocuments({ system: { container: this.parent.id } })
				.then(d => new Collection(d.map(d => [d.id, d])))
		}

		// Otherwise use local document collection
		return (this.parent.isEmbedded ? this.parent.actor!.items : game.items).reduce((collection, item) => {
			if (item.system.container === this.parent.id) collection.set(item.id, item)
			return collection
		}, new Collection())
	}

	get allContents(): Collection<ItemGURPS2> | Promise<Collection<ItemGURPS2>> {
		if (!this.parent) return new Collection()
		if (this.parent.pack) return this._allContents()

		return (this.contents as Collection<ItemGURPS2>).reduce(
			(collection: Collection<ItemGURPS2>, item: ItemGURPS2) => {
				collection.set(item.id, item)
				if (item.isOfType("container")) item.system.allContents.forEach(i => collection.set(i.id, i))
				return collection
			},
			new Collection(),
		)
	}

	private async _allContents(): Promise<Collection<ItemGURPS2>> {
		return (await this.contents).reduce(async (promise: Promise<Collection<ItemGURPS2>>, item: ItemGURPS2) => {
			const collection = await promise
			collection.set(item.id, item)
			if (item.isOfType("container")) (await item.system.allContents).forEach(i => collection.set(i.id, i))
			return collection
			//@ts-expect-error is ok
		}, new Collection<ItemGURPS2>())
	}
}

interface ContainerTemplate
	extends SystemDataModel<ItemGURPS2, ContainerTemplateSchema>,
		ModelPropsFromSchema<ContainerTemplateSchema> {}

type ContainerTemplateSchema = {}

export { ContainerTemplate, type ContainerTemplateSchema }
