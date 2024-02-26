import { MeleeWeaponGURPS } from "./document.ts"
import { ItemSheetDataGURPS, ItemSheetGURPS, ItemSheetOptions } from "@item/base/sheet.ts"

class MeleeWeaponSheetGURPS extends ItemSheetGURPS<MeleeWeaponGURPS> {
	override async getData(options?: Partial<ItemSheetOptions>): Promise<MeleeWeaponSheetData> {
		const sheetData = await super.getData(options)

		return {
			...sheetData,
		}
	}
}
interface MeleeWeaponSheetData extends ItemSheetDataGURPS<MeleeWeaponGURPS> {}

export { MeleeWeaponSheetGURPS }
