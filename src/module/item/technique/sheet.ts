import { AbstractContainerSheetData, AbstractContainerSheetGURPS } from "@item/abstract-container/sheet.ts"
import { TechniqueGURPS } from "./document.ts"
import { ItemSheetOptions } from "@item/base/sheet.ts"
import { SYSTEM_NAME } from "@module/data/constants.ts"

class TechniqueSheetGURPS extends AbstractContainerSheetGURPS<TechniqueGURPS> {
	override get template(): string {
		return `systems/${SYSTEM_NAME}/templates/item/technique/sheet.hbs`
	}

	override async getData(options?: Partial<ItemSheetOptions>): Promise<TechniqueSheetData> {
		const sheetData = await super.getData(options)

		return {
			...sheetData,
		}
	}
}
interface TechniqueSheetData extends AbstractContainerSheetData<TechniqueGURPS> {}

export { TechniqueSheetGURPS }
