import { ItemSheetGCS } from "@item/gcs/sheet.ts"
import { Weight } from "@util"
import { EquipmentGURPS } from "./document.ts"
import { EquipmentContainerGURPS } from "@item"
import { SYSTEM_NAME, sheetSettingsFor } from "@module/data/index.ts"
import { ItemSheetDataGURPS, ItemSheetOptions } from "@item/base/sheet.ts"

export class EquipmentSheet<TItem extends EquipmentGURPS | EquipmentContainerGURPS> extends ItemSheetGCS<TItem> {
	static override get defaultOptions(): DocumentSheetOptions {
		const options = super.defaultOptions
		fu.mergeObject(options, {
			classes: options.classes.concat(["equipment"]),
		})
		return options
	}

	override get template(): string {
		return `/systems/${SYSTEM_NAME}/templates/item/equipment/sheet.hbs`
	}

	override async getData(options: Partial<ItemSheetOptions> = {}): Promise<ItemSheetDataGURPS<TItem>> {
		const data = await super.getData(options)
		return fu.mergeObject(data, {
			modifiers: this.object.modifiers,
			meleeWeapons: this.item.meleeWeapons,
			rangedWeapons: this.item.rangedWeapons,
		})
	}

	protected override async _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
		const weight: string = formData["system.weight"] as string
		const units = sheetSettingsFor(this.actor).default_weight_units
		const weightPounds = Weight.fromString(`${parseFloat(weight)} ${units}`, units)
		formData["system.weight"] = Weight.format(weightPounds, units)

		return super._updateObject(event, formData)
	}
}
