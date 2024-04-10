import { SYSTEM_NAME } from "@module/data/constants.ts"
import { EffectGURPS } from "./document.ts"
import { ItemSheetDataGURPS, ItemSheetOptions } from "@item/base/sheet.ts"
import { AbstractEffectSheetGURPS } from "@item/abstract-effect/sheet.ts"

class EffectSheetGURPS extends AbstractEffectSheetGURPS<EffectGURPS> {
	override get template(): string {
		return `systems/${SYSTEM_NAME}/templates/item/effect/sheet.hbs`
	}

	override async getData(options?: Partial<ItemSheetOptions>): Promise<EffectSheetData> {
		const sheetData = await super.getData(options)

		return {
			...sheetData,
		}
	}
}
interface EffectSheetData extends ItemSheetDataGURPS<EffectGURPS> {}

export { EffectSheetGURPS }
