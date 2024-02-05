export const RenderPlayerList = {
	listen: (): void => {
		Hooks.on("renderPlayerList", (_data: unknown, element: JQuery<HTMLElement>, _options: unknown) => {
			if (!game.gurps.modifierList) return
			game.gurps.modifierList._injectHTML(element.parent("#interface"))
			game.gurps.modifierList.render(true)
		})
	},
}
