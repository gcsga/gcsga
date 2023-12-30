import { FeatureType } from "./data"
import { BonusOwner } from "./bonus_owner"
import { LeveledAmount, LeveledAmountObj } from "./leveled_amount"
import { StringComparisonType, StringCriteria } from "@module/data"

export interface SkillPointBonusObj extends LeveledAmountObj {
	name?: StringCriteria
	specialization?: StringCriteria
	tags?: StringCriteria
}

export class SkillPointBonus extends BonusOwner {
	name?: StringCriteria

	specialization?: StringCriteria

	tags?: StringCriteria

	leveledAmount: LeveledAmount

	constructor() {
		super()
		this.type = FeatureType.SkillPointBonus
		this.name = {
			compare: StringComparisonType.IsString,
		}
		this.specialization = {
			compare: StringComparisonType.AnyString,
		}
		this.tags = {
			compare: StringComparisonType.AnyString,
		}
		this.leveledAmount = new LeveledAmount({ amount: 1 })
	}
}
