import { BonusOwner } from "./bonus-owner.ts"
import { LeveledAmount } from "./leveled-amount.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { DRBonusObj } from "./data.ts"
import { TooltipGURPS, equalFold, feature } from "@util"
import { gid } from "@module/data/constants.ts"

export class DRBonus extends BonusOwner<feature.Type.DRBonus> {
	location: string = gid.Torso

	specialization: string = gid.All

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

	override addToTooltip(tooltip: TooltipGURPS | null): void {
		if (tooltip !== null) {
			this.normalize()
			tooltip.push("\n")
			tooltip.push(this.parentName)
			tooltip.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.feature.dr_bonus, {
					level: this.leveledAmount.format(false),
					type: this.specialization ?? gid.All,
				}),
			)
		}
	}

	override toObject(): DRBonusObj {
		return {
			...super.toObject(),
			location: this.location,
			specialization: this.specialization,
		}
	}

	static fromObject(data: DRBonusObj): DRBonus {
		const bonus = new DRBonus()
		if (data.location) bonus.location = data.location
		if (data.specialization) bonus.specialization = data.specialization
		bonus.leveledAmount = LeveledAmount.fromObject(data)
		return bonus
	}
}
