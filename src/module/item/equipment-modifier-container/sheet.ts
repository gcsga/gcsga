import { AbstractContainerSheetData, AbstractContainerSheetGURPS } from "@item/abstract-container/sheet.ts"
import { EquipmentModifierContainerGURPS } from "./document.ts"
import { ItemSheetOptions } from "@item/base/sheet.ts"

class EquipmentModifierContainerSheetGURPS extends AbstractContainerSheetGURPS<EquipmentModifierContainerGURPS> {
	override async getData(options?: Partial<ItemSheetOptions>): Promise<EquipmentModifierContainerSheetData> {
		const sheetData = await super.getData(options)

		return {
			...sheetData,
		}
	}
}
interface EquipmentModifierContainerSheetData extends AbstractContainerSheetData<EquipmentModifierContainerGURPS> {}

export { EquipmentModifierContainerSheetGURPS }
