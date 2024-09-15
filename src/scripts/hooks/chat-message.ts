// import { ChatUtilGURPS } from "@module/util/index.ts"

export const ChatMessage = {
	listen: (): void => {
		Hooks.on("chatMessage", (_app, message, _options) => {
			// return ChatUtilGURPS.processMessage(message)
		})
	},
}
