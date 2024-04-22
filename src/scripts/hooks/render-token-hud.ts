// import { TokenHUDGURPS } from "@module/canvas/index.ts"

export const RenderTokenHUD = {
	listen: (): void => {
		Hooks.on("renderTokenHUD", (_app, $html, data) => {
			console.log(_app, $html[0], data)
			// TokenHUDGURPS.onRenderTokenHUD($html[0], data)
		})
	},
}
