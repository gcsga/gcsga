import { StringCompareType, StringCriteria } from "@util"
import { BonusOwner } from "./bonus_owner"
import { LeveledAmount, LeveledAmountObj } from "./leveled_amount"
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
		bonus.selection_type = data.selection_type
		if (data.name) bonus.name = new StringCriteria(data.name.compare, data.name.qualifier)
		if (data.specialization)
			bonus.specialization = new StringCriteria(data.specialization.compare, data.specialization.qualifier)
		if (data.tags) bonus.tags = new StringCriteria(data.tags.compare, data.tags.qualifier)
		bonus.leveledAmount = LeveledAmount.fromObject(data)
		return bonus
	}
}
