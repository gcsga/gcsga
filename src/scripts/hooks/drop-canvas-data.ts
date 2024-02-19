import { ActorGURPS } from "@actor"
import { ActorSheetGURPS } from "@actor/base/sheet.ts"
import { DamagePayload, DropData } from "@module/apps/damage_calculator/damage_chat_message.ts"
import { TokenUtil } from "@util/token_utils.ts"

export const DropCanvasData = {
	listen: (): void => {
		Hooks.on("dropCanvasData", async (canvas: Canvas, data: DropCanvasData) => {
			const dropTarget = [...canvas.tokens!.placeables]
				.sort((a, b) => b.document.sort - a.document.sort)
				.filter(token => {
					const maximumX = token.x + (token.hitArea?.right ?? 0)
					const maximumY = token.y + (token.hitArea?.bottom ?? 0)
					return data.x >= token.x && data.y >= token.y && data.x <= maximumX && data.y <= maximumY
				})

			if (dropTarget.length === 0) return false

			const callback = async (token: Token | undefined): Promise<boolean> => {
				if (token && token.actor) {
					if (data.type === "Item") {
						await (token.actor.sheet as ActorSheetGURPS).emulateItemDrop(data as DropData)
						return false
					} else if (token.actor && data.type === "damage") {
						const actorGurps = token.actor as ActorGURPS
						const damagePayload = data as unknown as DamagePayload
						actorGurps.handleDamageDrop(damagePayload)
						return false
					}
				}
				return true
			}

			return dropTarget.length === 1
				? // If only one, use that one.
					await callback(dropTarget[0])
				: // Otherwise ask which one.
					await TokenUtil.askWhichToken(dropTarget, callback)
		})
	},
}
