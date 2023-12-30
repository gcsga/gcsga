import { LocalizeGURPS } from "@util"
import { BonusOwner } from "./bonus_owner"
import { FeatureType } from "./data"
import { LeveledAmount, LeveledAmountObj } from "./leveled_amount"

export interface ConditionalModifierBonusObj extends LeveledAmountObj {
	situation: string
}

export class ConditionalModifierBonus extends BonusOwner {
	type = FeatureType.ConditionalModifierBonus

	situation: string

	leveledAmount: LeveledAmount

	constructor() {
		super()
		this.situation = LocalizeGURPS.translations.gurps.feature.conditional_modifier
		this.leveledAmount = new LeveledAmount({ amount: 1 })
	}
}
