// import { AbstractContainerSheetData, AbstractContainerSheetGURPS } from "@item/abstract-container/sheet.ts"
// import { SkillGURPS } from "./document.ts"
// import { ItemSheetOptions } from "@item/base/sheet.ts"
// import { SYSTEM_NAME } from "@module/data/constants.ts"
//
// class SkillSheetGURPS extends AbstractContainerSheetGURPS<SkillGURPS> {
// 	override get template(): string {
// 		return `systems/${SYSTEM_NAME}/templates/item/skill/sheet.hbs`
// 	}
//
// 	override async getData(options?: Partial<ItemSheetOptions>): Promise<SkillSheetData> {
// 		const sheetData = await super.getData(options)
//
// 		return {
// 			...sheetData,
// 			sysPrefix: "system.",
// 		}
// 	}
// }
// interface SkillSheetData extends AbstractContainerSheetData<SkillGURPS> {
// 	sysPrefix: string
// }
//
// export { SkillSheetGURPS }
