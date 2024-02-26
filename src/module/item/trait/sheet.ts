import { AbstractContainerSheetData, AbstractContainerSheetGURPS } from "@item/abstract-container/sheet.ts"
import { TraitGURPS } from "./document.ts"
import { ItemSheetOptions } from "@item/base/sheet.ts"

class TraitSheetGURPS extends AbstractContainerSheetGURPS<TraitGURPS> {
	override async getData(options?: Partial<ItemSheetOptions>): Promise<TraitSheetData> {
		const sheetData = await super.getData(options)

		return {
			...sheetData,
		}
	}
}
interface TraitSheetData extends AbstractContainerSheetData<TraitGURPS> {}

export { TraitSheetGURPS }
