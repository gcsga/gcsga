import { ItemSourceGURPS } from "@item/data/index.ts"
import { ActorType, SYSTEM_NAME } from "@module/data/misc.ts"

export interface ActorFlagsGURPS extends DocumentFlags {
	[SYSTEM_NAME]: Partial<Record<ActorFlags, any>>
}

export enum ActorFlags {
	TargetModifiers = "targetModifiers",
	SelfModifiers = "selfModifiers",
	Deprecation = "deprecation",
	MoveType = "move_type",
	AutoEncumbrance = "auto_encumbrance",
	AutoThreshold = "auto_threshold",
	AutoDamage = "auto_damage",
}

export type BaseActorSourceGURPS<
	TType extends ActorType,
	TSystemSource extends ActorSystemSource = ActorSystemSource,
> = foundry.documents.ActorSource<TType, TSystemSource, ItemSourceGURPS> & {
	flags: DeepPartial<ActorFlagsGURPS>
}
// export interface BaseActorSourceGURPS<
// 	TActorType extends ActorType = ActorType,
// 	TSystemData extends ActorSystemData = ActorSystemData,
// > extends ActorDataSource {
// 	name: string
// 	type: TActorType
// 	system: TSystemData
// 	flags: DeepPartial<ActorFlagsGURPS>
// }

export interface ActorSystemSource {
	id: string
	type: ActorType
}

// export interface ActorConstructorContextGURPS extends Context<TokenDocument> {
// 	gurps?: {
// 		ready?: boolean
// 		imported?: boolean
// 	}
// }
