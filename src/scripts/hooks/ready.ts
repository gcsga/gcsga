import { SOCKET } from "@data"
import { loadModifiers } from "@module/apps/modifier-bucket/data.ts"
import { TokenHUDGURPS } from "@module/canvas/index.ts"
import { SetGameGURPS } from "@scripts/set-game-gurps.ts"
import { LastActor, evaluateToNumber } from "@util"
import { createDragImage } from "@util/drag-image.ts"
// import { ColorSettings } from "@module/settings/colors.ts"
// import { SetGameGURPS } from "@scripts/set-game-gurps.ts"
// import { LastActor, getDefaultSkills } from "@util"

export const Ready = {
	listen: (): void => {
		Hooks.once("ready", async () => {
			console.log("GURPS | Starting GURPS Game Aid")
			// Some of game.gurps must wait until the ready phase
			SetGameGURPS.onReady()

			// Do anything once the system is ready
			// ColorSettings.applyColors()
			loadModifiers()
			// getDefaultSkills()

			globalThis.GURPS = {
				LastActor: await LastActor.get(),
				LastToken: await LastActor.getToken(),
				eval: evaluateToNumber,
			}

			// ApplyDiceCSS()

			// Enable drag image
			createDragImage(null, null)

			// Set default user flag state
			if (canvas && canvas.hud) {
				canvas.hud.token = new TokenHUDGURPS()
			}

			CONFIG.Combat.initiative.decimals = 5
			// setInitiative()

			game.socket?.on("system.gcsga", async (response: Record<string, unknown>) => {
				switch (response.type as SOCKET) {
					case SOCKET.UPDATE_BUCKET:
						// Ui.notifications?.info(response.users)
						game.gurps.modifierList.render()
						game.gurps.modifierBucket.render()
						break
					case SOCKET.INITIATIVE_CHANGED:
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						CONFIG.Combat.initiative.formula = response.formula as any
						break
					default:
						return console.error("Unknown socket:", response.type)
				}
			})
		})
	},
}
