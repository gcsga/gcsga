import { FeatureType } from "./data"
import { BonusOwner } from "./bonus_owner"
import { LeveledAmount, LeveledAmountKeys, LeveledAmountObj } from "./leveled_amount"
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

	toObject(): SkillPointBonusObj {
		return {
			...super.toObject(),
			name: this.name,
			specialization: this.specialization,
			tags: this.tags,
		}
	}

	static fromObject(data: SkillPointBonusObj): SkillPointBonus {
		const bonus = new SkillPointBonus()
		const levelData: Partial<Record<keyof LeveledAmountObj, any>> = {}
		for (const key of Object.keys(data)) {
			if (LeveledAmountKeys.includes(key)) {
				levelData[key as keyof LeveledAmountObj] = data[key as keyof SkillPointBonusObj]
			} else (bonus as any)[key] = data[key as keyof SkillPointBonusObj]
		}
		bonus.leveledAmount = new LeveledAmount(levelData)
		return bonus
	}
}
