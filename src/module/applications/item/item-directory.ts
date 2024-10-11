import { SYSTEM_NAME } from "@module/data/constants.ts"
import { ItemGURPS2 } from "@module/document/item.ts"

class ItemDirectoryGURPS extends ItemDirectory<ItemGURPS2<null>> {
	static override entryPartial = `systems/${SYSTEM_NAME}/templates/sidebar/partials/item-partial.hbs`

	override async _handleDroppedEntry(target: HTMLElement, data: DropCanvasData) {
		// Obtain the dropped Document
		let item = await this._getDroppedEntryFromData(data)
		if (!item) return

		// Create item and its contents if it doesn't already exist here
		if (!this._entryAlreadyExists(item)) {
			const toCreate = await ItemGURPS2.createWithContents([item])
			const folderElement = target?.closest("[data-folder-id") as HTMLElement
			const folder = folderElement.dataset.folderId
			if (folder) toCreate.map(d => (d.folder = folder))
			;[item] = (await ItemGURPS2.createDocuments(toCreate, { keepId: true })) as [ItemGURPS2<null>]
		}

		// Otherwise, if it is within a container, take it out
		else if ((item.system as any).container) await item.update({ "system.container": null })

		// Let parent method perform sorting
		super._handleDroppedEntry(target, item.toDragData())
	}
}

export { ItemDirectoryGURPS }
