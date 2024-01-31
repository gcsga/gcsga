import { ActorGURPS } from "@actor/base.ts"
import { SYSTEM_NAME } from "@module/data/index.ts"
import { TokenDocumentGURPS } from "@module/canvas/token/document.ts"
import { UserFlags } from "@module/user/data.ts"
import { ActorType } from "@actor"

export class LastActor {
	static async set(actor: ActorGURPS, token?: TokenDocument): Promise<void> {
		if (actor.type === ActorType.Loot) return
		await game.user?.setFlag(SYSTEM_NAME, UserFlags.LastActor, actor.uuid)
		if (token) await game.user?.setFlag(SYSTEM_NAME, UserFlags.LastToken, token.uuid)
		await game.gurps.modifierBucket.render()
	}

	static async get(): Promise<ActorGURPS | null> {
		const uuid: string = game.user?.flags[SYSTEM_NAME]?.[UserFlags.LastActor] || ""
		let actor = (await fromUuid(uuid)) as ActorGURPS | TokenDocument
		if (actor instanceof TokenDocument) actor = actor.actor as ActorGURPS
		if (actor) return actor
		return null
	}

	static async getToken(): Promise<TokenDocument | null> {
		const uuid: string = game.user?.flags[SYSTEM_NAME]?.[UserFlags.LastToken] || ""
		const token: TokenDocumentGURPS | null = (await fromUuid(uuid)) as TokenDocumentGURPS | null
		if (token) return token
		return null
	}

	static async clear(): Promise<void> {
		game.user?.setFlag(SYSTEM_NAME, UserFlags.LastActor, null)
	}
}
