import { DamageChatFlags } from "@module/apps/damage_calculator/damage_chat_message.ts"
import { SYSTEM_NAME } from "@module/data/misc.ts"
import { ChatMessageFlags } from "types/foundry/common/documents/chat-message.js"

type ChatMessageFlagsGURPS = ChatMessageFlags & {
	[SYSTEM_NAME]: {
		[DamageChatFlags.Transfer]?: string
	}
}

export type { ChatMessageFlagsGURPS }
