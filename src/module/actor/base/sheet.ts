import { DamageChat } from "@module/damage_calculator/damage_chat_message"
import { DnD } from "@util/drag_drop"
import { ActorGURPS } from "@module/config"
import { LastActor } from "@util"
import { DocumentSheetConfigGURPS } from "./config"

type DispatchFunctions = Record<string, (arg: any) => void>

export class ActorSheetGURPS extends ActorSheet {
	declare object: ActorGURPS

	readonly dropDispatch: DispatchFunctions = {
		[DamageChat.TYPE]: this.actor.handleDamageDrop.bind(this.actor),
	}

	static override get defaultOptions(): ActorSheet.Options {
		const options = ActorSheet.defaultOptions
		mergeObject(options, {
			classes: ["gurps", "actor"],
		})
		return options
	}

	activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)
		html.on("click", () => LastActor.set(this.actor))
	}

	protected override _onDrop(event: DragEvent): void {
		if (!event?.dataTransfer) return

		let dragData = DnD.getDragData(event, DnD.TEXT_PLAIN)

		if (this.dropDispatch[dragData.type]) this.dropDispatch[dragData.type](dragData.payload)

		super._onDrop(event)
	}

	async emulateItemDrop(data: any) {
		const item = (await fromUuid(data.uuid)) as Item
		if (!item) return
		return this._onDropItemCreate({ ...item.toObject() } as any)
	}

	protected _getHeaderButtons(): Application.HeaderButton[] {
		const all_buttons = super._getHeaderButtons()
		all_buttons.at(-1)!.label = ""
		all_buttons.at(-1)!.icon = "gcs-circled-x"
		return all_buttons
	}

	protected override _onConfigureSheet(event: JQuery.ClickEvent<any, any, any, any>): void {
		event.preventDefault()
		new DocumentSheetConfigGURPS(this.document, {
			top: this.position.top! + 40,
			left: this.position.left! + (this.position.width! - DocumentSheet.defaultOptions.width!) / 2,
		}).render(true)
	}
}
