import { AbstractContainerSheetData, AbstractContainerSheetGURPS } from "@item/abstract-container/sheet.ts"
import { TraitGURPS } from "./document.ts"
import { ItemSheetOptions } from "@item/base/sheet.ts"
import { SYSTEM_NAME } from "@module/data/constants.ts"

class TraitSheetGURPS extends AbstractContainerSheetGURPS<TraitGURPS> {
	override get template(): string {
		return `systems/${SYSTEM_NAME}/templates/item/trait/sheet.hbs`
	}

	override async getData(options?: Partial<ItemSheetOptions>): Promise<TraitSheetData> {
		const sheetData = await super.getData(options)

		return {
			...sheetData,
		}
	}
}
interface TraitSheetData extends AbstractContainerSheetData<TraitGURPS> {}

export { TraitSheetGURPS }
