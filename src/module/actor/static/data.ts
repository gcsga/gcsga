import { ActorFlagsGURPS, ActorSystemSource, BaseActorSourceGURPS } from "@actor/base/data.ts"
import {
	StaticEquipment,
	StaticMelee,
	StaticNote,
	StaticRanged,
	StaticReaction,
	StaticSkill,
	StaticSpell,
	StaticTrait,
} from "./components.ts"
import { ActorType } from "@data"

export const MoveModeTypes = {
	Ground: "gurps.character.move_modes.ground",
	Air: "gurps.character.move_modes.air",
	Water: "gurps.character.move_modes.water",
	Space: "gurps.character.move_modes.space",
}

export enum StaticPosture {
	Standing = "standing",
	Prone = "prone",
	Kneeling = "kneeling",
	Crouching = "crouching",
	Sitting = "sitting",
	Crawling = "crawling",
}

export interface MoveMode {
	mode: typeof MoveModeTypes | string
	basic: number
	enhanced?: number
	default: boolean
}

export interface StaticCharacterSource
	extends BaseActorSourceGURPS<ActorType.LegacyCharacter, StaticCharacterSystemData> {
	flags: StaticCharacterFlags
}
type StaticCharacterFlags = ActorFlagsGURPS & {
	gurps: {
		// Empty
	}
}

export type StaticCharacterItems = StaticTrait | StaticSkill | StaticSpell | StaticEquipment | StaticNote

export interface StaticCharacterSystemData extends ActorSystemSource {
	editing: boolean
	additionalresources: {
		bodyplan: string
		ignoreinputbodyplan: boolean
		importname: string
		importpath: string
		tracker: {
			[key: string]: StaticResourceTracker
		}
	}
	hitlocations: Record<string, StaticHitLocation>
	lastImport: string
	attributes: Record<StaticAttributeName, StaticAttribute>
	HP: StaticPoolValue
	FP: StaticPoolValue
	QP: StaticPoolValue
	dodge: {
		value: number
		enc_level: number
	}
	basiclift: string
	basicmove: {
		value: string
		points: number
	}
	basicspeed: {
		value: string
		points: number
	}
	parry: number
	currentmove: number
	thrust: string
	swing: string
	frightcheck: number
	hearing: number
	tastesmell: number
	vision: number
	touch: number
	conditions: {
		exhausted: boolean
		maneuver: string
		move: string
		posture: StaticPosture
		reeling: boolean
	}
	traits: StaticCharacterTraits
	encumbrance: {
		[key: string]: {
			key: string
			level: number
			dodge: number
			weight: string
			move: number
			current: boolean
		}
	}
	move: Record<string, StaticMove>
	reactions: { [key: string]: StaticReaction }
	conditionalmods: { [key: string]: StaticReaction }
	ads: { [key: string]: StaticTrait }
	skills: { [key: string]: StaticSkill }
	spells: { [key: string]: StaticSpell }
	equipment: {
		carried: { [key: string]: StaticEquipment }
		other: { [key: string]: StaticEquipment }
	}
	eqtsummary: number
	melee: { [key: string]: StaticMelee }
	ranged: { [key: string]: StaticRanged }
	currentdodge: number
	languages: Record<string, unknown>
	liftingmoving: {
		basiclift: string
		carryonback: string
		onehandedlift: string
		runningshove: string
		shiftslightly: string
		shove: string
		twohandedlift: string
	}
	notes: { [key: string]: StaticNote }
	equippedparryisfencing?: boolean
	block?: number
}

export interface StaticHitLocation {
	where: string
	import: number
	equipmnet: number
	penalty: number
	roll: string
}

export interface StaticMove {
	basic: number
	default: boolean
	mode: string
}

