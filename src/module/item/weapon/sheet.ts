import { ItemSheetDataGURPS, ItemSheetGURPS, ItemSheetOptions } from "@item/base/sheet.ts"
import { BaseWeaponGURPS } from "./document.ts"

export abstract class WeaponSheet<IType extends BaseWeaponGURPS = BaseWeaponGURPS> extends ItemSheetGURPS<IType> {
	static override get defaultOptions(): ItemSheetOptions {
		const options = super.defaultOptions
		return fu.mergeObject(super.defaultOptions, {
			classes: options.classes.concat(["item", "gurps"]),
			width: 620,
			min_width: 620,
			height: 800,
		})
	}

	override async getData(options: Partial<ItemSheetOptions> = {}): Promise<ItemSheetDataGURPS<IType>> {
		const data = await super.getData(options)
		const sheetData = {
			...data,
			...{
				attributes: {
					...{ 10: "10" },
					...data.attributes,
				},
				defaults: this.item.defaults,
			},
		}
		return sheetData
	}

	protected override async _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
		formData = this._processWeaponFieldChanges(formData)
		return super._updateObject(event, formData)
	}

	protected abstract _processWeaponFieldChanges(data: Record<string, unknown>): Record<string, unknown>

	protected override _getHeaderButtons(): ApplicationHeaderButton[] {
		const all_buttons = super._getHeaderButtons()
		all_buttons.at(-1)!.label = ""
		all_buttons.at(-1)!.icon = "gcs-circled-x"
		return all_buttons
	}
}
