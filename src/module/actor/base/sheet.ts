import { ItemGURPS } from "@item"
import { ActorGURPS } from "./document.ts"
import { DamagePayload, DropDataType } from "@module/apps/damage-calculator/damage-chat-message.ts"

type DispatchFunctions = Record<string, (arg: DamagePayload) => void>

/**
 * Extend the basic ActorSheet class for GURPS functionality
 * This sheet is an Abstract layer which is not used.
 * @category Actor
 */
abstract class ActorSheetGURPS<TActor extends ActorGURPS> extends ActorSheet<TActor, ItemGURPS> {
	static override get defaultOptions(): ActorSheetOptions {
		const data = super.defaultOptions
		data.classes.push("actor", "gurps")
		return data
	}

	readonly dropDispatch: DispatchFunctions = {
		[DropDataType.Damage]: this.actor.handleDamageDrop.bind(this.actor),
	}

	override async getData(options: Partial<ActorSheetOptions> = this.options): Promise<ActorSheetDataGURPS<TActor>> {
		const sheetData = await super.getData(options as ActorSheetOptions)
		return {
			...sheetData,
		}
	}
}

interface ActorSheetGURPS<TActor extends ActorGURPS> extends ActorSheet<TActor, ItemGURPS> {}

interface ActorSheetDataGURPS<TActor extends ActorGURPS> extends ActorSheetData<TActor> {}

export { ActorSheetGURPS }
export type { ActorSheetDataGURPS }
