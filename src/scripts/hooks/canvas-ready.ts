/** This runs after game data has been requested and loaded from the servers, so entities exist */
export const CanvasReady = {
	listen: (): void => {
		Hooks.on("canvasReady", () => {
			// Effect Panel singleton application
			game.gurps.effectPanel.render(true)
			if (!canvas.scene) return

			if (game.ready) canvas.scene.reset()
			// Accomodate hex grid play with a usable default cone angle
			// CONFIG.MeasuredTemplate.defaults.angle = canvas.scene.hasHexGrid ? 60 : 90

			for (const token of canvas.tokens.placeables.filter(t => t.visible)) {
				token.renderFlags.set({ redrawEffects: true })
			}
		})
	},
}
