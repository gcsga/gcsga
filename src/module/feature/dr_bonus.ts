import { gid } from "@module/data"
import { BonusOwner } from "./bonus_owner"
import { FeatureType } from "./data"
import { LeveledAmount, LeveledAmountKeys, LeveledAmountObj } from "./leveled_amount"
import { TooltipGURPS } from "@module/tooltip"
import { LocalizeGURPS, equalFold } from "@util"

export interface DRBonusObj extends LeveledAmountObj {
	location: string
	specialization?: string
}

export class DRBonus extends BonusOwner {
	type = FeatureType.DRBonus

	location: string = gid.Torso

	specialization: string = gid.All

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

	toObject(): DRBonusObj {
		return {
			...super.toObject(),
			location: this.location,
			specialization: this.specialization,
		}
	}

	static fromObject(data: DRBonusObj): DRBonus {
		const bonus = new DRBonus()
		const levelData: Partial<Record<keyof LeveledAmountObj, any>> = {}
		for (const key of Object.keys(data)) {
			if (LeveledAmountKeys.includes(key)) {
				levelData[key as keyof LeveledAmountObj] = data[key as keyof DRBonusObj]
			} else (bonus as any)[key] = data[key as keyof DRBonusObj]
		}
		bonus.leveledAmount = new LeveledAmount(levelData)
		return bonus
	}
}
