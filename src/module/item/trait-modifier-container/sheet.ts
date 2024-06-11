import { AbstractContainerSheetData, AbstractContainerSheetGURPS } from "@item/abstract-container/sheet.ts"
import { TraitModifierContainerGURPS } from "./document.ts"
import { ItemSheetOptions } from "@item/base/sheet.ts"
import { SYSTEM_NAME } from "@module/data/constants.ts"

class TraitModifierContainerSheetGURPS extends AbstractContainerSheetGURPS<TraitModifierContainerGURPS> {
	override get template(): string {
		return `systems/${SYSTEM_NAME}/templates/item/trait-modifier-container/sheet.hbs`
	}

	override async getData(options?: Partial<ItemSheetOptions>): Promise<TraitModifierContainerSheetData> {
		const sheetData = await super.getData(options)

		return {
			...sheetData,
		}
	}
}
interface TraitModifierContainerSheetData extends AbstractContainerSheetData<TraitModifierContainerGURPS> {}

export { TraitModifierContainerSheetGURPS }
