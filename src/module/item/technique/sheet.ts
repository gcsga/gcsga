import { AbstractContainerSheetData, AbstractContainerSheetGURPS } from "@item/abstract-container/sheet.ts"
import { TechniqueGURPS } from "./document.ts"
import { ItemSheetOptions } from "@item/base/sheet.ts"

class TechniqueSheetGURPS extends AbstractContainerSheetGURPS<TechniqueGURPS> {
	override async getData(options?: Partial<ItemSheetOptions>): Promise<TechniqueSheetData> {
		const sheetData = await super.getData(options)

		return {
			...sheetData,
		}
	}
}
interface TechniqueSheetData extends AbstractContainerSheetData<TechniqueGURPS> {}

export { TechniqueSheetGURPS }
