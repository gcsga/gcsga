import { EquipmentModifierGURPS } from "./document.ts"
import { ItemSheetDataGURPS, ItemSheetGURPS, ItemSheetOptions } from "@item/base/sheet.ts"

class EquipmentModifierSheetGURPS extends ItemSheetGURPS<EquipmentModifierGURPS> {
	override async getData(options?: Partial<ItemSheetOptions>): Promise<EquipmentModifierSheetData> {
		const sheetData = await super.getData(options)

		return {
			...sheetData,
		}
	}
}
interface EquipmentModifierSheetData extends ItemSheetDataGURPS<EquipmentModifierGURPS> {}

export { EquipmentModifierSheetGURPS }
