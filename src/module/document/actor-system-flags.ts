import { ActorFlags } from "@module/data/constants.ts"
import fields = foundry.data.fields
import { RollModifier } from "@module/data/roll-modifier.ts"
import { ActorGURPS2 } from "./actor.ts"
import { DocumentSystemFlags } from "./system-flags.ts"

class ActorSystemFlags extends DocumentSystemFlags<ActorGURPS2, ActorSystemFlagsSchema> {
	static override defineSchema(): ActorSystemFlagsSchema {
		const fields = foundry.data.fields
		return {
			[ActorFlags.SelfModifiers]: new fields.ArrayField(new fields.EmbeddedDataField(RollModifier)),
			[ActorFlags.TargetModifiers]: new fields.ArrayField(new fields.EmbeddedDataField(RollModifier)),
		}
	}
}

interface ActorSystemFlags extends ModelPropsFromSchema<ActorSystemFlagsSchema> {}

type ActorSystemFlagsSchema = {
	[ActorFlags.SelfModifiers]: fields.ArrayField<fields.EmbeddedDataField<RollModifier>>
	[ActorFlags.TargetModifiers]: fields.ArrayField<fields.EmbeddedDataField<RollModifier>>
}

export { ActorSystemFlags, type ActorSystemFlagsSchema }
