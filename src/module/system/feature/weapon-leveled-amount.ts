import { LocalizeGURPS } from "@util/localize.ts"
import { WeaponLeveledAmountSchema } from "./data.ts"

export class WeaponLeveledAmount {
	level = 0

	dieCount = 0

	amount = 0

	leveled = false

	per_die = false

	constructor(data: Partial<SourceFromSchema<WeaponLeveledAmountSchema>>) {
		Object.assign(this, data)
	}

	get adjustedAmount(): number {
		let amt = this.amount
		if (this.per_die) {
			if (this.dieCount < 0) return 0
			amt *= this.dieCount
		}
		if (this.leveled) {
			if (this.level < 0) return 0
			amt *= this.level
		}
		return amt
	}

	format(asPercentage: boolean): string {
		let amt = this.amount.signedString()
		let adjustedAmt = this.adjustedAmount.signedString()
		if (asPercentage) {
			amt += "%"
			adjustedAmt += "%"
		}
		switch (true) {
			case this.per_die && this.leveled:
				return LocalizeGURPS.format(LocalizeGURPS.translations.gurps.feature.weapon_bonus.per_die_per_level, {
					total: adjustedAmt,
					base: amt,
				})
			case this.per_die:
				return LocalizeGURPS.format(LocalizeGURPS.translations.gurps.feature.weapon_bonus.per_die, {
					total: adjustedAmt,
					base: amt,
				})
			case this.leveled:
				return LocalizeGURPS.format(LocalizeGURPS.translations.gurps.feature.weapon_bonus.per_level, {
					total: adjustedAmt,
					base: amt,
				})
			default:
				return amt
		}
	}

	static fromObject(data: SourceFromSchema<WeaponLeveledAmountSchema>): WeaponLeveledAmount {
		return new WeaponLeveledAmount({ amount: data.amount, leveled: data.leveled, per_die: data.per_die })
	}
}
