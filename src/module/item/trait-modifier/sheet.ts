// import { ItemSheetDataGURPS, ItemSheetGURPS, ItemSheetOptions } from "@item/base/sheet.ts"
// import { SYSTEM_NAME } from "@module/data/constants.ts"
// import { TraitModifierGURPS } from "./document.ts"
// import { objectHasKey } from "@util"
//
// class TraitModifierSheetGURPS extends ItemSheetGURPS<TraitModifierGURPS> {
// 	override get template(): string {
// 		return `systems/${SYSTEM_NAME}/templates/item/trait-modifier/sheet.hbs`
// 	}
//
// 	override async getData(options?: Partial<ItemSheetOptions>): Promise<TraitModifierSheetData> {
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
// interface TraitModifierSheetData extends ItemSheetDataGURPS<TraitModifierGURPS> {}
//
// export { TraitModifierSheetGURPS }
