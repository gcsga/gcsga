import { AbstractContainerGURPS, ItemGURPS } from "@item"
import { ItemFlags, SYSTEM_NAME } from "@module/data/constants.ts"
import { DnD } from "@util"
import { createDragImage } from "@util/drag-image.ts"

type SortData<TItem extends ItemGURPS<null>> = {
	sortKey: string
	sortBefore: boolean
	target?: object
	siblings: TItem[]
	updateData: object
}

class ItemDirectoryGURPS<TItem extends ItemGURPS<null>> extends ItemDirectory<TItem> {
	protected override async _onDragStart(event: DragEvent): Promise<void> {
		const element = event.currentTarget
		if (!(element instanceof HTMLElement)) return

		const id = element.dataset.entryId ?? ""
		const item = this.collection.get(id)
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
		// Determine the closest Folder
		const closestFolder: HTMLElement | null = target ? target.closest(".folder") : null
		if (closestFolder) closestFolder.classList.remove("droptarget")
		let folder: Folder<TItem> | null = closestFolder
			? ((await fromUuid(closestFolder.dataset.uuid ?? "")) as Folder<TItem>)
			: null

		let entry = await this._getDroppedEntryFromData(data)
		if (!entry) return

		const newId = fu.randomID()
		const entryClone = fu.mergeObject(entry.clone().toObject(), {
			_id: newId,
			[`flags.${SYSTEM_NAME}.${ItemFlags.Container}`]: null,
		})

		// Get entries for all contents of the dropped item
		const items: TItem["_source"][] = []
		if (entry.isOfType("abstract-container")) {
			items.push(...AbstractContainerGURPS.cloneContents(entry, newId))
		}

		// Sort relative to another Document
		const collection: DocumentCollection<TItem> = this.collection
		// @ts-expect-error bad type
		const sortData: SortData<TItem> = { sortKey: "sort" }
		const isRelative = target && target.dataset.entryId
		if (isRelative) {
			if (entry.id === target.dataset.entryId) return // Don't drop on yourself
			const targetDocument = collection.get(target.dataset.entryId ?? "")
			if (!targetDocument) return
			sortData.target = targetDocument
			folder = (targetDocument?.folder as Folder<TItem>) ?? null
		}

		// Sort within to the closest Folder
		// @ts-expect-error bad type
		else sortData.target = null

		// Determine siblings
		sortData.siblings = collection.filter(
			d => !this._entryIsSelf(d, entry) && this._entryBelongsToFolder(d, folder),
		)

		if (!this._entryAlreadyExists(entry)) {
			// Try to predetermine the sort order
			const sorted = SortingHelpers.performIntegerSort(entry, sortData)
			if (sorted.length === 1) entry = entry.clone({ sort: sorted[0].update[sortData.sortKey] }, { keepId: true })
			const folderId = entry.folder ?? null
			const cls = this.collection.documentClass

			// Create items for original item contents
			// @ts-expect-error bad type
			await cls.create(items, { fromCompendium: !!entry.compendium, keepId: true })
			// @ts-expect-error bad type
			entry = await cls.create(
				{ ...entryClone, folder: folderId },
				{ fromCompendium: !!entry.compendium, keepId: true },
			)

			// No need to resort other documents if the document was created with a specific sort order
			if (sorted.length === 1) return
		}

		// Resort the collection
		sortData.updateData = { folder: folder || null }
		console.log(entry, sortData)
		this._sortRelative(entry, sortData)
	}

	override initialize(): void {
		for (const item of this.collection) {
			item.prepareSiblingData()
		}
		return super.initialize()
	}
}

export { ItemDirectoryGURPS }
