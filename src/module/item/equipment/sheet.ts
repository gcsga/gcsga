import { AbstractContainerSheetData, AbstractContainerSheetGURPS } from "@item/abstract-container/sheet.ts"
import { EquipmentGURPS } from "./document.ts"
import { ItemSheetOptions } from "@item/base/sheet.ts"
import { SYSTEM_NAME } from "@module/data/constants.ts"

class EquipmentSheetGURPS extends AbstractContainerSheetGURPS<EquipmentGURPS> {
	override get template(): string {
		return `systems/${SYSTEM_NAME}/templates/item/equipment/sheet.hbs`
	}

	override async getData(options?: Partial<ItemSheetOptions>): Promise<EquipmentSheetData> {
		const sheetData = await super.getData(options)

		return {
			...sheetData,
		}
	}
}
interface EquipmentSheetData extends AbstractContainerSheetData<EquipmentGURPS> {}

export { EquipmentSheetGURPS }
