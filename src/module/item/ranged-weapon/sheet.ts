import { RangedWeaponGURPS } from "./document.ts"
import { ItemSheetDataGURPS, ItemSheetGURPS, ItemSheetOptions } from "@item/base/sheet.ts"

class RangedWeaponSheetGURPS extends ItemSheetGURPS<RangedWeaponGURPS> {
	override async getData(options?: Partial<ItemSheetOptions>): Promise<RangedWeaponSheetData> {
		const sheetData = await super.getData(options)

		return {
			...sheetData,
		}
	}
}
interface RangedWeaponSheetData extends ItemSheetDataGURPS<RangedWeaponGURPS> {}

export { RangedWeaponSheetGURPS }
