// import { AbstractContainerSheetData, AbstractContainerSheetGURPS } from "@item/abstract-container/sheet.ts"
// import { SkillContainerGURPS } from "./document.ts"
// import { ItemSheetOptions } from "@item/base/sheet.ts"
// import { SYSTEM_NAME } from "@module/data/constants.ts"
//
// class SkillContainerSheetGURPS extends AbstractContainerSheetGURPS<SkillContainerGURPS> {
// 	override get template(): string {
// 		return `systems/${SYSTEM_NAME}/templates/item/skill-container/sheet.hbs`
// 	}
//
// 	override async getData(options?: Partial<ItemSheetOptions>): Promise<SkillContainerSheetData> {
// 		const sheetData = await super.getData(options)
//
// 		return {
// 			...sheetData,
// 		}
// 	}
// }
// interface SkillContainerSheetData extends AbstractContainerSheetData<SkillContainerGURPS> {}
//
// export { SkillContainerSheetGURPS }
