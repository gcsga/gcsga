import { ReactionBonusSchema } from "./data.ts"
import { BaseFeature } from "./base.ts"
import { Nameable } from "@module/util/nameable.ts"
import { feature } from "@util"

class ReactionBonus extends BaseFeature<ReactionBonusSchema> {
	static override defineSchema(): ReactionBonusSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			// ...LeveledAmount.defineSchema(),
			type: new fields.StringField({ required: true, nullable: false,  blank: false,initial: feature.Type.ReactionBonus }),
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
