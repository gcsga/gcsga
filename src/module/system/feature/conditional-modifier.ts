import { ConditionalModifierBonusSchema } from "./data.ts"
import { BaseFeature, LeveledAmount } from "./base.ts"
import { LocalizeGURPS } from "@util"

class ConditionalModifierBonus extends BaseFeature<ConditionalModifierBonusSchema> {

	static override defineSchema(): ConditionalModifierBonusSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			...LeveledAmount.defineSchema(),
			situation: new fields.StringField({ initial: LocalizeGURPS.translations.gurps.feature.conditional_modifier })
		}
	}
}

export { ConditionalModifierBonus }
