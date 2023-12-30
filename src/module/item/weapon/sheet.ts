import { ItemSheetGURPS } from "@item/base"

export abstract class WeaponSheet extends ItemSheetGURPS {
	static get defaultOptions() {
		const options = super.defaultOptions
		return mergeObject(super.defaultOptions, {
			classes: options.classes.concat(["item", "gurps"]),
			width: 620,
			min_width: 620,
			height: 800,
		})
	}

	getData(options?: Partial<DocumentSheetOptions<Item>> | undefined) {
		const sheetData = {
			...super.getData(options),
			...{
				attributes: {
					...{ 10: "10" },
					...super.getData(options).attributes,
				},
				defaults: (this.item as any).defaults,
			},
		}
		console.log(sheetData)
		return sheetData
	}

	protected _updateObject(event: Event, formData: Record<string, any>): Promise<unknown> {
		formData = this._processWeaponFieldChanges(formData)
		return super._updateObject(event, formData)
	}

	protected abstract _processWeaponFieldChanges(data: Record<string, any>): Record<string, any>

	protected _getHeaderButtons(): Application.HeaderButton[] {
		const all_buttons = super._getHeaderButtons()
		all_buttons.at(-1)!.label = ""
		all_buttons.at(-1)!.icon = "gcs-circled-x"
		return all_buttons
	}
}
