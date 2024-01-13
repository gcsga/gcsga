import { LocalizeGURPS } from "@util"
import { BonusOwner } from "./bonus_owner"
import { LeveledAmount, LeveledAmountObj } from "./leveled_amount"
import { feature } from "@util/enum"

export interface ConditionalModifierBonusObj extends LeveledAmountObj {
	situation: string
}

export class ConditionalModifierBonus extends BonusOwner {
	type = feature.Type.ConditionalModifierBonus

	situation = LocalizeGURPS.translations.gurps.feature.conditional_modifier

	leveledAmount: LeveledAmount

	constructor() {
		super()
		this.situation = LocalizeGURPS.translations.gurps.feature.conditional_modifier
		this.leveledAmount = new LeveledAmount({ amount: 1 })
	}

	toObject(): ConditionalModifierBonusObj {
		return {
			...super.toObject(),
			situation: this.situation,
		}
	}

	static fromObject(data: ConditionalModifierBonusObj): ConditionalModifierBonus {
		const bonus = new ConditionalModifierBonus()
		bonus.situation = data.situation
		bonus.leveledAmount = LeveledAmount.fromObject(data)
		return bonus
	}
}
