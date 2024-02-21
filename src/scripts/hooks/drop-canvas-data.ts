import { ActorGURPS } from "@actor"
import { TokenUtil } from "@util/token_utils.ts"
import { DropData, DropDataType } from "@module/apps/damage_calculator/damage_chat_message.ts"
import { CanvasUtil } from "@util/canvas.ts"

export const DropCanvasData = {
	listen: (): void => {
		Hooks.on("dropCanvasData", async (canvas: Canvas, data: DropCanvasData) => {
			const dropTargets = CanvasUtil.getCanvasTokensAtPosition(canvas, { x: data.x, y: data.y })

			if (dropTargets.length === 0) return false

			const handleDropEvent = async (token: Token | undefined): Promise<boolean> => {
				if (token && token.actor) {
					const actorGurps = token.actor as ActorGURPS
					const dropData = data as DropData
					switch (dropData.type) {
						case DropDataType.Item:
							actorGurps.sheet.emulateItemDrop(dropData)
							return false
						case DropDataType.Damage:
							actorGurps.handleDamageDrop(dropData.payload)
							return false
					}
				}
				return true
			}

			return dropTargets.length === 1
				? // If only one, use that one.
					await handleDropEvent(dropTargets[0])
				: // Otherwise ask which one.
					await TokenUtil.askWhichToken(dropTargets, handleDropEvent)
		})
	},
}
