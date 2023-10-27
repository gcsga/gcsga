import { EquipmentContainerGURPS } from "@item/equipment_container"
import { ItemSheetGCS } from "@item/gcs"
import { ItemType, SYSTEM_NAME } from "@module/data"
import { EquipmentGURPS } from "./document"
import { Weight, WeightUnits, allWeightUnits } from "@util"

export class EquipmentSheet extends ItemSheetGCS {
	object!: EquipmentGURPS | EquipmentContainerGURPS

	static get defaultOptions(): DocumentSheetOptions<Item> {
		const options = super.defaultOptions
		mergeObject(options, {
			classes: options.classes.concat(["equipment"]),
		})
		return options
	}

	get template(): string {
		return `/systems/${SYSTEM_NAME}/templates/item/equipment/sheet.hbs`
	}

	getData(options?: Partial<DocumentSheetOptions<Item>> | undefined) {
		this.object.prepareData()
		const data = super.getData(options)
		return mergeObject(data, {
			modifiers: this.object.modifiers,
			meleeWeapons: data.items.filter((e: any) => e.type === ItemType.MeleeWeapon),
		})
	}

	protected _updateObject(event: Event, formData: Record<string, any>): Promise<unknown> {
		const weight: string = formData["system.weight"]
		let weightFormat: WeightUnits = this.object.actor.settings.default_weight_units
		allWeightUnits.forEach(u => {
			if (weight.includes(u)) weightFormat = u
		})
		const weightPounds = Weight.fromString(`${parseFloat(weight)} ${weightFormat}`)
		formData["system.weight"] = Weight.format(weightPounds, weightFormat)

		return super._updateObject(event, formData)
	}
}
