import { AbstractContainerSheetData, AbstractContainerSheetGURPS } from "@item/abstract-container/sheet.ts"
import { NoteContainerGURPS } from "./document.ts"
import { ItemSheetOptions } from "@item/base/sheet.ts"

class NoteContainerSheetGURPS extends AbstractContainerSheetGURPS<NoteContainerGURPS> {
	override async getData(options?: Partial<ItemSheetOptions>): Promise<NoteContainerSheetData> {
		const sheetData = await super.getData(options)

		return {
			...sheetData,
		}
	}
}
interface NoteContainerSheetData extends AbstractContainerSheetData<NoteContainerGURPS> {}

export { NoteContainerSheetGURPS }
