import type { ActorFlagsGURPS, ActorSystemData, ActorSystemSource, BaseActorSourceGURPS } from "@actor/base/data.ts"
import type { ActorType, SYSTEM_NAME } from "@module/data/constants.ts"

type LegacyCharacterSource = BaseActorSourceGURPS<ActorType.LegacyCharacter, LegacyCharacterSystemSource> & {
	flags: DeepPartial<LegacyCharacterFlags>
}

type LegacyCharacterFlags = ActorFlagsGURPS & {
	[SYSTEM_NAME]: {}
}

interface LegacyCharacterSystemSource extends ActorSystemSource {}

interface LegacyCharacterSystemData extends LegacyCharacterSystemSource, ActorSystemData {}

export type { LegacyCharacterSource, LegacyCharacterSystemSource, LegacyCharacterSystemData, LegacyCharacterFlags }
