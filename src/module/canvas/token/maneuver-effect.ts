import { ActorGURPS } from "@actor"
import { SYSTEM_NAME } from "@module/data/constants.ts"
import { CharacterManeuver } from "@system/maneuver-manager.ts"
import { LocalizeGURPS } from "@util"

class ManeuverEffect implements TemporaryEffect {
	#parent: ActorGURPS
	#maneuver: CharacterManeuver

	tint: HexColorString | null = null

	readonly isTemporary = true

	constructor(maneuver: CharacterManeuver, parent: ActorGURPS) {
		this.#maneuver = maneuver
		this.#parent = parent
	}

	get id(): string {
		return this.#maneuver.id
	}

	get _id(): string {
		return this.#maneuver.id
	}

	get parent(): ActorGURPS {
		return this.#parent
	}

	get name(): string {
		return LocalizeGURPS.translations.gurps.maneuver[this.#maneuver.id]
	}

	get icon(): ImageFilePath {
		return `systems/${SYSTEM_NAME}/assets/maneuver/${this.id}.webp`
	}

	get changes(): never[] {
		return []
	}

	get description(): string {
		return ""
	}

	get flags(): DocumentFlags {
		return this.#parent.flags
	}

	get statuses(): Set<string> {
		return new Set([])
	}

	get disabled(): boolean {
		return false
	}

	get origin(): ActorUUID {
		return this.#parent.uuid
	}

	get duration(): PreparedEffectDurationData {
		return {
			type: "rounds",
			remaining: "1",
			startTime: 0,
			seconds: 0,
			combat: null,
			rounds: 1,
			turns: 1,
			startRound: 0,
			startTurn: 0,
		}
	}

	get transfer(): boolean {
		return false
	}

	getFlag(scope: string, flag: string): unknown {
		return this.#parent.getFlag(scope, flag)
	}
}

export { ManeuverEffect }
