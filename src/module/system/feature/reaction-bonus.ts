import { LocalizeGURPS } from "@util/localize.ts"
import { ReactionBonusSchema } from "./data.ts"
import { BaseFeature, LeveledAmount } from "./base.ts"

class ReactionBonus extends BaseFeature<ReactionBonusSchema> {
	static override defineSchema(): ReactionBonusSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			...LeveledAmount.defineSchema(),
			situation: new fields.StringField({ initial: LocalizeGURPS.translations.gurps.feature.reaction_bonus }),
		}
	}
}

interface ReactionBonus extends BaseFeature<ReactionBonusSchema>, ModelPropsFromSchema<ReactionBonusSchema> {}

export { ReactionBonus }
