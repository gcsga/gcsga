interface CreateButtonOptions {
	type: "button" | "submit" | "reset"
	classes: string[]
	icon: string[]
	label: string
	data: Record<string, string>
	disabled: boolean
}

function createButton(options: Partial<CreateButtonOptions>): HTMLButtonElement {
	const button = document.createElement("button")

	if (options.classes) button.classList.add(...options.classes)
	if (options.label) button.innerHTML = options.label

	if (options.type) button.type = options.type
	else button.type = "button"

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

	if (options.disabled) button.setAttribute("disabled", "")

	return button
}

function createDummyElement(name: string, value: string | number | boolean): HTMLInputElement {
	const element = foundry.applications.fields.createTextInput({
		name,
		value: String(value),
		readonly: true,
	})
	element.style.setProperty("display", "none")
	return element
}

export { createButton, createDummyElement }
