import { StringCompareType, StringCriteria } from "@util"
import { BonusOwner } from "./bonus_owner"
import { LeveledAmount, LeveledAmountKeys, LeveledAmountObj } from "./leveled_amount"
import { feature, skillsel } from "@util/enum"

export interface SkillBonusObj extends LeveledAmountObj {
	selection_type: skillsel.Type
	name?: StringCriteria
	specialization?: StringCriteria
	tags?: StringCriteria
}

export class SkillBonus extends BonusOwner {
	selection_type: skillsel.Type

	name?: StringCriteria

	specialization?: StringCriteria

	tags?: StringCriteria

	leveledAmount: LeveledAmount

	constructor() {
		super()
		this.type = feature.Type.SkillBonus
		this.selection_type = skillsel.Type.Name
		this.name = new StringCriteria(StringCompareType.IsString)
		this.specialization = new StringCriteria(StringCompareType.AnyString)
		this.tags = new StringCriteria(StringCompareType.AnyString)
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
