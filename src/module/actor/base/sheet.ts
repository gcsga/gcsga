import { ActorGURPS } from "@actor"
import { ItemGURPS } from "@item/base/document.ts"
import { DamagePayload, DropData, DropDataType } from "@module/apps/damage_calculator/damage_chat_message.ts"
import { LastActor } from "@util"
import { DnD } from "@util/drag_drop.ts"
import { DocumentSheetConfigGURPS } from "./config.ts"

type DispatchFunctions = Record<string, (arg: DamagePayload) => void>

interface ActorSheetGURPS<TActor extends ActorGURPS = ActorGURPS> extends ActorSheet<TActor, ItemGURPS> {
	// config: CharacterSheetConfig | null
}

abstract class ActorSheetGURPS<TActor extends ActorGURPS = ActorGURPS> extends ActorSheet<TActor, ItemGURPS> {
	// config: CharacterSheetConfig | null = null

	readonly dropDispatch: DispatchFunctions = {
		[DropDataType.Damage]: this.actor.handleDamageDrop.bind(this.actor),
	}

	static override get defaultOptions(): ActorSheetOptions {
		const options = ActorSheet.defaultOptions
		fu.mergeObject(options, {
			classes: ["gurps", "actor"],
		})
		return options
	}

	override activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)
		html.on("click", () => LastActor.set(this.actor))
	}

	protected override _onDrop(event: DragEvent): Promise<boolean | void> {
		if (!event?.dataTransfer) return super._onDrop(event)

		const dragData = DnD.getDragData(event, DnD.TEXT_PLAIN)

		if (dragData.type === DropDataType.Damage) this.dropDispatch[dragData.type](dragData.payload)

		return super._onDrop(event)
	}

	async emulateItemDrop(data: DropData): Promise<Item[] | undefined> {
		if (data.type !== DropDataType.Item) return undefined
		const item = (await fromUuid(data.uuid)) as Item
		if (!item) return
		return this._onDropItemCreate({ ...item.toObject() })
	}

	protected override _getHeaderButtons(): ApplicationHeaderButton[] {
		const all_buttons = super._getHeaderButtons()
		all_buttons.at(-1)!.label = ""
		all_buttons.at(-1)!.icon = "gcs-circled-x"
		return all_buttons
	}

	protected override _onConfigureSheet(event: Event): void {
		event.preventDefault()
		new DocumentSheetConfigGURPS(this.document, {
			top: (this.position.top ?? 0) + 40,
			left:
				(this.position.left ?? 0) +
				((this.position.width ?? 0) - (Number(DocumentSheet.defaultOptions.width) ?? 0)) / 2,
		}).render(true)
	}
}

export { ActorSheetGURPS }
