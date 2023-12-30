import { Stringer, WeaponOwner } from "@module/data"
import { LocalizeGURPS } from "@util"
import { FeatureType } from "./data"
import { LeveledAmount, LeveledAmountObj } from "./leveled_amount"
import { TooltipGURPS } from "@module/tooltip"
import { WeaponLeveledAmount } from "./weapon_leveled_amount"

export abstract class BonusOwner {
	type: FeatureType = FeatureType.AttributeBonus

	private _owner?: Stringer | WeaponOwner

	private _subOwner?: Stringer | WeaponOwner

	effective?: boolean // If true, bonus is applied later as part of effect bonuses

	leveledAmount: LeveledAmount = new LeveledAmount({ amount: 1 })

	get owner(): Stringer | undefined {
		return this._owner
	}

	set owner(owner: Stringer | undefined) {
		this._owner = owner
	}

	get subOwner(): Stringer | undefined {
		return this._subOwner
	}

	set subOwner(subOwner: Stringer | undefined) {
		this._subOwner = subOwner
	}

	setLevel(level: number): void {
		this.leveledAmount.level = level
	}

	get parentName(): string {
		if (!this.owner) return LocalizeGURPS.translations.gurps.misc.unknown
		const owner = this.owner.formattedName
		if (!this.subOwner) return owner
		return `${owner} (${this.subOwner.formattedName})`
	}

	get adjustedAmount(): number {
		return this.leveledAmount.adjustedAmount
	}

	get amount(): number {
		return this.leveledAmount.amount
	}

	set amount(amt: number) {
		this.leveledAmount.amount = amt
	}

	addToTooltip(tooltip: TooltipGURPS | null) {
		return this.basicAddToTooltip(this.leveledAmount, tooltip)
	}

	basicAddToTooltip(amt: LeveledAmount | WeaponLeveledAmount, tooltip: TooltipGURPS | null): void {
		if (tooltip !== null) {
			tooltip.push("\n")
			tooltip.push(this.parentName)
			tooltip.push(" [")
			tooltip.push(amt.format(false))
			tooltip.push("]")
		}
	}

	toObject(): LeveledAmountObj {
		return {
			type: this.type,
			amount: this.amount,
			per_level: this.leveledAmount.per_level,
			effective: this.effective ?? false,
		}
	}
}
