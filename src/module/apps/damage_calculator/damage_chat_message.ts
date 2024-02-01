import { DiceGURPS } from "@module/dice/index.ts"
import { RollModifier } from "./injury_effect.ts"
import { SYSTEM_NAME } from "@module/data/misc.ts"
import { DnD } from "@util/drag_drop.ts"
import { CanvasUtil } from "@util/canvas.ts"
import { TokenUtil } from "@util/token_utils.ts"
import { setProperty } from "types/foundry/common/utils/helpers.js"
import { ChatMessageGURPS } from "@module/chat-message/index.ts"
import { ActorGURPS } from "@actor"
import { DAMAGE_TYPE } from "./damage_type.ts"

export enum DamageChatFlags {
	Transfer = "transfer",
}

export type DamageRoll = {
	total: number
	tooltip: string
	hitlocation: string
}

export type DamagePayload = {
	index: number
	name: string
	uuid: string
	attacker: string
	weaponID: string
	damage: string
	dice: DiceGURPS
	damageType: DAMAGE_TYPE
	armorDivisor: number
	damageModifier: string
	damageRoll: DamageRoll[]
	modifiers: (RollModifier & { class?: string })[]
	modifierTotal: number
}

export enum DropDataType {
	Damage = "damage",
	Item = "Item",
	Attributes = "attributes",
	Effects = "effects",
	ResourceTrackers = "resource_trackers",
	AttributeThresholds = "attribute_thresholds",
	TrackerThresholds = "tracker_thresholds",
	Locations = "locations",
	SubTable = "sub_table",
	MoveType = "move_types",
	Overrides = "override",
}

export type DropData =
	| { type: DropDataType.Damage; x: number; y: number; payload: DamagePayload }
	| { type: DropDataType.Item; x: number; y: number; uuid: ItemUUID }
	| { type: DropDataType.Attributes; x: number; y: number; order: number; index: number; parent_index: number }
	| { type: DropDataType.Effects; x: number; y: number; order: number; index: number }
	| { type: DropDataType.ResourceTrackers; x: number; y: number; order: number; index: number; parent_index: number }
	| {
			type: DropDataType.AttributeThresholds
			x: number
			y: number
			order: number
			index: number
			parent_index: number
	  }
	| { type: DropDataType.TrackerThresholds; x: number; y: number; order: number; index: number; parent_index: number }
	| { type: DropDataType.Locations; x: number; y: number; order: number; index: number }
	| { type: DropDataType.SubTable; x: number; y: number; order: number; index: number }
	| {
			type: DropDataType.MoveType
			x: number
			y: number
			order: number

			index: number
			parent_index: number
	  }
	| { type: DropDataType.Overrides; x: number; y: number; order: number; index: number; parent_index: number }

export class DamageChat {
	/*
	 * ChatMessage will contain a user flag named "flags.gurps.transfer". Convert that to an object and retrieve
	 * the "payload" property. This is the data that will be used to construct a DamageRoll and DamageTarget needed
	 * by the Damage Calculator. When the dragSection is dragged, attach the payload to the event's dataTransfer
	 * object.
	 */
	static async renderChatMessage(app: ChatMessageGURPS, html: JQuery<HTMLElement>, _msg: object): Promise<boolean> {
		// TODO Find a way to identify elements not tied to their appearance (data attributes, for example).
		if (!html.find(".dice-roll.damage").length) return true

		const transfer = JSON.parse(DamageChat.getTransferFlag(app))
		const payload = transfer.payload as DamagePayload

		payload.damageType = payload.damageType ?? "injury"

		const dragSections = html.find(".dice-total")
		for (const section of dragSections) {
			section.addEventListener("dragstart", DamageChat._dragStart.bind(this, payload))
			section.addEventListener("dragend", DamageChat._dragEnd.bind(this))
		}

		html.find(".dice-result").on("click", event => DamageChat._clickOnDiceResults(event))

		return false
	}

	static getTransferFlag(object: ChatMessageGURPS): string {
		return object.flags?.[SYSTEM_NAME]?.[DamageChatFlags.Transfer] ?? ""
	}

	static setTransferFlag(
		object: ChatMessageGURPS,
		payload: Partial<DamagePayload>,
		userTarget: string,
	): ChatMessageGURPS {
		const transfer = JSON.stringify({ type: DropDataType.Damage, payload: payload, userTarget: userTarget })
		setProperty(object, `flags.${SYSTEM_NAME}.${DamageChatFlags.Transfer}`, transfer)
		return object
	}

	static async _dragStart(payload: DamagePayload, event: DragEvent): Promise<void> {
		payload.index = $(event.currentTarget!).data("index")
		// payload.index = parseInt((event.currentTarget!).dataset.index)
		DnD.setDragData(event, DropDataType.Damage, payload, DnD.TEXT_PLAIN)
	}

	static async _dragEnd(_ev: DragEvent): Promise<void> {
		// Add any handling code here.
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	static async _clickOnDiceResults(event: JQuery.ClickEvent): Promise<void> {
		event.preventDefault()
		event.stopPropagation()

		// Toggle the message flag
		const roll = $(event.currentTarget)
		if (roll.hasClass("expanded")) {
			roll.toggleClass("expanded")
			roll.animate({ "grid-auto-rows": 7, "padding-bottom": 25 }, 200, "linear")
		} else {
			roll.animate({ "grid-auto-rows": 35, "padding-bottom": 0 }, 200, "linear", function () {
				roll.toggleClass("expanded")
			})
		}
	}

	static async handleDropOnCanvas(_canvas: Canvas, dropData: DropData): Promise<void> {
		if (dropData.type !== DropDataType.Damage) return

		if (dropData.payload.index === -1) {
			ui.notifications?.warn("Multiple damage rolls are not yet supported.")
			return
		}

		// Check to see what is under the cursor at this drop point
		const tokens = CanvasUtil.getCanvasTokensAtPosition({ x: dropData.x, y: dropData.y })

		if (tokens.length === 0) return

		// Define the handler function for damage.
		const handleDamageDrop = (actor: ActorGURPS) => actor.handleDamageDrop(dropData.payload)

		// If only one token in the targets array, use that one.
		if (tokens.length === 1) {
			handleDamageDrop(tokens[0].actor as ActorGURPS)
			return
		}

		const token = await TokenUtil.askWhichToken(tokens)
		if (token?.actor) handleDamageDrop(token.actor as ActorGURPS)
	}
}
