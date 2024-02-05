import { EquipmentModifierContainerGURPS } from "./document.ts"
import { ItemSheetOptions } from "@item/base/sheet.ts"
import { ItemSheetGCS } from "@item/gcs/sheet.ts"

export class EquipmentModifierContainerSheet<
	IType extends EquipmentModifierContainerGURPS = EquipmentModifierContainerGURPS,
> extends ItemSheetGCS<IType> {
	static override get defaultOptions(): ItemSheetOptions {
		const options = super.defaultOptions
		fu.mergeObject(options, {
			classes: options.classes.concat(["eqp_modifier_container"]),
		})
		return options
	}
}
