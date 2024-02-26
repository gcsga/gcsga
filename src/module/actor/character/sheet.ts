import { CharacterGURPS } from "@actor"
import { ActorSheetDataGURPS, ActorSheetGURPS } from "@actor/base/sheet.ts"

class CharacterSheetGURPS<TActor extends CharacterGURPS> extends ActorSheetGURPS<TActor> {
	override async getData(options?: ActorSheetOptions): Promise<CharacterSheetData<TActor>> {
		const sheetData = await super.getData(options)
		return {
			...sheetData,
		}
	}
}

interface CharacterSheetData<TActor extends CharacterGURPS = CharacterGURPS> extends ActorSheetDataGURPS<TActor> {}

export { CharacterSheetGURPS }
export type { CharacterSheetData }
