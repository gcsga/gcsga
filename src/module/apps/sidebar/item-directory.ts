import { ItemGURPS } from "@item"
import { DnD } from "@util"
import { createDragImage } from "@util/drag-image.ts"

// type SortData<TItem extends ItemGURPS<null>> = {
// 	sortKey: string
// 	sortBefore: boolean
// 	target?: object
// 	siblings: TItem[]
// 	updateData: object
// }

class ItemDirectoryGURPS extends ItemDirectory<ItemGURPS<null>> {

	protected override async _onDragStart(event: DragEvent): Promise<void> {
		const element = event.currentTarget
		if (!(element instanceof HTMLElement)) return

		const id = element.dataset.entryId ?? ""
		const item = ItemDirectory.collection.get(id) as ItemGURPS
		if (!item) return console.error(`No item found with id "${id}"`)

		event.dataTransfer?.setData(DnD.TEXT_PLAIN, JSON.stringify(item.toDragData()))

		await createDragImage(event, item)
	}

	/**
	 * Handle Entry data being dropped into the directory.
	 */
	protected override async _handleDroppedEntry(
		target: HTMLElement,
		data: DropCanvasData<string, object>,
	): Promise<void> {
		return super._handleDroppedEntry(target, data)
		// TODO: reimplement
		// // Determine the closest Folder
		// const closestFolder: HTMLElement | null = target ? target.closest(".folder") : null
		// if (closestFolder) closestFolder.classList.remove("droptarget")
		// let folder: Folder<ItemGURPS<null>> | null = closestFolder
		// 	? ((await fromUuid(closestFolder.dataset.uuid ?? "")) as Folder<ItemGURPS<null>>)
		// 	: null
		//
		// let entry = await this._getDroppedEntryFromData(data)
		// if (!entry) return
		//
		// const newId = fu.randomID()
		// const entryClone = fu.mergeObject(entry.clone().toObject(), {
		// 	_id: newId,
		// 	[`flags.${SYSTEM_NAME}.${ItemFlags.Container}`]: null,
		// })
		//
		// // Get entries for all contents of the dropped item
		// const items: ItemSourceGURPS[] = []
		// if (entry.isOfType("abstract-container")) {
		// 	items.push(...AbstractContainerGURPS.cloneContents(entry, newId))
		// }
		//
		// // Sort relative to another Document
		// const collection = ItemDirectoryGURPS.collection
		// const sortData: Partial<SortData<ItemGURPS<null>>> & { sortKey: string } = { sortKey: "sort" }
		// const isRelative = target && target.dataset.entryId
		// if (isRelative) {
		// 	if (entry.id === target.dataset.entryId) return // Don't drop on yourself
		// 	const targetDocument = collection.get(target.dataset.entryId ?? "") as ItemGURPS<null>
		// 	if (!targetDocument) return
		// 	sortData.target = targetDocument
		// 	folder = (targetDocument?.folder as Folder<ItemGURPS<null>>) ?? null
		// }
		//
		// // Sort within to the closest Folder
		// // @ts-expect-error bad type
		// else sortData.target = null
		//
		// // Determine siblings
		// sortData.siblings = collection.filter(
		// 	d => (d instanceof ItemGURPS) && !this._entryIsSelf(d, entry) && !!folder && this._entryBelongsToFolder(d, folder),
		// )
		//
		// if (!this._entryAlreadyExists(entry)) {
		// 	// Try to predetermine the sort order
		// 	const sorted = SortingHelpers.performIntegerSort(entry, sortData)
		// 	if (sorted.length === 1) entry = entry.clone({ sort: sorted[0].update[sortData.sortKey] }, { keepId: true })
		// 	const folderId = entry.folder ?? null
		// 	const cls = ItemDirectoryGURPS.collection.documentClass as DocumentConstructorOf<ItemGURPS>
		//
		// 	// Create items for original item contents
		// 	await cls.create(items, { fromCompendium: !!entry.compendium, keepId: true })
		// 	entry = await cls.create(
		// 		{ ...entryClone, folder: folderId },
		// 		{ fromCompendium: !!entry.compendium, keepId: true },
		// 	)
		//
		// 	// No need to resort other documents if the document was created with a specific sort order
		// 	if (sorted.length === 1) return
		// }
		//
		// // Resort the collection
		// sortData.updateData = { folder: folder || null }
		// console.log(entry, sortData)
		// this._sortRelative(entry, sortData)
	}

	override initialize(): void {
		for (const item of this.documents) {
			item.prepareSiblingData()
		}
		return super.initialize()
	}
}

export { ItemDirectoryGURPS }
