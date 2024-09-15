// import { AbstractContainerSheetData, AbstractContainerSheetGURPS } from "@item/abstract-container/sheet.ts"
// import { TraitGURPS } from "./document.ts"
// import { ItemSheetOptions } from "@item/base/sheet.ts"
// import { SYSTEM_NAME } from "@module/data/constants.ts"
// import { objectHasKey } from "@util"
//
// class TraitSheetGURPS extends AbstractContainerSheetGURPS<TraitGURPS> {
// 	override get template(): string {
// 		return `systems/${SYSTEM_NAME}/templates/item/trait/sheet.hbs`
// 	}
//
// 	override async getData(options?: Partial<ItemSheetOptions>): Promise<TraitSheetData> {
// 		const sheetData = await super.getData(options)
//
// 		return {
// 			...sheetData,
// 		}
// 	}
//
// 	protected override async _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
// 		if (objectHasKey(formData, "system.disabled")) {
// 			formData["system.disabled"] = !formData["system.disabled"]
// 		}
// 		return super._updateObject(event, formData)
// 	}
// }
// interface TraitSheetData extends AbstractContainerSheetData<TraitGURPS> {}
//
// export { TraitSheetGURPS }
