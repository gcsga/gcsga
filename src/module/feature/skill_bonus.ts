import { FeatureType, skillsel } from "./data"
import { BonusOwner } from "./bonus_owner"
import { LeveledAmount, LeveledAmountObj } from "./leveled_amount"
import { StringComparisonType, StringCriteria } from "@module/data"

export interface SkillBonusObj extends LeveledAmountObj {
	selection_type: skillsel
	name?: StringCriteria
	specialization?: StringCriteria
	tags?: StringCriteria
}

export class SkillBonus extends BonusOwner {
	selection_type: skillsel

	name?: StringCriteria

	specialization?: StringCriteria

	tags?: StringCriteria

	// leveledAmount: LeveledAmount

	constructor() {
		super()
		this.type = FeatureType.SkillBonus
		this.selection_type = skillsel.Name
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
