interface CreateButtonOptions {
	classes: string[]
	icon: string[]
	label: string
	data: Record<string, string>
}

function createButton(options: Partial<CreateButtonOptions>): HTMLButtonElement {
	const button = document.createElement("button")

	if (options.classes) button.classList.add(...options.classes)
	if (options.label) button.innerHTML = options.label

	if (options.icon) {
		const icon = document.createElement("i")
		icon.classList.add(...options.icon)
		button.append(icon)
	}

	if (options.data) {
		for (const [key, value] of Object.entries(options.data)) {
			button.dataset[key] = value
		}
	}

	return button
}

export { createButton }
