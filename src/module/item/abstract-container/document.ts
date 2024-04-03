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
	contents: Collection<ItemGURPS<TParent>> = new Collection()

	// Map of item collections
	declare itemCollections: ItemItemCollectionMap

	get deepContents(): Collection<ItemGURPS<TParent>> {
		const items: ItemGURPS<TParent>[] = []
		for (const item of this.contents) {
			items.push(item)
			if (item.isOfType("abstract-container")) items.push(...item.deepContents)
		}
		return new Collection(items.map(item => [item.id, item]))
	}

	// static async contentFromDropData(data: { uuid: ItemUUID }, newId: string): Promise<ItemGURPS[]> {
	// 	if (!data.uuid) throw ErrorGURPS("No UUID provided")
	//
	// 	const originalDocument = (await fromUuid(data.uuid)) as ItemGURPS
	//
	// 	if (!originalDocument) throw ErrorGURPS(`UUID "${data.uuid}" does not correspond to a valid item.`)
	// 	if (!originalDocument.isOfType("abstract-container"))
	// 		throw ErrorGURPS(`Item with UUID "${data.uuid}" is not a container.`)
	//
	// 	for (const )
	// }
	//

	static cloneContents(item: AbstractContainerGURPS, containerId: string | null): ItemGURPS["_source"][] {
		console.log("parent ID", containerId)
		const contents: ItemGURPS["_source"][] = []
		for (const content of item.contents) {
			const newId = fu.randomID()
			const newItem = content
				.clone({
					_id: newId,
					flags: { [SYSTEM_NAME]: { [ItemFlags.Container]: containerId } },
				})
				.toObject()
			contents.push(newItem)
			console.log(newItem.name, newItem._id, newItem.flags.gcsga.container)
			if (content.isOfType("abstract-container")) {
				contents.push(...AbstractContainerGURPS.cloneContents(content, newId))
			}
		}
		console.log(contents)

		return contents
	}

	/** Reload this container's contents following Actor embedded-document preparation */
	override prepareSiblingData(): void {
		super.prepareSiblingData()

		if (this.flags[SYSTEM_NAME][ItemFlags.Container] === this.id)
			this.setFlag(SYSTEM_NAME, ItemFlags.Container, null)
		this.contents = new Collection(
			this.collection.filter(i => i.container?.id === this.id).map(item => [item.id, item]),
		)
		this.itemCollections = new ItemItemCollectionMap(this.deepContents)
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

	override delete(context?: DocumentModificationContext<TParent> | undefined): Promise<this | undefined> {
		for (const content of this.contents) {
			content.delete(context)
		}
		return super.delete(context)
	}
}

interface AbstractContainerGURPS<TParent extends ActorGURPS | null> extends ItemGURPS<TParent> {
	readonly _source: ContainerSource
	system: ItemSystemData
}

export { AbstractContainerGURPS }
