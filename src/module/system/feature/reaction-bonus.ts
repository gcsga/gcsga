import { BonusOwner } from "./bonus-owner.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { LeveledAmount } from "./leveled-amount.ts"
import { feature } from "@util"
import { ReactionBonusSchema } from "./data.ts"

export class ReactionBonus extends BonusOwner<feature.Type.ReactionBonus> {
	situation = LocalizeGURPS.translations.gurps.feature.reaction_bonus

	constructor() {
		super(feature.Type.ReactionBonus)
		this.situation = LocalizeGURPS.translations.gurps.feature.reaction_bonus
		this.leveledAmount = new LeveledAmount({ amount: 1 })
	}

	override toObject(): SourceFromSchema<ReactionBonusSchema> {
		return {
			...super.toObject(),
			situation: this.situation,
		}
	}

	static fromObject(data: SourceFromSchema<ReactionBonusSchema>): ReactionBonus {
		const bonus = new ReactionBonus()
		bonus.situation = data.situation
		bonus.leveledAmount = LeveledAmount.fromObject(data)
		return bonus
	}
}
