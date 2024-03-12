import { ItemGURPS } from "@item"
import { DnD } from "@util"
import { createDragImage } from "@util/drag-image.ts"

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
}

export { ItemDirectoryGURPS }
