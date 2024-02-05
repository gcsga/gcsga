import { skillsel } from "@util/enum/skillsel.ts"
import { BonusOwner } from "./bonus_owner.ts"
import { StringCompareType, StringCriteria } from "@util/string_criteria.ts"
import { feature } from "@util/enum/feature.ts"
import { LeveledAmount } from "./leveled_amount.ts"
import { SkillBonusObj } from "./data.ts"

export class SkillBonus extends BonusOwner {
	selection_type: skillsel.Type

	name?: StringCriteria

	specialization?: StringCriteria

	tags?: StringCriteria

	constructor() {
		super()
		this.type = feature.Type.SkillBonus
		this.selection_type = skillsel.Type.Name
		this.name = new StringCriteria({ compare: StringCompareType.IsString })
		this.specialization = new StringCriteria({ compare: StringCompareType.AnyString })
		this.tags = new StringCriteria({ compare: StringCompareType.AnyString })
		this.leveledAmount = new LeveledAmount({ amount: 1 })
	}

	override toObject(): SkillBonusObj {
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
		if (data.name) bonus.name = new StringCriteria(data.name)
		if (data.specialization) bonus.specialization = new StringCriteria(data.specialization)
		if (data.tags) bonus.tags = new StringCriteria(data.tags)
		bonus.leveledAmount = LeveledAmount.fromObject(data)
		return bonus
	}
}
