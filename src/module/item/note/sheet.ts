import { NoteGURPS } from "./document.ts"
import { ItemSheetDataGURPS, ItemSheetGURPS, ItemSheetOptions } from "@item/base/sheet.ts"

class NoteSheetGURPS extends ItemSheetGURPS<NoteGURPS> {
	override async getData(options?: Partial<ItemSheetOptions>): Promise<NoteSheetData> {
		const sheetData = await super.getData(options)

		return {
			...sheetData,
		}
	}
}
interface NoteSheetData extends ItemSheetDataGURPS<NoteGURPS> {}

export { NoteSheetGURPS }
