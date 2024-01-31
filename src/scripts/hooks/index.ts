export const HooksGURPS = {
	listen(): void {
		const listeners: { listen(): void }[] = [
			Load,
			CanvaasInit,
			CanvasReady,
			DiceSoNiceReady,
			DiceSoNiceRollStart,
			I18nInit,
			Init,
			Ready,
			Setup,
		]
		for (const Listener of listeners) {
			Listener.listen()
		}
	},
}
