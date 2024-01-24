import { ActorGURPS } from "@module/config"
import { ActorType, SYSTEM_NAME, UserFlags } from "@module/data"
// Import { LocalizeGURPS } from "./localize"

export class LastActor {
	static async set(actor: ActorGURPS, token?: TokenDocument): Promise<void> {
		if (actor.type === ActorType.Loot) return
		await game.user?.setFlag(SYSTEM_NAME, UserFlags.LastActor, actor.uuid)
		if (token) await game.user?.setFlag(SYSTEM_NAME, UserFlags.LastToken, token.uuid)
		await game.ModifierBucket.render()
	}

	static async get(): Promise<ActorGURPS | null> {
		const uuid: string = game.user?.flags[SYSTEM_NAME][UserFlags.LastActor] || ""
		let actor = (await fromUuid(uuid)) as ActorGURPS | TokenDocument
		if (actor instanceof TokenDocument) actor = actor.actor as ActorGURPS
		if (actor) return actor
		return null
	}

	static async getToken(): Promise<TokenDocument | null> {
		const uuid: string = game.user?.flags[SYSTEM_NAME][UserFlags.LastToken] || ""
		const token: any = await fromUuid(uuid)
		if (token) return token
		return null
	}

	static async clear() {
		game.user?.setFlag(SYSTEM_NAME, UserFlags.LastActor, null)
	}
	// static async clear(a: ActorGURPS) {
	// 	if (a.type === ActorType.Loot) return
	// 	const currentLastActor = await LastActor.get()
	// 	if (currentLastActor === a) {
	// 		game.user?.setFlag(SYSTEM_NAME, UserFlags.LastActor, null)
	// 		const tokens = canvas?.tokens
	// 		if (tokens && tokens.controlled!.length! > 0) {
	// 			LastActor.set(tokens.controlled[0]?.actor as ActorGURPS)
	// 		}
	// 	}
	// }
}
