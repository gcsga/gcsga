import { LootGURPS } from "@actor"
import { ActorSheetDataGURPS, ActorSheetGURPS } from "@actor/base/sheet.ts"

class LootSheetGURPS<TActor extends LootGURPS> extends ActorSheetGURPS<TActor> {
	override async getData(options?: ActorSheetOptions): Promise<LootSheetData<TActor>> {
		const sheetData = await super.getData(options)
		return {
			...sheetData,
		}
	}
}

interface LootSheetData<TActor extends LootGURPS = LootGURPS> extends ActorSheetDataGURPS<TActor> {}

export { LootSheetGURPS }
export type { LootSheetData }
