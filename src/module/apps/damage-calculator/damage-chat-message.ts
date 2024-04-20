import { DiceGURPS } from "@module/dice/index.ts"
import { RollModifier, SYSTEM_NAME } from "@data"
import { DnD } from "@util/drag-drop.ts"
import { ChatMessageGURPS } from "@module/chat-message/index.ts"
import { DAMAGE_TYPE } from "./damage-type.ts"
import { ChatMessageSource } from "types/foundry/common/documents/module.js"

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
	ranged: boolean
	range: { max: number; half: number }
}

export enum DropDataType {
	Damage = "damage",
	Item = "Item",
	Attribute = "attribute",
	Effect = "effect",
	ResourceTracker = "resourceTracker",
	AttributeThreshold = "attributeThreshold",
	ResourceTrackerThreshold = "resourceTrackerThreshold",
	HitLocation = "hitLocation",
	SubTable = "subTable",
	MoveType = "moveType",
	MoveTypeOverride = "moveTypeOverride",
}

export interface DropDataDamage {
	type: DropDataType.Damage
	x: number
	y: number
	payload: DamagePayload
}

export interface DropDataItem {
	type: DropDataType.Item
	x: number
	y: number
	uuid: ItemUUID
}

export interface DropDataEffect {
	type: DropDataType.Effect
	x: number
	y: number
	order: number
	index: number
}

export interface DropDataAttribute {
	type: DropDataType.Attribute
	x: number
	y: number
	order: number
	index: number
	parentIndex: number
}

export interface DropDataAttributeThreshold {
	type: DropDataType.AttributeThreshold
	x: number
	y: number
	order: number
	index: number
	parentIndex: number
}

export interface DropDataResourceTracker {
	type: DropDataType.ResourceTracker
	x: number
	y: number
	order: number
	index: number
	parentIndex: number
}

export interface DropDataResourceTrackerThreshold {
	type: DropDataType.ResourceTrackerThreshold
	x: number
	y: number
	order: number
	index: number
	parentIndex: number
}

export interface DropDataMoveType {
	type: DropDataType.MoveType
	x: number
	y: number
	order: number

	index: number
	parentIndex: number
}

export interface DropDataMoveTypeOverride {
	type: DropDataType.MoveTypeOverride
	x: number
	y: number
	order: number
	index: number
	parentIndex: number
}

export interface DropDataHitLocation {
	type: DropDataType.HitLocation
	x: number
	y: number
	order: number
	index: number
}

export interface DropDataSubTable {
	type: DropDataType.SubTable
	x: number
	y: number
	order: number
	index: number
}

export type DropData =
	| DropDataDamage
	| DropDataItem
	| DropDataEffect
	| DropDataAttribute
	| DropDataAttributeThreshold
	| DropDataResourceTracker
	| DropDataResourceTrackerThreshold
	| DropDataMoveType
	| DropDataMoveTypeOverride
	| DropDataHitLocation
	| DropDataSubTable

export class DamageChat {
	/*
	 * ChatMessage will contain a user flag named "flags.gurps.transfer". Convert that to an object and retrieve
	 * the "payload" property. This is the data that will be used to construct a DamageRoll and DamageTargem needed
	 * by the Damage Calculator. When the dragSection is dragged, attach the payload to the event's dataTransfer
	 * object.
	 */
	static async renderChatMessage(app: ChatMessage, html: JQuery<HTMLElement>, _msg: object): Promise<boolean> {
		// TODO Find a way to identify elements not tied to their appearance (data attributes, for example).
		if (!html.find(".dice-roll.damage").length) return true

		const transfer = JSON.parse(DamageChat.getTransferFlag(app as ChatMessageGURPS))
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
		object: DeepPartial<ChatMessageSource>,
		payload: Partial<DamagePayload>,
		userTarget: string,
	): DeepPartial<ChatMessageSource> {
		const transfer = JSON.stringify({ type: DropDataType.Damage, payload: payload, userTarget: userTarget })
		fu.setProperty(object, `flags.${SYSTEM_NAME}.${DamageChatFlags.Transfer}`, transfer)
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
}
