import { BonusOwner } from "./bonus-owner.ts"
import { StringCompareType, StringCriteria } from "@util/string-criteria.ts"
import { LeveledAmount } from "./leveled-amount.ts"
import { feature, skillsel } from "@util"
import { SkillBonusSchema } from "./data.ts"

export class SkillBonus extends BonusOwner<feature.Type.SkillBonus> {
	selection_type: skillsel.Type

	name: StringCriteria

	specialization: StringCriteria

	tags: StringCriteria

	constructor() {
		super(feature.Type.SkillBonus)
		this.selection_type = skillsel.Type.Name
		this.name = new StringCriteria({ compare: StringCompareType.IsString })
		this.specialization = new StringCriteria({ compare: StringCompareType.AnyString })
		this.tags = new StringCriteria({ compare: StringCompareType.AnyString })
		this.leveledAmount = new LeveledAmount({ amount: 1 })
	}

	override toObject(): SourceFromSchema<SkillBonusSchema> {
		return {
			...super.toObject(),
			selection_type: this.selection_type,
			name: this.name,
			specialization: this.specialization,
			tags: this.tags,
		}
	}

	static fromObject(data: SourceFromSchema<SkillBonusSchema>): SkillBonus {
		const bonus = new SkillBonus()
		bonus.selection_type = data.selection_type
		if (data.name) bonus.name = new StringCriteria(data.name)
		if (data.specialization) bonus.specialization = new StringCriteria(data.specialization)
		if (data.tags) bonus.tags = new StringCriteria(data.tags)
		bonus.leveledAmount = LeveledAmount.fromObject(data)
		return bonus
	}
}
