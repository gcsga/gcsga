// import { SYSTEM_NAME } from "@module/data/constants.ts"
// import { NoteGURPS } from "./document.ts"
// import { ItemSheetDataGURPS, ItemSheetGURPS, ItemSheetOptions } from "@item/base/sheet.ts"
//
// class NoteSheetGURPS extends ItemSheetGURPS<NoteGURPS> {
// 	override get template(): string {
// 		return `systems/${SYSTEM_NAME}/templates/item/note/sheet.hbs`
// 	}
//
// 	override async getData(options?: Partial<ItemSheetOptions>): Promise<NoteSheetData> {
// 		const sheetData = await super.getData(options)
//
// 		return {
// 			...sheetData,
// 		}
// 	}
// }
// interface NoteSheetData extends ItemSheetDataGURPS<NoteGURPS> {}
//
// export { NoteSheetGURPS }
