import { Int, LocalizeGURPS, TooltipGURPS, feature, wsel, wswitch } from "@util"
import { BaseFeature } from "./base.ts"
import { WeaponBonusSchema } from "./data.ts"
import { AbstractWeaponGURPS } from "@item"
import { ItemType } from "@module/data/constants.ts"
import { NumericCriteria, StringCriteria } from "@module/util/index.ts"
import { Nameable } from "@module/util/nameable.ts"
import { ItemDataModel } from "@module/data/abstract.ts"

class WeaponBonus extends BaseFeature<WeaponBonusSchema> {
	// declare leveledAmount: WeaponLeveledAmount
	declare dieCount: number

	static override defineSchema(): WeaponBonusSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			// ...WeaponLeveledAmount.defineSchema(),
			type: new fields.StringField({ required: true, nullable: false, blank: false }),
			percent: new fields.BooleanField({ nullable: true }),
			switch_type: new fields.StringField({ choices: wswitch.Types, nullable: true, initial: null }),
			switch_type_value: new fields.BooleanField({ nullable: true, initial: null }),
			selection_type: new fields.StringField({ choices: wsel.Types, initial: wsel.Type.WithRequiredSkill }),
			name: new fields.SchemaField(StringCriteria.defineSchema(), { nullable: true }),
			specialization: new fields.SchemaField(StringCriteria.defineSchema(), { nullable: true }),
			level: new fields.SchemaField(NumericCriteria.defineSchema(), { nullable: true }),
			usage: new fields.SchemaField(StringCriteria.defineSchema(), { nullable: true }),
			tags: new fields.SchemaField(StringCriteria.defineSchema(), { nullable: true }),
			amount: new fields.NumberField({ integer: true, initial: 1 }),
			leveled: new fields.BooleanField({ initial: false }),
			per_die: new fields.BooleanField({ initial: false }),
			effective: new fields.BooleanField({ initial: false }),
		}
	}

	constructor(
		data: DeepPartial<SourceFromSchema<WeaponBonusSchema>>,
		options?: DataModelConstructionOptions<ItemDataModel>,
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
			this.dieCount = 1
		} else {
			this.dieCount = Int.from(wpn.damage.base!.count)
		}
		return this.adjustedAmount
	}

	override get adjustedAmount(): number {
		let amt = this.amount
		if (this.per_die) {
			if (this.dieCount < 0) return 0
			amt *= this.dieCount
		}
		if (this.leveled) {
			if (this.featureLevel < 0) return 0
			amt *= this.featureLevel
		}
		return amt
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
						// level: this.leveledAmount.format(this.percent ?? false),
						level: this.format(this.percent ?? false),
					},
				),
			)
		}
		buf.push("]")
		tooltip.push(buf)
	}

	get derivedLevel(): number {
		if (this.subOwner?.isOfType(ItemType.Trait, ItemType.TraitModifier)) {
			if (this.subOwner.system.isLeveled) return this.subOwner.system.levels
		} else if (this.owner?.isOfType(ItemType.Trait, ItemType.TraitModifier)) {
			if (this.owner.system.isLeveled) return this.owner.system.levels
		}
		return 0
	}

	override format(asPercentage: boolean): string {
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

	fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void {
		Nameable.extract(this.specialization.qualifier, m, existing)
		if (this.selection_type !== wsel.Type.ThisWeapon) {
			Nameable.extract(this.name.qualifier, m, existing)
			Nameable.extract(this.usage.qualifier, m, existing)
			Nameable.extract(this.tags.qualifier, m, existing)
		}
	}
}

interface WeaponBonus
	extends BaseFeature<WeaponBonusSchema>,
		Omit<ModelPropsFromSchema<WeaponBonusSchema>, "name" | "specialization" | "level" | "usage" | "tags"> {
	name: StringCriteria
	specialization: StringCriteria
	level: NumericCriteria
	usage: StringCriteria
	tags: StringCriteria
}

export { WeaponBonus }
