import { LocalizeGURPS } from "@util"
import { BonusOwner } from "./bonus_owner"
import { FeatureType } from "./data"
import { LeveledAmount, LeveledAmountObj } from "./leveled_amount"

export interface ReactionBonusObj extends LeveledAmountObj {
	situation: string
}

export class ReactionBonus extends BonusOwner {
	type = FeatureType.ReactionBonus

	situation: string

	leveledAmount: LeveledAmount

	constructor() {
		super()
		this.situation = LocalizeGURPS.translations.gurps.feature.reaction_bonus
		this.leveledAmount = new LeveledAmount({ amount: 1 })
	}
}
