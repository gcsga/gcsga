import { DamageChat } from "@module/apps/damage-calculator/damage-chat-message.ts"
// import { ChatUtilGURPS } from "@module/util/index.ts"

export const RenderChatMessage = {
	listen: (): void => {
		// Hooks.on("renderChatMessage", (_app, html, _data) => ChatUtilGURPS.addChatListeners(html))
		Hooks.on("renderChatMessage", (_app, html, _data) => DamageChat.renderChatMessage(_app, html, _data))
	},
}
