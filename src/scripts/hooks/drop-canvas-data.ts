import { ActorSheetGURPS } from "@actor/base/sheet.ts"
import { DropData } from "@module/apps/damage_calculator/damage_chat_message.ts"

export const DropCanvasData = {
	listen: (): void => {
		Hooks.on("dropCanvasData", async (canvas: Canvas, data: DropCanvasData) => {
			const dropTarget = [...canvas.tokens!.placeables]
				.sort((a, b) => b.document.sort - a.document.sort)
				.find(token => {
					const maximumX = token.x + (token.hitArea?.right ?? 0)
					const maximumY = token.y + (token.hitArea?.bottom ?? 0)
					return data.x >= token.x && data.y >= token.y && data.x <= maximumX && data.y <= maximumY
				})

			const actor = dropTarget?.actor
			if (actor && data.type === "Item") {
				await (actor.sheet as ActorSheetGURPS).emulateItemDrop(data as DropData)
				return false
			}

			return false
		})
	},
}
