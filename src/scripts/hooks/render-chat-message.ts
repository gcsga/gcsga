import { DamageChat } from "@module/apps/damage-calculator/damage-chat-message.ts"
import { Chat } from "@util"

export const RenderChatMessage = {
	listen: (): void => {
		Hooks.on("renderChatMessage", (_app, html, _data) => Chat.addChatListeners(html))
		Hooks.on("renderChatMessage", (_app, html, _data) => DamageChat.renderChatMessage(_app, html, _data))
	},
}
