import type { ActorFlagsGURPS, ActorSystemData, ActorSystemSource, BaseActorSourceGURPS } from "@actor/base/data.ts"
import { ActorFlags, ActorType, SYSTEM_NAME, gid } from "@data"
import { SheetSettingsObj } from "@module/data/sheet-settings.ts"
import { DiceGURPS } from "@module/dice/index.ts"
import type { AttributeObj, MoveTypeObj, PoolThreshold, ResourceTrackerObj } from "@system"
import type { Weight } from "@util/weight.ts"

type CharacterSource = BaseActorSourceGURPS<ActorType.Character, CharacterSystemSource> & {
	flags: DeepPartial<CharacterFlags>
}

type CharacterFlags = ActorFlagsGURPS & {
	[SYSTEM_NAME]: {
		[ActorFlags.MoveType]: string
		[ActorFlags.AutoEncumbrance]: { active: boolean; manual: number }
		[ActorFlags.AutoThreshold]: { active: boolean; manual: Record<string, PoolThreshold | null> }
		[ActorFlags.AutoDamage]: { active: boolean; thrust: DiceGURPS; swing: DiceGURPS }
	}
}

const CharacterFlagDefaults: CharacterFlags = {
	[SYSTEM_NAME]: {
		[ActorFlags.TargetModifiers]: [],
		[ActorFlags.SelfModifiers]: [],
		[ActorFlags.MoveType]: gid.Ground,
		[ActorFlags.AutoEncumbrance]: { active: true, manual: 0 },
		[ActorFlags.AutoThreshold]: { active: true, manual: {} },
		[ActorFlags.AutoDamage]: { active: true, thrust: new DiceGURPS(), swing: new DiceGURPS() },
		[ActorFlags.Import]: { name: "", path: "", last_import: "" },
	},
}

interface CharacterSystemSource extends ActorSystemSource {
	type: ActorType.Character
	version: number
	settings: SheetSettingsObj
	created_date: string
	modified_date: string
	profile: CharacterProfile
	attributes: AttributeObj[]
	resource_trackers: ResourceTrackerObj[]
	move_types: MoveTypeObj[]
	move: CharacterMove
	total_points: number
	points_record: PointsRecord[]
}

interface CharacterSystemData extends CharacterSystemSource, ActorSystemData {}

export interface CharacterMove {
	maneuver: string
	posture: string
	type: string
}

export interface CharacterProfile {
	player_name: string
	name: string
	title: string
	organization: string
	age: string
	birthday: string
	eyes: string
	hair: string
	skin: string
	handedness: string
	height: string
	weight: string
	SM: number
	gender: string
	tech_level: string
	religion: string
	portrait: string
}

export interface CharacterCalc {
	swing: string
	thrust: string
	basic_lift: Weight
	lifting_st_bonus: number
	striking_st_bonus: number
	throwing_st_bonus: number
	move: number[]
	dodge: number[]
	dodge_bonus: number
	block_bonus: number
	parry_bonus: number
}

export interface PointsRecord {
	when: string
	points: number
	reason: string
}

export interface Encumbrance {
	level: number
	maximumCarry: number
	penalty: number
	name: string
	active: boolean
	dodge: {
		normal: number
		effective: number
	}
	move: {
		normal: number
		effective: number
	}
}

export const CharacterDefaultData: Partial<CharacterSystemSource> = {
	profile: {
		player_name: "",
		name: "",
		title: "",
		organization: "",
		age: "",
		birthday: "",
		eyes: "",
		hair: "",
		skin: "",
		handedness: "",
		height: "6'",
		weight: "0 lb",
		SM: 0,
		gender: "",
		tech_level: "",
		religion: "",
		portrait: "",
	},
}

export interface PointsBreakdown {
	overspent: boolean
	ancestry: number
	attributes: number
	advantages: number
	disadvantages: number
	quirks: number
	skills: number
	spells: number
	total: number
	unspent: number
}

export { CharacterFlagDefaults }
export type { CharacterFlags, CharacterSource, CharacterSystemData, CharacterSystemSource }
