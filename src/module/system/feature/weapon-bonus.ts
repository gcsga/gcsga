/*
export class WeaponBonus<TType extends feature.WeaponBonusType = feature.WeaponBonusType> {
	type: TType

	private _owner?: WeaponOwner

	private _subOwner?: WeaponOwner

	percent: boolean | null

	switch_type_value: boolean | null

	selection_type: wsel.Type

	switch_type: wswitch.Type | null

	name: StringCriteria | null

	specialization: StringCriteria | null

	level: NumericCriteria | null

	usage: StringCriteria | null

	tags: StringCriteria | null

	leveledAmount: WeaponLeveledAmount

	effective?: boolean // If true, bonus is applied later as part of effect bonuses

	constructor(type: TType) {
		this.type = type
		this.percent = null
		this.switch_type_value = null
		this.switch_type = null
		this.selection_type = wsel.Type.WithRequiredSkill
		this.name = new StringCriteria({ compare: StringCompareType.IsString })
		this.specialization = new StringCriteria({ compare: StringCompareType.AnyString })
		this.level = new NumericCriteria({ compare: NumericCompareType.AtLeastNumber })
		this.usage = new StringCriteria({ compare: StringCompareType.AnyString })
		this.tags = new StringCriteria({ compare: StringCompareType.AnyString })
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

	adjustedAmountForWeapon(wpn: AbstractWeaponGURPS): number {
		if (this.type === feature.Type.WeaponMinSTBonus) {
			this.leveledAmount.dieCount = 1
		} else {
			this.leveledAmount.dieCount = Int.from(wpn.damage.base!.count)
		}
		return this.leveledAmount.adjustedAmount
	}

	addToTooltip(tooltip: TooltipGURPS | null): void {
		if (tooltip === null) return
		const buf = new TooltipGURPS()
		buf.push("\n")
		buf.push(this.parentName)
		buf.push(" [")
		if (this.type === feature.Type.WeaponSwitch) {
			buf.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.feature.weapon_bonus.weapon_switch, {
					type: this.switch_type!,
					value: this.switch_type_value!,
				}),
			)
		} else {
			buf.push(
				LocalizeGURPS.format(
					LocalizeGURPS.translations.gurps.feature.weapon_bonus[this.type as feature.WeaponBonusType],
					{
						level: this.leveledAmount.format(this.percent ?? false),
					},
				),
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

	toObject(): SourceFromSchema<WeaponBonusSchema> {
		return {
			type: this.type,
			percent: this.percent ?? null,
			switch_type_value: this.switch_type_value ?? null,
			selection_type: this.selection_type,
			switch_type: this.switch_type ?? null,
			name: this.name ?? null,
			specialization: this.specialization ?? null,
			level: this.level ?? null,
			usage: this.usage ?? null,
			tags: this.tags ?? null,
			amount: this.amount,
			leveled: this.leveledAmount.leveled,
			per_die: this.leveledAmount.per_die,
			effective: this.effective ?? false,
		}
	}

	static fromObject(data: SourceFromSchema<WeaponBonusSchema>): WeaponBonus {
		const bonus = new WeaponBonus(data.type)
		bonus.percent = data.percent
		if (data.switch_type) bonus.switch_type = data.switch_type
		if (data.switch_type_value) bonus.switch_type_value = data.switch_type_value
		bonus.selection_type = data.selection_type
		if (data.name) bonus.name = new StringCriteria(data.name)
		if (data.specialization) bonus.specialization = new StringCriteria(data.specialization)
		if (data.level) bonus.level = new NumericCriteria(data.level)
		if (data.name) bonus.name = new StringCriteria(data.name)
		if (data.tags) bonus.tags = new StringCriteria(data.tags)
		bonus.leveledAmount = WeaponLeveledAmount.fromObject(data)
		return bonus
	}
}
*/
import { Int, LocalizeGURPS, TooltipGURPS, feature, wsel, wswitch } from "@util"
import { BaseFeature } from "./base.ts"
import { WeaponBonusSchema, WeaponLeveledAmountSchema } from "./data.ts"
import { AbstractWeaponGURPS, ItemGURPS } from "@item"
import { ItemType } from "@module/data/constants.ts"
import { NumericCriteria, StringCriteria } from "@module/util/index.ts"

class WeaponBonus extends BaseFeature<WeaponBonusSchema> {


	declare leveledAmount: WeaponLeveledAmount

