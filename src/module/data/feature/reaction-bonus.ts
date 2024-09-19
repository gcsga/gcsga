import { ReactionBonusSchema } from "./data.ts"
import { BaseFeature } from "./base-feature.ts"
import { feature } from "@util"
import { Nameable } from "@module/util/index.ts"

class ReactionBonus extends BaseFeature<ReactionBonusSchema> {
	static override TYPE = feature.Type.ReactionBonus

	static override defineSchema(): ReactionBonusSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			situation: new fields.StringField({
				initial: game.i18n.localize("gurps.feature.reaction_bonus"),
			}),
		}
	}

	fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void {
		Nameable.extract(this.situation, m, existing)
	}
}

interface ReactionBonus extends BaseFeature<ReactionBonusSchema>, ModelPropsFromSchema<ReactionBonusSchema> {}

export { ReactionBonus }
