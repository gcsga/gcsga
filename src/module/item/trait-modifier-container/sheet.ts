import { AbstractContainerSheetData, AbstractContainerSheetGURPS } from "@item/abstract-container/sheet.ts"
import { TraitModifierContainerGURPS } from "./document.ts"
import { ItemSheetOptions } from "@item/base/sheet.ts"

class TraitModifierContainerSheetGURPS extends AbstractContainerSheetGURPS<TraitModifierContainerGURPS> {
	override async getData(options?: Partial<ItemSheetOptions>): Promise<TraitModifierContainerSheetData> {
		const sheetData = await super.getData(options)

		return {
			...sheetData,
		}
	}
}
interface TraitModifierContainerSheetData extends AbstractContainerSheetData<TraitModifierContainerGURPS> {}

export { TraitModifierContainerSheetGURPS }
