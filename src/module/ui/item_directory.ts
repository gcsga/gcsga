import { SYSTEM_NAME } from "@module/data"

export class ItemDirectoryGURPS extends ItemDirectory {


	protected async _onDragStart(event: DragEvent): Promise<void> {
		const li = event.currentTarget
		const id = $(li!).data("entry-id")
		const item = game.items?.get(id)
		event.dataTransfer?.setData(
			"text/plain",
			JSON.stringify({
				type: "Item",
				uuid: item?.uuid,
			})
		)

		const dragImage = document.createElement("div")
		dragImage.innerHTML = await renderTemplate(`systems/${SYSTEM_NAME}/templates/actor/drag-image.hbs`, {
			name: `${item?.name}`,
			type: `${item?.type.replace("_container", "").replaceAll("_", "-")}`,
		})
		dragImage.id = "drag-ghost"
		dragImage.setAttribute("data-item", JSON.stringify(item?.toObject()))
		document.body.querySelectorAll("#drag-ghost").forEach(e => e.remove())
		document.body.appendChild(dragImage)
		const height = (document.body.querySelector("#drag-ghost") as HTMLElement).offsetHeight
		event.dataTransfer?.setDragImage(dragImage, 0, height / 2)
	}
}
