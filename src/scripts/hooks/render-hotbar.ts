import { ModifierBucket } from "@module/applications/modifier-bucket.ts"

export const RenderHotbar = {
	listen: (): void => {
		Hooks.on("renderHotbar", (_hotbar: Hotbar, element: JQuery<HTMLElement>, _options: unknown) => {
			game.gurps.mb = new ModifierBucket({})
			game.gurps.mb.render(true)
			// if (!game.gurps.modifierBucket) return
			// game.gurps.modifierBucket._injectHTML(element.parent("#ui-bottom"))
			// game.gurps.modifierBucket.render(true)
		})
	},
}
