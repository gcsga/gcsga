// import { AddModifier } from "./add-modifier.ts"
// import { CanvasReady } from "./canvas-ready.ts"
// import { ChatMessage } from "./chat-message.ts"
// import { DropCanvasData } from "./drop-canvas-data.ts"
import { I18nInit } from "./i18n-init.ts"
import { Init } from "./init.ts"
import { Load } from "./load.ts"
import { Ready } from "./ready.ts"
import { RenderChatMessage } from "./render-chat-message.ts"
// import { RenderHotbar } from "./render-hotbar.ts"
// import { RenderPlayerList } from "./render-player-list.ts"
// import { RenderTokenHUD } from "./render-token-hud.ts"
import { QuenchReady } from "./quench-ready.ts"
import { Setup } from "./setup.ts"

export const HooksGURPS = {
	listen(): void {
		const listeners: { listen(): void }[] = [
			Load,
			// CanvasReady,
			I18nInit,
			Init,
			Ready,
			Setup,
			// ChatMessage,
			RenderChatMessage,
			// DropCanvasData,
			// RenderPlayerList,
			// RenderHotbar,
			// AddModifier,
			QuenchReady,
			// RenderTokenHUD,
		]
		for (const Listener of listeners) {
			Listener.listen()
		}
	},
}
