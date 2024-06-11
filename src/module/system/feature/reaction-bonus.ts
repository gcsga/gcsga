import { BonusOwner } from "./bonus-owner.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { LeveledAmount } from "./leveled-amount.ts"
import { ReactionBonusObj } from "./data.ts"
import { feature } from "@util"

export class ReactionBonus extends BonusOwner {
	override type = feature.Type.ReactionBonus

	situation = LocalizeGURPS.translations.gurps.feature.reaction_bonus

	constructor() {
		super()
		this.situation = LocalizeGURPS.translations.gurps.feature.reaction_bonus
		this.leveledAmount = new LeveledAmount({ amount: 1 })
	}

	override toObject(): ReactionBonusObj {
		return {
			...super.toObject(),
			situation: this.situation,
		}
	}

	static fromObject(data: ReactionBonusObj): ReactionBonus {
		const bonus = new ReactionBonus()
		bonus.situation = data.situation
		bonus.leveledAmount = LeveledAmount.fromObject(data)
		return bonus
	}
}
