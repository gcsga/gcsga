// import { ActorGURPS } from "@actor/base/document.ts"
import { BaseItemSourceGURPS, ItemSystemData, ItemSystemSource } from "@item/base/data.ts"
import { EffectType } from "@module/data/constants.ts"
import { RollModifier } from "@module/data/types.ts"
import { FeatureObj } from "@system"

type AbstractEffectSource<
	TType extends EffectType,
	TSystemSource extends AbstractEffectSystemSource = AbstractEffectSystemSource,
> = BaseItemSourceGURPS<TType, TSystemSource>

interface AbstractEffectSystemSource extends ItemSystemSource {
	id: string | null
	features?: FeatureObj[]
	modifiers?: RollModifier[]
	can_level: boolean
	levels: {
		max: number | null
		current: number | null
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

interface AbstractEffectSystemData extends AbstractEffectSystemSource, ItemSystemData {}

export enum DurationType {
	Seconds = "seconds",
	Turns = "turns",
	Rounds = "rounds",
	None = "none",
}

export const DurationTypes = [DurationType.Seconds, DurationType.Turns, DurationType.Rounds, DurationType.None] as const

// interface EffectModificationContext<TParent extends ActorGURPS | null> extends DocumentModificationContext<TParent> {
// 	previousLevel: number
// 	previousID?: string | null
// }

export type {
	AbstractEffectSource,
	AbstractEffectSystemSource,
	AbstractEffectSystemData,
	// EffectModificationContext
}
