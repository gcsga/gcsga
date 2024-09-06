import { ItemDataModel } from "@module/data/abstract.ts"
import { ItemType } from "@module/data/constants.ts"
import { ItemGURPS2 } from "@module/document/item.ts"
import fields = foundry.data.fields
import { ItemTemplateType } from "../types.ts"

class ContainerTemplate extends ItemDataModel<ContainerTemplateSchema> {
	static override defineSchema(): ContainerTemplateSchema {
		const fields = foundry.data.fields
		return {
			open: new fields.BooleanField({ required: true, nullable: true, initial: null }),
		}
	}

	/**
	 * Valid contents types for this item type
	 */
	static get contentsTypes(): Set<ItemType> {
		return new Set([...this.childTypes, ...this.modifierTypes, ...this.weaponTypes])
	}

	/**
	 * Valid child types for this item type
	 */
	static childTypes: Set<ItemType> = new Set()

	/**
	 * Valid modifier types for this item type
	 */
	static modifierTypes: Set<ItemType> = new Set()

	/**
	 * Valid weapon types for this item type
	 */
	static weaponTypes: Set<ItemType> = new Set()

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
				if (item.hasTemplate(ItemTemplateType.Container))
					(item.system.allContents as Collection<ItemGURPS2>).forEach(i => collection.set(i.id, i))
				return collection
			},
			new Collection(),
		)
	}

	private async _allContents(): Promise<Collection<ItemGURPS2>> {
		return (await this.contents).reduce(async (promise: Promise<Collection<ItemGURPS2>>, item: ItemGURPS2) => {
			const collection = await promise
			collection.set(item.id, item)
			if (item.hasTemplate(ItemTemplateType.Container))
				(await item.system.allContents).forEach(i => collection.set(i.id, i))
			return collection
			// @ts-expect-error is ok
		}, new Collection<ItemGURPS2>())
	}

	get children(): Collection<ItemGURPS2> | Promise<Collection<ItemGURPS2>> {
		if (!this.parent || this.constructor.childTypes.size === 0) return new Collection()
		return new Collection(
			Object.values(this.contents)
				.filter(e => this.constructor.childTypes.has(e.type))
				.map(e => [e.id, e]),
		)
	}

	get modifiers(): Collection<ItemGURPS2> | Promise<Collection<ItemGURPS2>> {
		if (!this.parent || this.constructor.modifierTypes.size === 0) return new Collection()
		return new Collection(
			Object.values(this.contents)
				.filter(e => this.constructor.modifierTypes.has(e.type))
				.map(e => [e.id, e]),
		)
	}

	get weapons(): Collection<ItemGURPS2> | Promise<Collection<ItemGURPS2>> {
		if (!this.parent || this.constructor.modifierTypes.size === 0) return new Collection()
		return new Collection(
			Object.values(this.contents)
				.filter(e => this.constructor.modifierTypes.has(e.type))
				.map(e => [e.id, e]),
		)
	}
}

interface ContainerTemplate
	extends ItemDataModel<ContainerTemplateSchema>,
		ModelPropsFromSchema<ContainerTemplateSchema> {
	constructor: typeof ContainerTemplate
}

type ContainerTemplateSchema = {
	open: fields.BooleanField<boolean, boolean, true, true>
}

export { ContainerTemplate, type ContainerTemplateSchema }
