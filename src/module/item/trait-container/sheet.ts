// import { AbstractContainerSheetData, AbstractContainerSheetGURPS } from "@item/abstract-container/sheet.ts"
// import { TraitContainerGURPS } from "./document.ts"
// import { ItemSheetOptions } from "@item/base/sheet.ts"
// import { SYSTEM_NAME } from "@module/data/constants.ts"
//
// class TraitContainerSheetGURPS extends AbstractContainerSheetGURPS<TraitContainerGURPS> {
// 	override get template(): string {
// 		return `systems/${SYSTEM_NAME}/templates/item/trait-container/sheet.hbs`
// 	}
//
// 	override async getData(options?: Partial<ItemSheetOptions>): Promise<TraitContainerSheetData> {
// 		const sheetData = await super.getData(options)
//
// 		return {
// 			...sheetData,
// 		}
// 	}
// }
// interface TraitContainerSheetData extends AbstractContainerSheetData<TraitContainerGURPS> {}
//
// export { TraitContainerSheetGURPS }
