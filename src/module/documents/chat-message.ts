import { SYSTEM_NAME } from "@module/data/constants.ts"
import { RollModifierSchema } from "@module/data/roll-modifier.ts"

class ChatMessageGURPS extends ChatMessage {
	override async getHTML(): Promise<JQuery<HTMLElement>> {
		const html = await super.getHTML()

		this._enrichChatCard(html[0])

		return html
	}

	protected _enrichChatCard(_html: HTMLElement): void {}
}

interface ChatMessageGURPS extends ChatMessage {
	flags: ChatMessageFlagsGURPS
}

enum ChatMessageFlagKey {
	Transfer = "transfer",
	RollModifiers = "rollModifiers",
}

type ChatMessageFlagsGURPS = foundry.documents.ChatMessageFlags & {
	[SYSTEM_NAME]: {
		// Is this chat message a roll?
		// Used for damage chat transfers
		[ChatMessageFlagKey.Transfer]?: string
		[ChatMessageFlagKey.RollModifiers]?: DeepPartial<SourceFromSchema<RollModifierSchema>>[]
	}
}

export { ChatMessageGURPS, ChatMessageFlagKey }
