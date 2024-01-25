import { ActorGURPS } from "@actor/document.ts"
import { FeatureObj } from "@feature/index.ts"
import { BaseItemSourceGURPS } from "@item/data.ts"
import { ItemType, RollModifier } from "@module/data/misc.ts"

export type EffectSource = BaseItemSourceGURPS<ItemType.Effect | ItemType.Condition, EffectSystemData>

// Export interface EffectFlags extends ItemFlagsGURPS {
// 	aura: boolean
// }

export enum DurationType {
	Seconds = "seconds",
	Turns = "turns",
	Rounds = "rounds",
	None = "none",
}

export interface EffectData extends Omit<EffectSource, "effects">, EffectSystemData {
	readonly type: EffectSource["type"]
	readonly _source: EffectSource
}

export interface EffectSystemData {
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
		startRound?: number
		startTime?: number
		startTurn?: number
		rounds?: number
		seconds?: number
		turns?: number
		combat?: string | null
	}
	reference: string
	reference_highlight: string
}

export interface EffectModificationContext<TParent extends ActorGURPS> extends DocumentModificationContext<TParent> {
	previousLevel: number
	previousID?: any
}
