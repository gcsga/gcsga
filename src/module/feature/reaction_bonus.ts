import { LocalizeGURPS } from "@util"
import { BonusOwner } from "./bonus_owner"
import { LeveledAmount, LeveledAmountKeys, LeveledAmountObj } from "./leveled_amount"
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
		const levelData: Partial<Record<keyof LeveledAmountObj, any>> = {}
		for (const key of Object.keys(data)) {
			if (LeveledAmountKeys.includes(key)) {
				levelData[key as keyof LeveledAmountObj] = data[key as keyof ReactionBonusObj]
			} else (bonus as any)[key] = data[key as keyof ReactionBonusObj]
		}
		bonus.leveledAmount = new LeveledAmount(levelData)
		return bonus
	}
}
