import { DamagePayload, DropData, DropDataType } from "@module/apps/damage-calculator/damage-chat-message.ts"
import Sortable from "sortablejs"

export const DnD = {
	TEXT_PLAIN: "text/plain",

	getDragData(event: DragEvent, format: string): DropData {
		return JSON.parse(event.dataTransfer!.getData(format) ?? "")
	},

	getSortableDragData(event: Sortable.SortableEvent & { originalEvent?: DragEvent }, format: string): DropData {
		return JSON.parse(event.originalEvent?.dataTransfer?.getData(format) ?? "")
	},

	setDragData(event: DragEvent, type: DropDataType, payload: DamagePayload, format: string): void {
		event.dataTransfer!.setData(format, JSON.stringify({ type: type, payload: payload }))
	},
}
