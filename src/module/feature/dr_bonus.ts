import { gid } from "@module/data"
import { BonusOwner } from "./bonus_owner"
import { FeatureType } from "./data"
import { LeveledAmount, LeveledAmountObj } from "./leveled_amount"
import { TooltipGURPS } from "@module/tooltip"
import { LocalizeGURPS, equalFold } from "@util"

export interface DRBonusObj extends LeveledAmountObj {
	location: string
	specialization?: string
}

export class DRBonus extends BonusOwner {
	type = FeatureType.DRBonus

	location: string

	specialization?: string

	leveledAmount: LeveledAmount

	constructor() {
		super()
		this.location = gid.Torso
		this.specialization = gid.All
		this.leveledAmount = new LeveledAmount({ amount: 1 })
	}

	private normalize(): void {
		let s = this.location.trim()
		if (equalFold(s, gid.All)) s = gid.All
		this.location = s
		s = this.specialization?.trim() ?? ""
		if (s === "" || equalFold(s, gid.All)) s = gid.All
		this.specialization = s
	}

	addToTooltip(tooltip: TooltipGURPS | null): void {
		if (tooltip !== null) {
			this.normalize()
			tooltip.push("\n")
			tooltip.push(this.parentName)
			tooltip.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.feature.dr_bonus, {
					level: this.leveledAmount.format(false),
					type: this.specialization ?? gid.All,
				})
			)
		}
	}
}
