import { ItemDataModel } from "@module/data/item/abstract.ts"
import { ItemType } from "@module/data/constants.ts"
import { type ItemGURPS2 } from "@module/document/item.ts"
import fields = foundry.data.fields
import { ItemTemplateType } from "../types.ts"
import { MaybePromise } from "@module/data/types.ts"

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
	get contents(): MaybePromise<Collection<ItemGURPS2>> {
		if (!this.parent) return new Collection()

		// If in a compendium, fetch using getDocuments and return a promise
		if (this.parent.pack && !this.parent.isEmbedded) {
			const pack = game.packs.get(this.parent.pack) as CompendiumCollection<ItemGURPS2<null>>
			return pack!
				.getDocuments({ system: { container: this.parent.id } })
				.then(d => new Collection(d.map(d => [d.id, d])))
		}

		// Otherwise use local document collection
		return (this.parent.isEmbedded ? this.parent.actor!.items : game.items).reduce(
			(collection: Collection<ItemGURPS2>, item: ItemGURPS2) => {
				if (item.system.hasTemplate(ItemTemplateType.BasicInformation))
					if (item.system.container === this.parent.id) collection.set(item.id, item)
				return collection
			},
			new Collection(),
		)
	}

	get allContents(): MaybePromise<Collection<ItemGURPS2>> {
		if (!this.parent) return new Collection()
		if (this.parent.pack) return this._allContents()

		const allContents = new Collection<ItemGURPS2>()

		for (const item of <Collection<ItemGURPS2>>this.contents) {
			allContents.set(item.id, item)

			if (item.hasTemplate(ItemTemplateType.Container))
				for (const contents of <Collection<ItemGURPS2>>item.system.allContents) {
					allContents.set(contents.id, contents)
				}
		}
		return allContents
	}

	private async _allContents(): Promise<Collection<ItemGURPS2>> {
		const allContents = new Collection<ItemGURPS2>()

		for (const item of await this.contents) {
			allContents.set(item.id, item)

			if (item.hasTemplate(ItemTemplateType.Container))
				for (const contents of await item.system.allContents) {
					allContents.set(contents.id, contents)
				}
		}
		return allContents
	}

	get children(): MaybePromise<Collection<ItemGURPS2>> {
		if (!this.parent || this.constructor.childTypes.size === 0) return new Collection()
		return new Collection(
			Object.values(this.contents)
				.filter(e => this.constructor.childTypes.has(e.type))
				.map(e => [e.id, e]),
		)
	}

	get modifiers(): MaybePromise<Collection<ItemGURPS2>> {
		if (!this.parent || this.constructor.modifierTypes.size === 0) return new Collection()
		return new Collection(
			Object.values(this.contents)
				.filter(e => this.constructor.modifierTypes.has(e.type))
				.map(e => [e.id, e]),
		)
	}

	// This is overridden in Trait and Equipment
	get allModifiers(): MaybePromise<Collection<ItemGURPS2>> {
		return this.modifiers
	}

	get weapons(): MaybePromise<Collection<ItemGURPS2>> {
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
