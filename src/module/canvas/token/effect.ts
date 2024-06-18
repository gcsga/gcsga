import { ActorGURPS } from "@actor"
import { AbstractEffectGURPS } from "@item"
import { sluggify } from "@util"

class TokenEffect implements TemporaryEffect {
	#effect: AbstractEffectGURPS<ActorGURPS>

	tint: Color | null = null

	readonly isTemporary = true

	constructor(effect: AbstractEffectGURPS<ActorGURPS>) {
		this.#effect = effect
	}

	get id(): string {
		return this.#effect.id
	}

	get _id(): string {
		return this.#effect.id
	}

	get parent(): ActorGURPS {
		return this.#effect.parent
	}

	get name(): string {
		return this.#effect.name
	}

	get img(): ImageFilePath {
		return this.#effect.img
	}

	get type(): string {
		return this.#effect.type
	}

	get system(): AbstractEffectGURPS["system"] {
		return this.#effect.system
	}

	get changes(): never[] {
		return []
	}

	get description(): string {
		return this.#effect.notes
	}

	get flags(): DocumentFlags {
		return this.#effect.flags
	}

	get statuses(): Set<string> {
		return new Set([this.#effect.system.slug ?? sluggify(this.#effect.name)])
	}

	get disabled(): boolean {
		return false
		// return this.#effect.isOfType(ItemType.Effect) && this.#effect.isExpired
	}

	get duration(): PreparedEffectDurationData {
		const effect = this.#effect

		return {
			...effect.system.duration,
			combat: game.combats.get(effect.system.duration.combat ?? "") ?? null,
		}
	}

	get transfer(): boolean {
		return false
	}

	get origin(): ItemUUID {
		return this.#effect.uuid
	}

	get _stats(): AbstractEffectGURPS["_stats"] {
		return this.#effect._stats
	}

	getFlag(scope: string, flag: string): unknown {
		return this.#effect.getFlag(scope, flag)
	}
}

export { TokenEffect }
