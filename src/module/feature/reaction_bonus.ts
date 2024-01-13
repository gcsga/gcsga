import { LocalizeGURPS } from "@util"
import { BonusOwner } from "./bonus_owner"
import { LeveledAmount, LeveledAmountObj } from "./leveled_amount"
import { feature } from "@util/enum"

export interface ReactionBonusObj extends LeveledAmountObj {
	situation: string
}

export class ReactionBonus extends BonusOwner {
	type = feature.Type.ReactionBonus

	situation = LocalizeGURPS.translations.gurps.feature.reaction_bonus

	leveledAmount: LeveledAmount

	constructor() {
		super()
		this.situation = LocalizeGURPS.translations.gurps.feature.reaction_bonus
		this.leveledAmount = new LeveledAmount({ amount: 1 })
	}

	toObject(): ReactionBonusObj {
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
