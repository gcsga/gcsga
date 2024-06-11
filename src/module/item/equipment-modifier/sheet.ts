import { AbstractContainerSheetData, AbstractContainerSheetGURPS } from "@item/abstract-container/sheet.ts"
import { EquipmentModifierGURPS } from "./document.ts"
import { ItemSheetOptions } from "@item/base/sheet.ts"

class EquipmentModifierSheetGURPS extends AbstractContainerSheetGURPS<EquipmentModifierGURPS> {
	override async getData(options?: Partial<ItemSheetOptions>): Promise<EquipmentModifierSheetData> {
		const sheetData = await super.getData(options)

		return {
			...sheetData,
		}
	}
}
interface EquipmentModifierSheetData extends AbstractContainerSheetData<EquipmentModifierGURPS> {}

export { EquipmentModifierSheetGURPS }
