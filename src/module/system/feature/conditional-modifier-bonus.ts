import { ConditionalModifierBonusSchema } from "./data.ts"
import { BaseFeature } from "./base.ts"
import { Nameable } from "@module/util/nameable.ts"
import { feature } from "@util"

class ConditionalModifierBonus extends BaseFeature<ConditionalModifierBonusSchema> {
	static override defineSchema(): ConditionalModifierBonusSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({
				required: true,
				nullable: false,
				blank: false,
				initial: feature.Type.ConditionalModifierBonus,
			}),
			situation: new fields.StringField({
				initial: game.i18n.localize("gurps.feature.conditional_modifier"),
			}),
		}
	}

	fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void {
		Nameable.extract(this.situation, m, existing)
	}
}

interface ConditionalModifierBonus
	extends BaseFeature<ConditionalModifierBonusSchema>,
		ModelPropsFromSchema<ConditionalModifierBonusSchema> {}

export { ConditionalModifierBonus }
