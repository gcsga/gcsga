import { BaseWeaponGURPS } from "@item"
import { Int } from "@util/fxp"
import { TooltipGURPS } from "@module/tooltip"
import { LocalizeGURPS, NumericCompareType, NumericCriteria, StringCompareType, StringCriteria } from "@util"
import { WeaponLeveledAmount, WeaponLeveledAmountObj } from "./weapon_leveled_amount"
import { feature, wsel, wswitch } from "@util/enum"
import { WeaponOwner } from "@module/data"

export interface WeaponBonusObj extends WeaponLeveledAmountObj {
	type: feature.WeaponBonusType
	percent?: boolean
	switch_type_value?: boolean
	selection_type: wsel.Type
	switch_type?: wswitch.Type
	name?: StringCriteria
	specialization?: StringCriteria
	level?: NumericCriteria
	usage?: StringCriteria
	tags?: StringCriteria
}

export class WeaponBonus {
	type: feature.WeaponBonusType

	private _owner?: WeaponOwner

	private _subOwner?: WeaponOwner

	percent?: boolean

	switch_type_value?: boolean

	selection_type: wsel.Type

	switch_type?: wswitch.Type

	name?: StringCriteria

	specialization?: StringCriteria

	level?: NumericCriteria

	usage?: StringCriteria

	tags?: StringCriteria

	leveledAmount: WeaponLeveledAmount

	effective?: boolean // If true, bonus is applied later as part of effect bonuses

	constructor(type: feature.WeaponBonusType) {
		this.type = type
		this.selection_type = wsel.Type.WithRequiredSkill
		this.name = new StringCriteria(StringCompareType.IsString)
		this.specialization = new StringCriteria(StringCompareType.AnyString)
		this.level = new NumericCriteria(NumericCompareType.AtLeastNumber)
		this.usage = new StringCriteria(StringCompareType.AnyString)
		this.tags = new StringCriteria(StringCompareType.AnyString)
		this.leveledAmount = new WeaponLeveledAmount({ amount: 1 })
	}

	get owner(): WeaponOwner | undefined {
		return this._owner
	}

	set owner(owner: WeaponOwner | undefined) {
		this._owner = owner
	}

	get subOwner(): WeaponOwner | undefined {
		return this._subOwner
	}

	set subOwner(subOwner: WeaponOwner | undefined) {
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

	adjustedAmountForWeapon(wpn: BaseWeaponGURPS<any>): number {
		if (this.type === FeatureType.WeaponMinSTBonus) {
			this.leveledAmount.dieCount = 1
		} else {
			this.leveledAmount.dieCount = Int.from(wpn.damage.base!.count)
		}
		return this.leveledAmount.adjustedAmount
	}

	addToTooltip(tooltip: TooltipGURPS | null) {
		if (tooltip === null) return
		const buf = new TooltipGURPS()
		buf.push("\n")
		buf.push(this.parentName)
		buf.push(" [")
		if (this.type === feature.Type.WeaponSwitch) {
			buf.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.feature.weapon_bonus.switch, {
					type: this.switch_type!,
					value: this.switch_type_value!,
				})
			)
		} else {
			buf.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.feature.weapon_bonus[this.type], {
					level: this.leveledAmount.format(this.percent ?? false),
				})
			)
		}
		buf.push("]")
		tooltip.push(buf)
	}

	get derivedLevel(): number {
		if (this.subOwner) {
			if (this.subOwner.isLeveled) return this.subOwner.currentLevel
		} else if (this.owner) {
			if (this.owner.isLeveled) return this.owner.currentLevel
		}
		return 0
	}

	toObject(): WeaponBonusObj {
		return {
			type: this.type,
			percent: this.percent,
			switch_type_value: this.switch_type_value,
			selection_type: this.selection_type,
			switch_type: this.switch_type,
			name: this.name,
			specialization: this.specialization,
			level: this.level,
			usage: this.usage,
			tags: this.tags,
			amount: this.amount,
			leveled: this.leveledAmount.leveled,
			per_die: this.leveledAmount.per_die,
		}
	}

	static fromObject(data: WeaponBonusObj): WeaponBonus {
		const bonus = new WeaponBonus(data.type)
		bonus.percent = data.percent
		if (data.switch_type) bonus.switch_type = data.switch_type
		if (data.switch_type_value) bonus.switch_type_value = data.switch_type_value
		bonus.selection_type = data.selection_type
		if (data.name) bonus.name = new StringCriteria(data.name.compare, data.name.qualifier)
		if (data.specialization)
			bonus.specialization = new StringCriteria(data.specialization.compare, data.specialization.qualifier)
		if (data.level) bonus.level = new NumericCriteria(data.level.compare, data.level.qualifier)
		if (data.name) bonus.name = new StringCriteria(data.name.compare, data.name.qualifier)
		if (data.tags) bonus.tags = new StringCriteria(data.tags.compare, data.tags.qualifier)
		bonus.leveledAmount = WeaponLeveledAmount.fromObject(data)
		return bonus
	}
}
