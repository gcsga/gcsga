import { ActorGURPS } from "@actor/base.ts"
import { ItemGURPS } from "@item/base/document.ts"
import { ItemFlags } from "@item/data.ts"
import { SYSTEM_NAME } from "@module/data/misc.ts"
import Document from "types/foundry/common/abstract/document.js"
import EmbeddedCollection from "types/foundry/common/abstract/embedded-collection.js"
import { setProperty } from "types/foundry/common/utils/helpers.js"

export abstract class ContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGURPS<TParent> {
	declare items: Collection<ItemGURPS>
	// items: Collection<ItemGURPS> = new Collection()

	get deepItems(): Collection<Item> {
		const deepItems: Item[] = []
		if (this.items)
			for (const item of this.items) {
				deepItems.push(item)
				if (item instanceof ContainerGURPS) for (const i of item.deepItems) deepItems.push(i)
			}
		return new Collection(
			deepItems.map(e => {
				return [e.id!, e]
			}),
		)
	}

	// Embedded Items
	get children(): Collection<ItemGURPS> {
		const childTypes = CONFIG.GURPS.Item.childTypes[this.type]
		return new Collection(
			this.items
				.filter(item => childTypes.includes(item.type))
				.map(item => {
					return [item.id!, item]
				}),
		) as Collection<ItemGURPS>
	}

	get open(): boolean {
		return (this.system as any).open
	}

	override async createEmbeddedDocuments(
		embeddedName: string,
		data: Record<string, any>[],
		context?: DocumentModificationContext<any>,
	): Promise<Document[]> {
		if (embeddedName !== "Item")
			return super.createEmbeddedDocuments(embeddedName, data, context) as unknown as Document[]
		if (!Array.isArray(data)) data = [data]

		// Prevent creating embeded documents which this type of container shouldn't contain
		data = data.filter(e => CONFIG.GURPS.Item.allowedContents[this.type].includes(e.type))

		if (data.length)
			for (const itemData of data) {
				itemData.flags ??= {}
				setProperty(itemData.flags, `${SYSTEM_NAME}.${ItemFlags.Container}`, this.id)
			}

		return this.actor?.createEmbeddedDocuments("Item", data)
	}

	override getEmbeddedDocument(embeddedName: string, id: string, { strict }: { strict: boolean }): Document {
		if (embeddedName !== "Item") return super.getEmbeddedDocument(embeddedName, id, { strict }) as Document
		return this.items.get(id) as Document
	}

	override async deleteEmbeddedDocuments(
		embeddedName: string,
		ids: string[],
		context?: DocumentModificationContext<any> | undefined,
	): Promise<any> {
		if (embeddedName !== "Item") return super.deleteEmbeddedDocuments(embeddedName, ids, context)

		const deletedItems = this.items.filter(e => ids.includes(e.id!))
		await this.parent?.deleteEmbeddedDocuments(embeddedName, ids, context)
		return deletedItems
	}

	override getEmbeddedCollection(embeddedName: string): EmbeddedCollection<Document<Document>> {
		if (embeddedName === "Item") return this.items as any
		return super.getEmbeddedCollection(embeddedName)
	}

	override prepareEmbeddedDocuments(): void {
		super.prepareEmbeddedDocuments()
		let container = null
		if (!this.actor && !this.pack) return
		this.items = new Collection()
		if (this.actor) {
			container = this.actor.items as unknown as EmbeddedCollection<ItemGURPS<ActorGURPS>>
			for (const item of container.filter(
				(e: ItemGURPS) =>
					!!e.flags?.[SYSTEM_NAME]?.[ItemFlags.Container] &&
					e.flags[SYSTEM_NAME][ItemFlags.Container] === this.id,
			)) {
				if (this.type === ItemType.EquipmentContainer && item.type === ItemType.Equipment) {
					;(item as any).system.other = (this.system as any).other
				}
				this.items.set(item.id!, item)
			}
		} else if (this.pack) {
			if (!this.compendium?.indexed) this.compendium?.getIndex()
			container = this.compendium?.index
			if (container)
				for (const i of container.filter(
					(e: any) =>
						!!e.flags?.[SYSTEM_NAME]?.[ItemFlags.Container] &&
						e.flags[SYSTEM_NAME][ItemFlags.Container] === this.id,
				)) {
					const item = fromUuidSync(i.uuid) as ItemGURPS
					this.items.set(item.id, item)
				}
		}
	}
}
