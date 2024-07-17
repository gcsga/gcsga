import { gid } from "@data"
import { stlimit } from "@util/enum/stlimit.ts"
import { feature } from "@util/enum/feature.ts"
import { AttributeBonusSchema } from "./data.ts"
import { BaseFeature, LeveledAmount } from "./base.ts"

class AttributeBonus extends BaseFeature<AttributeBonusSchema> {

	static override defineSchema(): AttributeBonusSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			...LeveledAmount.defineSchema(),
			attribute: new fields.StringField({ initial: gid.Strength }),
			limitation: new fields.StringField({ choices: stlimit.Options, initial: stlimit.Option.None })
		}
	}

	constructor(data: DeepPartial<SourceFromSchema<AttributeBonusSchema>>) {
		super({ ...data, type: feature.Type.AttributeBonus })
	}

	get actualLimitation(): stlimit.Option {
		if (this.attribute === gid.Strength) return this.limitation ?? stlimit.Option.None
		return stlimit.Option.None
	}
}


interface AttributeBonus extends BaseFeature<AttributeBonusSchema>, ModelPropsFromSchema<AttributeBonusSchema> { }

export { AttributeBonus }
