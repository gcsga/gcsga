import { ActorGURPS } from "@actor"
import { ItemGURPS, ItemProxyGURPS } from "@item"
import { ContainerSource, ItemSourceGURPS, ItemSystemData } from "@item/data/index.ts"
import { itemIsOfType } from "@item/helpers.ts"
import { ItemFlags, ItemType, SYSTEM_NAME } from "@module/data/constants.ts"
import { LocalizeGURPS } from "@util"
import { ItemItemCollectionMap } from "./item-collection-map.ts"
import Document, { _Document } from "types/foundry/common/abstract/document.js"
import { DataSchema } from "types/foundry/common/data/fields.js"
import { AbstractSkillSystemData } from "@item/abstract-skill/data.ts"
import { ItemSystemSchema } from "@item/base/schema.ts"

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
		operation?: DatabaseCreateOperation<NonNullable<TParent>>,
	): Promise<ItemGURPS[]> {
		data = data.filter(source => this.checkItemValidity(source))

		for (const datum of data) {
			fu.mergeObject(datum, {
				flags: { [SYSTEM_NAME]: { [ItemFlags.Container]: this.id } },
			})
		}

		return this.parent?.createEmbeddedDocuments("Item", data, operation) as Promise<ItemGURPS[]>
	}

	override createEmbeddedDocuments(
		embeddedName: string,
		data: object[],
		operation?: Partial<DatabaseCreateOperation<this>> | undefined,
	): Promise<Document<_Document | null, DataSchema>[]> {
		if (embeddedName !== "Item") return super.createEmbeddedDocuments(embeddedName, data, operation)

		if (this.parent) {
			return this.parent.createEmbeddedDocuments(embeddedName, data)
		}

		if (this.compendium) {
			return ItemProxyGURPS.createDocuments(data, { pack: this.pack })
		}
		return ItemProxyGURPS.createDocuments(data)
	}

	override updateEmbeddedDocuments(
		embeddedName: string,
		updateData: EmbeddedDocumentUpdateData[],
		operation?: Partial<DatabaseUpdateOperation<this>>,
	): Promise<Document<Document>[]> {
		if (embeddedName !== "Item") return super.updateEmbeddedDocuments(embeddedName, updateData, operation)

		if (this.parent) {
			return this.parent.updateEmbeddedDocuments(embeddedName, updateData)
		}

		if (this.compendium) {
			return ItemProxyGURPS.updateDocuments(updateData, { pack: this.pack }) as Promise<Document<Document>[]>
		}

		return Item.updateDocuments(updateData) as Promise<Document<Document>[]>
	}
}

interface AbstractContainerGURPS<TParent extends ActorGURPS | null> extends ItemGURPS<TParent> {
	readonly _source: ContainerSource
	system: ItemSystemData
}

export { AbstractContainerGURPS }
