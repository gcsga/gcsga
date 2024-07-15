class DragDropGURPS extends DragDrop {

	static override createDragImage(img: ImageFilePath, width: number, height: number): HTMLDivElement {
		let div = document.getElementById("drag-preview") as HTMLDivElement

		// Create the drag preview div
		if (!div) {
			div = document.createElement("div") as HTMLDivElement
			div.setAttribute("id", "drag-preview")
			const image = document.createElement("img")
			image.classList.add("noborder")
			div.appendChild(image)
			document.body.appendChild(div)
		}

		// Add the preview image
		const i = div.children[0] as HTMLImageElement
		i.src = img
		i.width = width
		i.height = height
		return div
	}
}

export { DragDropGURPS }
