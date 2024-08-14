import { gid } from "@data"
import { stlimit } from "@util/enum/stlimit.ts"
import { AttributeBonusSchema } from "./data.ts"
import { BaseFeature } from "./base.ts"

class AttributeBonus extends BaseFeature<AttributeBonusSchema> {
	static override defineSchema(): AttributeBonusSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			attribute: new fields.StringField({ initial: gid.Strength }),
			limitation: new fields.StringField({ choices: stlimit.Options, initial: stlimit.Option.None }),
		}
	}

	get actualLimitation(): stlimit.Option {
		if (this.attribute === gid.Strength) return this.limitation ?? stlimit.Option.None
		return stlimit.Option.None
	}

	fillWithNameableKeys(_m: Map<string, string>, _existing: Map<string, string>): void {}
}

interface AttributeBonus extends BaseFeature<AttributeBonusSchema>, ModelPropsFromSchema<AttributeBonusSchema> {}

export { AttributeBonus }
