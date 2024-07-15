import { LocalizeGURPS } from "@util/localize.ts"

export class LeveledAmount {
	level = 0

	amount = 0

	per_level = false
	// effective = false

	constructor(data: Partial<LeveledAmount>) {
		Object.assign(this, data)
	}

	get adjustedAmount(): number {
		let amt = this.amount
		if (this.per_level) {
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
		if (this.per_level)
			return LocalizeGURPS.format(LocalizeGURPS.translations.gurps.feature.weapon_bonus.per_level, {
				total: adjustedAmt,
				base: amt,
			})
		return amt
	}
	// static fromObject(data: SourceFromSchema<): LeveledAmount {
	// 	return new LeveledAmount({ amount: data.amount, per_level: data.per_level })
	// }
}
