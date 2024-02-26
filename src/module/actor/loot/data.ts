import { ActorFlagsGURPS, ActorSystemData, ActorSystemSource, BaseActorSourceGURPS } from "@actor/base/data.ts"
import { ActorType, SYSTEM_NAME } from "@module/data/constants.ts"

type LootSource = BaseActorSourceGURPS<ActorType.Loot, LootSystemSource> & {
	flags: DeepPartial<LootFlags>
}

type LootFlags = ActorFlagsGURPS & {
	[SYSTEM_NAME]: {}
}

interface LootSystemSource extends ActorSystemSource {}

interface LootSystemData extends LootSystemSource, ActorSystemData {}

export type { LootSource, LootSystemSource, LootSystemData, LootFlags }
