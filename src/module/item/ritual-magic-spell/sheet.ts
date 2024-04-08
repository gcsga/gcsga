import { AbstractContainerSheetData, AbstractContainerSheetGURPS } from "@item/abstract-container/sheet.ts"
import { RitualMagicSpellGURPS } from "./document.ts"
import { ItemSheetOptions } from "@item/base/sheet.ts"
import { SYSTEM_NAME } from "@module/data/constants.ts"

class RitualMagicSpellSheetGURPS extends AbstractContainerSheetGURPS<RitualMagicSpellGURPS> {
	override get template(): string {
		return `systems/${SYSTEM_NAME}/templates/item/ritual-magic-spell/sheet.hbs`
	}

	override async getData(options?: Partial<ItemSheetOptions>): Promise<RitualMagicSpellSheetData> {
		const sheetData = await super.getData(options)

		return {
			...sheetData,
		}
	}
}
interface RitualMagicSpellSheetData extends AbstractContainerSheetData<RitualMagicSpellGURPS> {}

export { RitualMagicSpellSheetGURPS }
