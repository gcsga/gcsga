import { ActorType, SYSTEM_NAME, UserFlags } from "@data"
import { ActorGURPS2 } from "@module/document/actor.ts"
import { TokenDocumentGURPS } from "@module/document/token.ts"

export class LastActor {
	static async set(actor: ActorGURPS2, token?: TokenDocumentGURPS): Promise<void> {
		if (!actor.isOwner) {
			console.warn(`${game.user.name} does not have ownership of ${actor.name}`)
			return
		}
		if (actor.type === ActorType.Loot) return
		await game.user?.setFlag(SYSTEM_NAME, UserFlags.LastActor, actor.uuid)
		GURPS.LastActor = actor
		if (token) {
			await game.user?.setFlag(SYSTEM_NAME, UserFlags.LastToken, token.uuid)
			GURPS.LastToken = token
		}
		game.gurps.modifierBucket.render()
	}

	static async get(): Promise<ActorGURPS2 | null> {
		const uuid: string = game.user.flags[SYSTEM_NAME]?.[UserFlags.LastActor] || ""
		let actor = (await fromUuid(uuid)) as ActorGURPS2 | TokenDocument
		if (actor instanceof TokenDocument) actor = actor.actor as ActorGURPS2
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
