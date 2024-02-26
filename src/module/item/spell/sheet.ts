import { AbstractContainerSheetData, AbstractContainerSheetGURPS } from "@item/abstract-container/sheet.ts"
import { SpellGURPS } from "./document.ts"
import { ItemSheetOptions } from "@item/base/sheet.ts"

class SpellSheetGURPS extends AbstractContainerSheetGURPS<SpellGURPS> {
	override async getData(options?: Partial<ItemSheetOptions>): Promise<SpellSheetData> {
		const sheetData = await super.getData(options)

		return {
			...sheetData,
		}
	}
}
interface SpellSheetData extends AbstractContainerSheetData<SpellGURPS> {}

export { SpellSheetGURPS }
