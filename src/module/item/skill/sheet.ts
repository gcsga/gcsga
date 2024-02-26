import { AbstractContainerSheetData, AbstractContainerSheetGURPS } from "@item/abstract-container/sheet.ts"
import { SkillGURPS } from "./document.ts"
import { ItemSheetOptions } from "@item/base/sheet.ts"

class SkillSheetGURPS extends AbstractContainerSheetGURPS<SkillGURPS> {
	override async getData(options?: Partial<ItemSheetOptions>): Promise<SkillSheetData> {
		const sheetData = await super.getData(options)

		return {
			...sheetData,
		}
	}
}
interface SkillSheetData extends AbstractContainerSheetData<SkillGURPS> {}

export { SkillSheetGURPS }
