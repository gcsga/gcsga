import { feature } from "@util/enum/feature.ts"
import { BaseFeature } from "./bonus-owner.ts"
import { LeveledAmount } from "./leveled-amount.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { ConditionalModifierBonusSchema } from "./data.ts"

export class ConditionalModifierBonus extends BaseFeature<feature.Type.ConditionalModifierBonus> {
	situation = LocalizeGURPS.translations.gurps.feature.conditional_modifier

	constructor() {
		super(feature.Type.ConditionalModifierBonus)
		this.situation = LocalizeGURPS.translations.gurps.feature.conditional_modifier
		this.leveledAmount = new LeveledAmount({ amount: 1 })
	}

	override toObject(): SourceFromSchema<ConditionalModifierBonusSchema> {
		return {
			...super.toObject(),
			situation: this.situation,
		}
	}

	static fromObject(data: SourceFromSchema<ConditionalModifierBonusSchema>): ConditionalModifierBonus {
		const bonus = new ConditionalModifierBonus()
		bonus.situation = data.situation
		bonus.leveledAmount = LeveledAmount.fromObject(data)
		return bonus
	}
}
