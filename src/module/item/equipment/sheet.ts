import { AbstractContainerSheetData, AbstractContainerSheetGURPS } from "@item/abstract-container/sheet.ts"
import { EquipmentGURPS } from "./document.ts"
import { ItemSheetOptions } from "@item/base/sheet.ts"

class EquipmentSheetGURPS extends AbstractContainerSheetGURPS<EquipmentGURPS> {
	override async getData(options?: Partial<ItemSheetOptions>): Promise<EquipmentSheetData> {
		const sheetData = await super.getData(options)

		return {
			...sheetData,
		}
	}
}
interface EquipmentSheetData extends AbstractContainerSheetData<EquipmentGURPS> {}

export { EquipmentSheetGURPS }
