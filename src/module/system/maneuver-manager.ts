import { ManeuverID } from "@module/data/constants.ts"

const MANEUVER_SOURCES = [
	{ id: ManeuverID.DoNothing, move: null },
	{ id: ManeuverID.Attack, move: null },
	{ id: ManeuverID.AOA, move: null },
	{ id: ManeuverID.AOD, move: null },
	{ id: ManeuverID.Move, move: null },
	{ id: ManeuverID.MoveAndAttack, move: null },
	{ id: ManeuverID.AOADouble, move: null },
	{ id: ManeuverID.AODDouble, move: null },
	{ id: ManeuverID.ChangePosture, move: null },
	{ id: ManeuverID.Feint, move: null },
	{ id: ManeuverID.AOAFeint, move: null },
	{ id: ManeuverID.AODDodge, move: null },
	{ id: ManeuverID.Ready, move: null },
	{ id: ManeuverID.Evaluate, move: null },
	{ id: ManeuverID.AOADetermined, move: null },
	{ id: ManeuverID.AODParry, move: null },
	{ id: ManeuverID.Concentrate, move: null },
	{ id: ManeuverID.Aim, move: null },
	{ id: ManeuverID.AOAStrong, move: null },
	{ id: ManeuverID.AODBlock, move: null },
	{ id: ManeuverID.Wait, move: null },
	{ id: ManeuverID.BLANK_1, move: null },
	{ id: ManeuverID.AOASF, move: null },
	{ id: ManeuverID.BLANK_2, move: null },
]

interface CharacterManeuver {
	id: ManeuverID
	move: {
		base: string
	} | null
}

export class ManeuverManager {
	static #initialized = false

	static maneuvers: Map<ManeuverID | string, CharacterManeuver> = new Map()

	private static MANEUVER_SOURCES: CharacterManeuver[] = MANEUVER_SOURCES

	static initialize(): void {
		if (this.#initialized) return
		this.maneuvers = new Map(this.MANEUVER_SOURCES.map(e => [e.id, e]))
	}
}

export type { CharacterManeuver }
