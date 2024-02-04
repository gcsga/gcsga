import { Chat } from "@util"

export const RenderChatMessage = {
	listen: (): void => {
		Hooks.on("renderChatMessage", (_app, html, _data) => Chat.addChatListeners(html))
	},
}
