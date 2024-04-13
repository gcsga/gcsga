import { ActorGURPS } from "@actor"
import { ItemGURPS, ItemProxyGURPS } from "@item"
import { ContainerSource, ItemSourceGURPS, ItemSystemData } from "@item/data/index.ts"
import { itemIsOfType } from "@item/helpers.ts"
import { ItemFlags, ItemType, SYSTEM_NAME } from "@module/data/constants.ts"
import { LocalizeGURPS } from "@util"
import { ItemItemCollectionMap } from "./item-collection-map.ts"
import Document, { _Document } from "types/foundry/common/abstract/document.js"
import { DataSchema } from "types/foundry/common/data/fields.js"

abstract class AbstractContainerGURPS<
	TParent extends ActorGURPS | null = ActorGURPS | null,
> extends ItemGURPS<TParent> {
	/** This container's contents, reloaded every data preparation cycle */
	contents: Collection<ItemGURPS<ActorGURPS | null>> = new Collection()

	// Map of item collections
	declare itemCollections: ItemItemCollectionMap

	get deepContents(): Collection<ItemGURPS<ActorGURPS | null>> {
		const items: ItemGURPS<ActorGURPS | null>[] = []
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
		item.prepareSiblingData()
		const contents: ItemGURPS["_source"][] = []
		for (const content of item.contents) {
			const newId = fu.randomID()
			const newItem: ItemGURPS["_source"] = fu.mergeObject(content.clone().toObject(), {
				_id: newId,
				[`flags.${SYSTEM_NAME}.${ItemFlags.Container}`]: containerId,
			})
			contents.push(newItem)
			if (content.isOfType("abstract-container")) {
				contents.push(...AbstractContainerGURPS.cloneContents(content, newId))
			}
		}
		return contents
	}

	/** Reload this container's contents following Actor embedded-document preparation */
	override prepareSiblingData(): void {
		super.prepareSiblingData()

		if (this.flags[SYSTEM_NAME][ItemFlags.Container] === this.id)
			this.setFlag(SYSTEM_NAME, ItemFlags.Container, null)

		if (this.compendium) {
			this.contents = new Collection(
				(this.compendium as CompendiumCollection<ItemGURPS<null>>)
					.filter(i => i.container?.id === this.id)
					.map(item => [item.id, item]),
			)
		} else {
			this.contents = new Collection(
				this.collection.filter(i => i.container?.id === this.id).map(item => [item.id, item]),
			)
		}
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

	override createEmbeddedDocuments(
		embeddedName: string,
		data: object[],
		context?: DocumentModificationContext<this> | undefined,
	): Promise<Document<_Document | null, DataSchema>[]> {
		if (embeddedName !== "Item") return super.createEmbeddedDocuments(embeddedName, data, context)

		console.log(data)

		if (this.parent) {
			return this.parent.createEmbeddedDocuments(embeddedName, data)
		}

		if (this.compendium) {
			return ItemProxyGURPS.createDocuments(data, { pack: this.pack })
		}
		return ItemProxyGURPS.createDocuments(data)
	}

	// async deleteContainedDocuments(
	// 	ids: string[],
	// 	context?: DocumentModificationContext<NonNullable<TParent>>,
	// ): Promise<ItemGURPS[]> {
	// 	return this.parent?.deleteEmbeddedDocuments("Item", ids, context) as Promise<ItemGURPS[]>
	// }
	//
	// override delete(context?: DocumentModificationContext<TParent> | undefined): Promise<this | undefined> {
	// 	for (const content of this.contents) {
	// 		content.delete(context)
	// 	}
	// 	return super.delete(context)
	// }
}

interface AbstractContainerGURPS<TParent extends ActorGURPS | null> extends ItemGURPS<TParent> {
	readonly _source: ContainerSource
	system: ItemSystemData
}

export { AbstractContainerGURPS }
