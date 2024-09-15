// import type { ActorGURPS } from "@actor"
// import type { ActorFlags, ActorType, MigrationRecord, RollModifier, SYSTEM_NAME } from "@data"
// import type { ItemSourceGURPS } from "@item/data/index.ts"
//
// /** Base interface for all actor data */
// type BaseActorSourceGURPS<
// 	TType extends ActorType,
// 	TSystemSource extends ActorSystemSource = ActorSystemSource,
// > = foundry.documents.ActorSource<TType, TSystemSource, ItemSourceGURPS> & {
// 	flags: DeepPartial<ActorFlagsGURPS>
// 	prototypeToken: PrototypeTokenSourceGURPS
// }
//
// type ActorFlagsGURPS = foundry.documents.ActorFlags & {
// 	[SYSTEM_NAME]: {
// 		[ActorFlags.TargetModifiers]: RollModifier[]
// 		[ActorFlags.SelfModifiers]: RollModifier[]
// 		[ActorFlags.Import]: { name: string; path: string; last_import: string }
// 		[key: string]: unknown
// 	}
// }
//
// type ActorSystemSource = {
// 	/** A record of this actor's current world schema version as well a log of the last migration to occur */
// 	_migration: MigrationRecord
// }
//
// interface ActorSystemData extends ActorSystemSource {}
//
// type PrototypeTokenSourceGURPS = foundry.data.PrototypeTokenSource & {
// 	flags: {
// 		[SYSTEM_NAME]?: {}
// 	}
// }
//
// interface PrototypeTokenGURPS<TParent extends ActorGURPS | null> extends foundry.data.PrototypeToken<TParent> {
// 	flags: DocumentFlags & {
// 		[SYSTEM_NAME]: {}
// 	}
// }
//
// export type { ActorFlagsGURPS, ActorSystemData, ActorSystemSource, BaseActorSourceGURPS, PrototypeTokenGURPS }
