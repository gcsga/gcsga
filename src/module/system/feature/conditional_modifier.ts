import { feature } from "@util/enum/feature.ts"
import { BonusOwner } from "./bonus_owner.ts"
import { LeveledAmount } from "./leveled_amount.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { ConditionalModifierBonusObj } from "./data.ts"

export class ConditionalModifierBonus extends BonusOwner {
	override type = feature.Type.ConditionalModifierBonus

	situation = LocalizeGURPS.translations.gurps.feature.conditional_modifier

	constructor() {
		super()
		this.situation = LocalizeGURPS.translations.gurps.feature.conditional_modifier
		this.leveledAmount = new LeveledAmount({ amount: 1 })
	}

	override toObject(): ConditionalModifierBonusObj {
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
