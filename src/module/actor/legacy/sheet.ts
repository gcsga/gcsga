// import { LegacyCharacterGURPS } from "@actor"
// import { ActorSheetDataGURPS, ActorSheetGURPS } from "@actor/base/sheet.ts"
//
// class LegacyCharacterSheetGURPS<TActor extends LegacyCharacterGURPS> extends ActorSheetGURPS<TActor> {
// 	override async getData(options?: ActorSheetOptions): Promise<LegacyCharacterSheetData<TActor>> {
// 		const sheetData = await super.getData(options)
// 		return {
// 			...sheetData,
// 		}
// 	}
// }
//
// interface LegacyCharacterSheetData<TActor extends LegacyCharacterGURPS = LegacyCharacterGURPS>
// 	extends ActorSheetDataGURPS<TActor> {}
//
// export { LegacyCharacterSheetGURPS }
// export type { LegacyCharacterSheetData }
