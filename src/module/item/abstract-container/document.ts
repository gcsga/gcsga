import { ActorGURPS } from "@actor"
import { ItemGURPS } from "@item"
import { ContainerSource, ItemSourceGURPS, ItemSystemData } from "@item/data/index.ts"
import { itemIsOfType } from "@item/helpers.ts"
import { ItemFlags, ItemType, SYSTEM_NAME } from "@module/data/constants.ts"
import { LocalizeGURPS } from "@util"
import { ItemItemCollectionMap } from "./item-collection-map.ts"

abstract class AbstractContainerGURPS<
	TParent extends ActorGURPS | null = ActorGURPS | null,
> extends ItemGURPS<TParent> {
	/** This container's contents, reloaded every data preparation cycle */
	contents: Collection<ItemGURPS<NonNullable<TParent>>> = new Collection()

	// Map of item collections
	declare itemCollections: ItemItemCollectionMap<NonNullable<TParent>>

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
		this.itemCollections = new ItemItemCollectionMap<ActorGURPS>(this.deepContents)
	}

	get enabled(): boolean {
		return true
	}

	get allowedItemTypes(): ItemType[] {
		return CONFIG.GURPS.Item.allowedContents[this.type]
	}

	/** Checks if the item can be added to this actor by checking the valid item types. */
	checkItemValidity(source: PreCreate<ItemSourceGURPS>): boolean {
		if (!itemIsOfType(source, ...this.allowedItemTypes)) {
			ui.notifications.error(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.error.cannot_add_type, {
					type: LocalizeGURPS.translations.TYPES.Item[source.type],
				}),
			)

			return false
		}

		return true
	}

	async createContainedDocuments(
		data: ItemSourceGURPS[],
		context?: DocumentModificationContext<NonNullable<TParent>>,
	): Promise<ItemGURPS[]> {
		data = data.filter(source => this.checkItemValidity(source))

		for (const datum of data) {
			fu.mergeObject(datum, {
				flags: { [SYSTEM_NAME]: { [ItemFlags.Container]: this.id } },
			})
		}

		return this.parent?.createEmbeddedDocuments("Item", data, context) as Promise<ItemGURPS[]>
	}

	async deleteContainedDocuments(
		ids: string[],
		context?: DocumentModificationContext<NonNullable<TParent>>,
	): Promise<ItemGURPS[]> {
		return this.parent?.deleteEmbeddedDocuments("Item", ids, context) as Promise<ItemGURPS[]>
	}
}

interface AbstractContainerGURPS<TParent extends ActorGURPS | null> extends ItemGURPS<TParent> {
	readonly _source: ContainerSource
	system: ItemSystemData
}

export { AbstractContainerGURPS }
