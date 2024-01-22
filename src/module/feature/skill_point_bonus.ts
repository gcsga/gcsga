import { feature } from "@util/enum"
import { BonusOwner } from "./bonus_owner"
import { LeveledAmount, LeveledAmountObj } from "./leveled_amount"
import { LocalizeGURPS, StringCompareType, StringCriteria } from "@util"
import { TooltipGURPS } from "@module/tooltip"

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
		this.type = feature.Type.SkillPointBonus
		this.name = new StringCriteria(StringCompareType.IsString)
		this.specialization = new StringCriteria(StringCompareType.AnyString)
		this.tags = new StringCriteria(StringCompareType.AnyString)
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

	addToTooltip(tooltip: TooltipGURPS | null): void {
		if (tooltip !== null) {
			let lang = LocalizeGURPS.translations.gurps.feature.points_multiple
			if (this.adjustedAmount === 1) lang = LocalizeGURPS.translations.gurps.feature.points_one
			if (tooltip.length !== 0) tooltip.push("<br>")
			tooltip.push(
				LocalizeGURPS.format(lang, {
					source: this.parentName,
					amount: this.leveledAmount.format(false),
				})
			)
		}
	}

	static fromObject(data: SkillPointBonusObj): SkillPointBonus {
		const bonus = new SkillPointBonus()
		if (data.name) bonus.name = new StringCriteria(data.name.compare, data.name.qualifier)
		if (data.specialization)
			bonus.specialization = new StringCriteria(data.specialization.compare, data.specialization.qualifier)
		if (data.tags) bonus.tags = new StringCriteria(data.tags.compare, data.tags.qualifier)
		bonus.leveledAmount = LeveledAmount.fromObject(data)
		return bonus
	}
}