export interface StaticCharacterTraits {
	title: string
	race: string
	height: string
	weight: string
	age: string
	birthday: string
	religion: string
	gender: string
	eyes: string
	hair: string
	hand: string
	handedness?: string
	skin: string
	sizemod: number
	techlevel: string
	tech_level?: string
	createdon: string
	modifiedon: string
	player: string
	player_name?: string
	portrait?: string
}

export enum StaticAttributeName {
	ST = "ST",
	DX = "DX",
	IQ = "IQ",
	HT = "HT",
	WILL = "WILL",
	PER = "PER",
	QN = "QN",
}

export interface StaticPoolValue {
	value: number
	min: number
	max: number
	points: number
}

export enum StaticSecondaryAttributeName {
	frightCheck = "frightcheck",
	vision = "vision",
	hearing = "hearing",
	tasteSmell = "tastesmell",
	touch = "touch",
}

export interface StaticAttribute {
	import: number
	value: number
	points: number
	dtype: "Number"
}

export interface StaticResourceTracker {
	alias: string
	initialValue: number
	isDamageTracker: boolean
	isDamageType: boolean
	max: number
	isMaxEnforced: boolean
	min: number
	isMinEnforced: boolean
	name: string
	pdf: string
	points: number
	value: number
	thresholds: StaticResourceThreshold[]
	index?: string
}

export interface StaticResourceThreshold {
	color: string
	comparison: StaticThresholdComparison
	operator: StaticThresholdOperator
	value: number
	condition: string
}

export enum StaticThresholdComparison {
	LessThan = "<",
	LessThanOrEqual = "≤",
	GreaterThan = ">",
	GreaterThanOrEqual = "≥",
}

export enum StaticThresholdOperator {
	Add = "+",
	Subtract = "−",
	Multiply = "×",
	Divide = "÷",
}

export const staticHpConditions = {
	NORMAL: {
		breakpoint: (): number => Number.MAX_SAFE_INTEGER,
		label: "gurps.static.status.normal",
	},
	REELING: {
		breakpoint: (HP: StaticCharacterSystemData["HP"]): number => Math.ceil(HP.max / 3) - 1,
		label: "gurps.static.status.reeling",
	},
	COLLAPSE: {
		breakpoint: (_: StaticCharacterSystemData["HP"]): number => 0,
		label: "gurps.static.status.collapse",
	},
	CHECK1: {
		breakpoint: (HP: StaticCharacterSystemData["HP"]): number => -1 * HP.max,
		label: "gurps.static.status.check1",
	},
	CHECK2: {
		breakpoint: (HP: StaticCharacterSystemData["HP"]): number => -2 * HP.max,
		label: "gurps.static.status.check2",
	},
	CHECK3: {
		breakpoint: (HP: StaticCharacterSystemData["HP"]): number => -3 * HP.max,
		label: "gurps.static.status.check3",
	},
	CHECK4: {
		breakpoint: (HP: StaticCharacterSystemData["HP"]): number => -4 * HP.max,
		label: "gurps.static.status.check4",
	},
	DEAD: {
		breakpoint: (HP: StaticCharacterSystemData["HP"]): number => -5 * HP.max,
		label: "gurps.static.status.dead",
	},
	DESTROYED: {
		breakpoint: (HP: StaticCharacterSystemData["HP"]): number => -10 * HP.max,
		label: "gurps.static.status.destroyed",
	},
}

export const staticFpConditions = {
	NORMAL: {
		breakpoint: (): number => Number.MAX_SAFE_INTEGER,
		label: "gurps.static.status.normal",
	},
	REELING: {
		breakpoint: (FP: StaticCharacterSystemData["FP"]): number => Math.ceil(FP.max / 3) - 1,
		label: "gurps.static.status.tired",
	},
	COLLAPSE: {
		breakpoint: (): number => 0,
		label: "gurps.static.status.collapse",
	},
	UNCONSCIOUS: {
		breakpoint: (FP: StaticCharacterSystemData["FP"]): number => -1 * FP.max,
		label: "gurps.static.status.unconscious",
	},
}
