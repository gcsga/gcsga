export class DialogGURPS extends Dialog {
	static override get defaultOptions(): ApplicationOptions {
		return fu.mergeObject(super.defaultOptions, {
			classes: [...super.defaultOptions.classes, "gurps"],
		})
	}

	protected override _getHeaderButtons(): ApplicationHeaderButton[] {
		const all_buttons = super._getHeaderButtons()
		all_buttons.at(-1)!.label = ""
		all_buttons.at(-1)!.icon = "gcs-circled-x"
		return all_buttons
	}
}
