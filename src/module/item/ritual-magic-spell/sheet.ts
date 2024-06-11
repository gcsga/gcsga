import { AbstractContainerSheetData, AbstractContainerSheetGURPS } from "@item/abstract-container/sheet.ts"
import { RitualMagicSpellGURPS } from "./document.ts"
import { ItemSheetOptions } from "@item/base/sheet.ts"

class RitualMagicSpellSheetGURPS extends AbstractContainerSheetGURPS<RitualMagicSpellGURPS> {
	override async getData(options?: Partial<ItemSheetOptions>): Promise<RitualMagicSpellSheetData> {
		const sheetData = await super.getData(options)

		return {
			...sheetData,
		}
	}
}
interface RitualMagicSpellSheetData extends AbstractContainerSheetData<RitualMagicSpellGURPS> {}

export { RitualMagicSpellSheetGURPS }
