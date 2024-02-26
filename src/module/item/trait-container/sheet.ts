import { AbstractContainerSheetData, AbstractContainerSheetGURPS } from "@item/abstract-container/sheet.ts"
import { TraitContainerGURPS } from "./document.ts"
import { ItemSheetOptions } from "@item/base/sheet.ts"

class TraitContainerSheetGURPS extends AbstractContainerSheetGURPS<TraitContainerGURPS> {
	override async getData(options?: Partial<ItemSheetOptions>): Promise<TraitContainerSheetData> {
		const sheetData = await super.getData(options)

		return {
			...sheetData,
		}
	}
}
interface TraitContainerSheetData extends AbstractContainerSheetData<TraitContainerGURPS> {}

export { TraitContainerSheetGURPS }
