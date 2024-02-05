import { DamagePayload, DropData, DropDataType } from "@module/apps/damage_calculator/damage_chat_message.ts"

export const DnD = {
	TEXT_PLAIN: "text/plain",

	getDragData(event: DragEvent, format: string): DropData {
		return JSON.parse(event.dataTransfer!.getData(format) ?? "")
	},

	setDragData(event: DragEvent, type: DropDataType, payload: DamagePayload, format: string): void {
		event.dataTransfer!.setData(format, JSON.stringify({ type: type, payload: payload }))
	},
}
