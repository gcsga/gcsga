import { ActorGURPS } from "@actor"
import { ActorType, SYSTEM_NAME } from "@data"
import { UserFlags } from "@module/user/data.ts"
import { TokenDocumentGURPS } from "@scene/token-document/document.ts"

export class LastActor {
	static async set(actor: ActorGURPS, token?: TokenDocumentGURPS): Promise<void> {
		if (actor.type === ActorType.Loot) return
		await game.user?.setFlag(SYSTEM_NAME, UserFlags.LastActor, actor.uuid)
		GURPS.LastActor = actor
		if (token) {
			await game.user?.setFlag(SYSTEM_NAME, UserFlags.LastToken, token.uuid)
			GURPS.LastToken = token
		}
		game.gurps.modifierBucket.render()
	}

	static async get(): Promise<ActorGURPS | null> {
		const uuid: string = game.user.flags[SYSTEM_NAME]?.[UserFlags.LastActor] || ""
		let actor = (await fromUuid(uuid)) as ActorGURPS | TokenDocument
		if (actor instanceof TokenDocument) actor = actor.actor as ActorGURPS
		if (actor) return actor
		return null
	}

	static async getToken(): Promise<TokenDocumentGURPS | null> {
		const uuid: string = game.user?.flags[SYSTEM_NAME]?.[UserFlags.LastToken] || ""
		const token: TokenDocumentGURPS | null = (await fromUuid(uuid)) as TokenDocumentGURPS | null
		if (token) return token
		return null
	}

	static async clear(): Promise<void> {
		game.user?.setFlag(SYSTEM_NAME, UserFlags.LastActor, null)
		GURPS.LastActor = null
	}
}
