import { AbstractContainerSheetData, AbstractContainerSheetGURPS } from "@item/abstract-container/sheet.ts"
import { SpellContainerGURPS } from "./document.ts"
import { ItemSheetOptions } from "@item/base/sheet.ts"

class SpellContainerSheetGURPS extends AbstractContainerSheetGURPS<SpellContainerGURPS> {
	override async getData(options?: Partial<ItemSheetOptions>): Promise<SpellContainerSheetData> {
		const sheetData = await super.getData(options)

		return {
			...sheetData,
		}
	}
}
interface SpellContainerSheetData extends AbstractContainerSheetData<SpellContainerGURPS> {}

export { SpellContainerSheetGURPS }
