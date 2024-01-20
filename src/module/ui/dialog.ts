export class DialogGURPS extends Dialog {
	static get defaultOptions(): DialogOptions {
		return mergeObject(super.defaultOptions, {
			classes: [...super.defaultOptions.classes, "gurps"],
		})
	}

	protected _getHeaderButtons(): Application.HeaderButton[] {
		const all_buttons = super._getHeaderButtons()
		all_buttons.at(-1)!.label = ""
		all_buttons.at(-1)!.icon = "gcs-circled-x"
		return all_buttons
	}
}
