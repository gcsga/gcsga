import { ItemSheetDataGURPS, ItemSheetGURPS, ItemSheetOptions } from "@item/base/sheet.ts"
import { SYSTEM_NAME } from "@module/data/constants.ts"
import { TraitModifierGURPS } from "./document.ts"

class TraitModifierSheetGURPS extends ItemSheetGURPS<TraitModifierGURPS> {
	override get template(): string {
		return `systems/${SYSTEM_NAME}/templates/item/trait-modifier/sheet.hbs`
	}

	override async getData(options?: Partial<ItemSheetOptions>): Promise<TraitModifierSheetData> {
		const sheetData = await super.getData(options)

		return {
			...sheetData,
		}
	}
}
interface TraitModifierSheetData extends ItemSheetDataGURPS<TraitModifierGURPS> {}

export { TraitModifierSheetGURPS }
