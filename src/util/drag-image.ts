// import { SYSTEM_NAME } from "@module/data/constants.ts"
// import { htmlQuery, htmlQueryAll } from "./dom.ts"
// import { ItemGURPS2 } from "@module/document/item.ts"
//
// async function createDragImage(event: DragEvent | null, item: ItemGURPS2 | null): Promise<void> {
// 	const dragImage = document.createElement("div")
// 	dragImage.innerHTML = await renderTemplate(`systems/${SYSTEM_NAME}/templates/system/drag-image.hbs`, {
// 		name: item?.name ?? "",
// 		type: item ? getItemArtworkName(item.type) : "",
// 	})
// 	dragImage.id = "drag-ghost"
// 	for (const element of htmlQueryAll(document.body, "#drag-ghost")) element.remove()
// 	document.body.appendChild(dragImage)
//
// 	const height = htmlQuery(document.body, "#drag-ghost")?.offsetHeight ?? 0
//
// 	if (event) event.dataTransfer?.setDragImage(dragImage, 0, height / 2)
// }
//
// export { createDragImage }
