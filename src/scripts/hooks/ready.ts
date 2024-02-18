import { SOCKET, SYSTEM_NAME } from "@data"
import { loadModifiers } from "@module/apps/mod_bucket/data.ts"
import { TokenHUDGURPS } from "@module/canvas/index.ts"
import { ColorSettings } from "@module/settings/colors.ts"
import { LastActor, getDefaultSkills } from "@util"

export const Ready = {
	listen: (): void => {
		Hooks.once("ready", async () => {
			// Do anything once the system is ready
			ColorSettings.applyColors()
			loadModifiers()
			getDefaultSkills()

			globalThis.GURPS = {
				LastActor: await LastActor.get(),
				LastToken: await LastActor.getToken(),
			}

			// ApplyDiceCSS()

			// Enable drag image
			const DRAG_IMAGE = document.createElement("div")
			DRAG_IMAGE.innerHTML = await renderTemplate(`systems/${SYSTEM_NAME}/templates/actor/drag-image.hbs`, {
				name: "",
				type: "",
			})
			DRAG_IMAGE.id = "drag-ghost"
			document.body.appendChild(DRAG_IMAGE)

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
						await game.gurps.modifierList.render()
						await game.gurps.modifierBucket.render()
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
