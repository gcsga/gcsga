import { EffectGURPS } from "./document.ts"
import { ItemSheetDataGURPS, ItemSheetGURPS, ItemSheetOptions } from "@item/base/sheet.ts"

class EffectSheetGURPS extends ItemSheetGURPS<EffectGURPS> {
	override async getData(options?: Partial<ItemSheetOptions>): Promise<EffectSheetData> {
		const sheetData = await super.getData(options)

		return {
			...sheetData,
		}
	}
}
interface EffectSheetData extends ItemSheetDataGURPS<EffectGURPS> {}

export { EffectSheetGURPS }
