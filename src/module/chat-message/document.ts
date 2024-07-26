import { ChatMessageFlagsGURPS } from "./data.ts"

class ChatMessageGURPS extends ChatMessage { }

interface ChatMessageGURPS extends ChatMessage {
	flags: ChatMessageFlagsGURPS
}

export { ChatMessageGURPS }
