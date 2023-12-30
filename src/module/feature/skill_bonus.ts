import { FeatureType, skillsel } from "./data"
import { BonusOwner } from "./bonus_owner"
import { LeveledAmount, LeveledAmountKeys, LeveledAmountObj } from "./leveled_amount"
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

	leveledAmount: LeveledAmount

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

	toObject(): SkillBonusObj {
		return {
			...super.toObject(),
			selection_type: this.selection_type,
			name: this.name,
			specialization: this.specialization,
			tags: this.tags,
		}
	}

	static fromObject(data: SkillBonusObj): SkillBonus {
		const bonus = new SkillBonus()
		const levelData: Partial<Record<keyof LeveledAmountObj, any>> = {}
		for (const key of Object.keys(data)) {
			if (LeveledAmountKeys.includes(key)) {
				levelData[key as keyof LeveledAmountObj] = data[key as keyof SkillBonusObj]
			} else (bonus as any)[key] = data[key as keyof SkillBonusObj]
		}
		bonus.leveledAmount = new LeveledAmount(levelData)
		return bonus
	}
}
