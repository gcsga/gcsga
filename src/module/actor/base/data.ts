import { ActorFlags, ActorType, MigrationRecord, RollModifier, SYSTEM_NAME } from "@data"
import { ItemSourceGURPS } from "@item/base/data/index.ts"
import { DiceGURPS } from "@module/dice/index.ts"
import { PoolThreshold } from "@sytem/attribute/pool_threshold.ts"
import { PrototypeTokenSource } from "types/foundry/common/data/data.js"

export type ActorFlagsGURPS = foundry.documents.ActorFlags & {
	[SYSTEM_NAME]: {
		[ActorFlags.TargetModifiers]: RollModifier[]
		[ActorFlags.SelfModifiers]: RollModifier[]
		[ActorFlags.AutoEncumbrance]?: { active: boolean; manual: number }
		[ActorFlags.AutoThreshold]?: { active: boolean; manual: Record<string, PoolThreshold | null> }
		[ActorFlags.AutoDamage]?: { active: boolean; thrust: DiceGURPS; swing: DiceGURPS }
	} & Partial<Record<ActorFlags, unknown>>
}

export type ActorSourceFlagsGURPS = foundry.documents.ActorFlags & {
	[SYSTEM_NAME]: {
		[ActorFlags.TargetModifiers]: RollModifier[]
		[ActorFlags.SelfModifiers]: RollModifier[]
		[ActorFlags.AutoEncumbrance]?: { active: boolean; manual: number }
		[ActorFlags.AutoThreshold]?: { active: boolean; manual: Record<string, PoolThreshold | null> }
		[ActorFlags.AutoDamage]?: { active: boolean; thrust: DiceGURPS; swing: DiceGURPS }
	} & Partial<Record<ActorFlags, unknown>>
}

export type BaseActorSourceGURPS<
	TType extends ActorType = ActorType,
	TSystemSource extends ActorSystemSource = ActorSystemSource,
> = foundry.documents.ActorSource<TType, TSystemSource, ItemSourceGURPS> & {
	flags: ActorSourceFlagsGURPS
	prototypeToken: PrototypeTokenSource
}
export interface ActorSystemSource {
	/** A record of this actor's current world schema version as well a log of the last migration to occur */
	_migration: MigrationRecord
}
