import { ActorGURPS } from "@actor"
import { ItemType, RollModifier } from "@data"
import { FeatureObj } from "@feature/index.ts"
import { BaseItemSourceGURPS, ItemSystemSource } from "@item/base/data/system.ts"

export type EffectSource = BaseItemSourceGURPS<ItemType.Effect, EffectSystemSource>

export enum DurationType {
	Seconds = "seconds",
	Turns = "turns",
	Rounds = "rounds",
	None = "none",
}

export interface EffectSystemSource extends ItemSystemSource {
	id: string | null
	features?: FeatureObj[]
	modifiers?: RollModifier[]
	can_level: boolean
	levels?: {
		max: number
		current: number
	}
	overlay?: boolean
	duration: {
		type: DurationType
		startRound?: number | null
		startTime?: number | null
		startTurn?: number | null
		rounds?: number
		seconds?: number
		turns?: number
		combat?: string | null
	}
	reference: string
	reference_highlight: string
}

export interface EffectModificationContext<TParent extends ActorGURPS | null>
	extends DocumentModificationContext<TParent> {
	previousLevel: number
	previousID?: string | null
}
