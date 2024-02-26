import { TraitModifierGURPS } from "./document.ts"
import { ItemSheetDataGURPS, ItemSheetGURPS, ItemSheetOptions } from "@item/base/sheet.ts"

class TraitModifierSheetGURPS extends ItemSheetGURPS<TraitModifierGURPS> {
	override async getData(options?: Partial<ItemSheetOptions>): Promise<TraitModifierSheetData> {
		const sheetData = await super.getData(options)

		return {
			...sheetData,
		}
	}
}
interface TraitModifierSheetData extends ItemSheetDataGURPS<TraitModifierGURPS> {}

export { TraitModifierSheetGURPS }
