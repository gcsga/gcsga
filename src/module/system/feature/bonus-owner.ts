import { feature } from "@util/enum/feature.ts"
import { LeveledAmount } from "./leveled-amount.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { BaseFeatureObj, LeveledAmountObj } from "./data.ts"
import { WeaponLeveledAmount } from "./weapon-leveled-amount.ts"
import { FeatureOwner, WeaponOwner } from "@module/util/index.ts"
import { TooltipGURPS } from "@util"
import { ItemGURPS } from "@item"
import { ItemType } from "@module/data/constants.ts"

export abstract class BonusOwner<TType extends feature.Type> {
	declare type: TType

	private _owner: FeatureOwner | WeaponOwner | null = null

	private _subOwner: FeatureOwner | WeaponOwner | null = null

	effective?: boolean // If true, bonus is applied later as part of effect bonuses

	leveledAmount: LeveledAmount = new LeveledAmount({ amount: 1 })

	constructor(type: TType) {
		this.type = type
	}

	get owner(): FeatureOwner | WeaponOwner | null {
		return this._owner
	}

	set owner(owner: FeatureOwner | WeaponOwner | null) {
		this._owner = owner
		if (owner instanceof ItemGURPS) {
			if (owner.isOfType(ItemType.Effect, ItemType.Condition)) this.effective = true
			else this.effective = false
		}
	}

	get subOwner(): FeatureOwner | WeaponOwner | null {
		return this._subOwner
	}

	set subOwner(subOwner: FeatureOwner | WeaponOwner | null) {
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

	addToTooltip(tooltip: TooltipGURPS | null): void {
		return this.basicAddToTooltip(this.leveledAmount, tooltip)
	}

	basicAddToTooltip(amt: LeveledAmount | WeaponLeveledAmount, tooltip: TooltipGURPS | null): void {
		if (tooltip !== null) {
			// tooltip.push("\n")
			tooltip.push(this.parentName)
			tooltip.push(" [")
			tooltip.push(amt.format(false))
			tooltip.push("]")
		}
	}

	toObject(): LeveledAmountObj & BaseFeatureObj<TType> {
		return {
			type: this.type,
			amount: this.amount,
			per_level: this.leveledAmount.per_level,
			effective: this.effective ?? false,
		}
	}
}
