import { CharacterGURPS } from "@actor"
import { ActorSheetGURPS } from "@actor/base/sheet.ts"

class MookSheetGURPS<TActor extends CharacterGURPS> extends ActorSheetGURPS<TActor> {
	// override async getData(options?: ActorSheetOptions): Promise<CharacterSheetData<TActor>> {
	// 	const sheetData = await super.getData(options)
	// 	return {
	// 		...sheetData,
	// 	}
	// }
}

export { MookSheetGURPS }
