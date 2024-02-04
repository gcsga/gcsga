export const RenderHotbar = {
	listen: (): void => {
		Hooks.on("renderHotbar", (_hotbar: unknown, element: JQuery<HTMLElement>, _options: unknown) => {
			if (!game.gurps.modifierBucket) return
			game.gurps.modifierBucket._injectHTML(element.parent("#ui-bottom"))
			game.gurps.modifierBucket.render()
		})
	},
}
