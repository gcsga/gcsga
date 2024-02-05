import { StringCompareType, StringCriteria } from "@util/string_criteria.ts"
import { BonusOwner } from "./bonus_owner.ts"
import { feature } from "@util/enum/feature.ts"
import { LeveledAmount } from "./leveled_amount.ts"
import { SkillPointBonusObj } from "./data.ts"
import { TooltipGURPS } from "@sytem/tooltip/index.ts"
import { LocalizeGURPS } from "@util/localize.ts"

export class SkillPointBonus extends BonusOwner {
	name?: StringCriteria

	specialization?: StringCriteria

	tags?: StringCriteria

	constructor() {
		super()
		this.type = feature.Type.SkillPointBonus
		this.name = new StringCriteria({ compare: StringCompareType.IsString })
		this.specialization = new StringCriteria({ compare: StringCompareType.AnyString })
		this.tags = new StringCriteria({ compare: StringCompareType.AnyString })
		this.leveledAmount = new LeveledAmount({ amount: 1 })
	}

	override toObject(): SkillPointBonusObj {
		return {
			...super.toObject(),
			name: this.name,
			specialization: this.specialization,
			tags: this.tags,
		}
	}

	override addToTooltip(tooltip: TooltipGURPS | null): void {
		if (tooltip !== null) {
			let lang = LocalizeGURPS.translations.gurps.feature.points_multiple
			if (this.adjustedAmount === 1) lang = LocalizeGURPS.translations.gurps.feature.points_one
			if (tooltip.length !== 0) tooltip.push("<br>")
			tooltip.push(
				LocalizeGURPS.format(lang, {
					source: this.parentName,
					amount: this.leveledAmount.format(false),
				}),
			)
		}
	}

	static fromObject(data: SkillPointBonusObj): SkillPointBonus {
		const bonus = new SkillPointBonus()
		if (data.name) bonus.name = new StringCriteria(data.name)
		if (data.specialization) bonus.specialization = new StringCriteria(data.specialization)
		if (data.tags) bonus.tags = new StringCriteria(data.tags)
		bonus.leveledAmount = LeveledAmount.fromObject(data)
		return bonus
	}
}