	static override defineSchema(): WeaponBonusSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			...WeaponLeveledAmount.defineSchema(),
			percent: new fields.BooleanField({ nullable: true }),
			switch_type: new fields.StringField({ choices: wswitch.Types, nullable: true, initial: null }),
			switch_type_value: new fields.BooleanField({ nullable: true, initial: null }),
			selection_type: new fields.StringField({ choices: wsel.Types, initial: wsel.Type.WithRequiredSkill }),
			name: new fields.SchemaField(StringCriteria.defineSchema(), { nullable: true }),
			specialization: new fields.SchemaField(StringCriteria.defineSchema(), { nullable: true }),
			level: new fields.SchemaField(NumericCriteria.defineSchema(), { nullable: true }),
			usage: new fields.SchemaField(StringCriteria.defineSchema(), { nullable: true }),
			tags: new fields.SchemaField(StringCriteria.defineSchema(), { nullable: true }),
		}
	}

	constructor(
		data: DeepPartial<SourceFromSchema<WeaponBonusSchema>>,
		options?: DocumentConstructionContext<ItemGURPS>
	) {
		super(data, options)

		this.name = new StringCriteria(data.name ?? undefined)
		this.specialization = new StringCriteria(data.specialization ?? undefined)
		this.level = new NumericCriteria(data.level ?? undefined)
		this.usage = new StringCriteria(data.usage ?? undefined)
		this.tags = new StringCriteria(data.tags ?? undefined)
	}

	adjustedAmountForWeapon(wpn: AbstractWeaponGURPS): number {
		if (this.type === feature.Type.WeaponMinSTBonus) {
			this.leveledAmount.dieCount = 1
		} else {
			this.leveledAmount.dieCount = Int.from(wpn.damage.base!.count)
		}
		return this.leveledAmount.adjustedAmount
	}

	override addToTooltip(tooltip: TooltipGURPS | null): void {
		if (tooltip === null) return
		const buf = new TooltipGURPS()
		buf.push("\n")
		buf.push(this.parentName)
		buf.push(" [")
		if (this.type === feature.Type.WeaponSwitch) {
			buf.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.feature.weapon_bonus.weapon_switch, {
					type: this.switch_type!,
					value: this.switch_type_value!,
				}),
			)
		} else {
			buf.push(
				LocalizeGURPS.format(
					LocalizeGURPS.translations.gurps.feature.weapon_bonus[this.type as feature.WeaponBonusType],
					{
						level: this.leveledAmount.format(this.percent ?? false),
					},
				),
			)
		}
		buf.push("]")
		tooltip.push(buf)
	}

	get derivedLevel(): number {
		if (this.subOwner?.isOfType(ItemType.Trait, ItemType.TraitModifier)) {
			if (this.subOwner.isLeveled) return this.subOwner.levels
		} else if (this.owner?.isOfType(ItemType.Trait, ItemType.TraitModifier)) {
			if (this.owner.isLeveled) return this.owner.levels
		}
		return 0
	}
}

interface WeaponBonus extends BaseFeature<WeaponBonusSchema>, Omit<ModelPropsFromSchema<WeaponBonusSchema>, "name" | "specialization" | "level" | "usage" | "tags"> {
	name: StringCriteria
	specialization: StringCriteria
	level: NumericCriteria
	usage: StringCriteria
	tags: StringCriteria
}

class WeaponLeveledAmount {

	declare level: number
	declare dieCount: number
	declare amount: number
	declare leveled: boolean
	declare per_die: boolean

	static defineSchema(): WeaponLeveledAmountSchema {
		const fields = foundry.data.fields

		return {
			amount: new fields.NumberField({ integer: true, initial: 1 }),
			leveled: new fields.BooleanField({ initial: false }),
			per_die: new fields.BooleanField({ initial: false }),
			effective: new fields.BooleanField({ initial: false })
		}
	}

	constructor(data: DeepPartial<SourceFromSchema<WeaponLeveledAmountSchema>>) {
		this.level = 0
		this.dieCount = 0
		this.amount = data.amount ?? 0
		this.leveled = data.leveled ?? false
		this.per_die = data.per_die ?? false
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

	get per_level(): boolean {
		return this.per_die
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
}

interface WeaponLeveledAmount extends ModelPropsFromSchema<WeaponLeveledAmountSchema> { }

export { WeaponBonus }
