import { feature } from "@util/enum/feature.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import type { FeatureInstances } from "./types.ts"
import { TooltipGURPS } from "@util"
import { ItemType } from "@module/data/constants.ts"
import { BaseFeatureSchema } from "./data.ts"
import { ItemDataModel } from "@module/data/abstract.ts"
import { ItemGURPS2 } from "@module/document/item.ts"

abstract class BaseFeature<TSchema extends BaseFeatureSchema = BaseFeatureSchema> extends foundry.abstract.DataModel<
	ItemDataModel,
	TSchema
> {
	private declare _owner: ItemGURPS2 | null
	private declare _subOwner: ItemGURPS2 | null

	declare featureLevel: number

	declare static TYPE: feature.Type

	// static get TYPES(): Readonly<Record<feature.Type, ConstructorOf<Feature>>> {
	// 	return (BaseFeature.#TYPES ??= Object.freeze({
	// 		[feature.Type.AttributeBonus]: AttributeBonus,
	// 		[feature.Type.ConditionalModifierBonus]: ConditionalModifierBonus,
	// 		[feature.Type.DRBonus]: DRBonus,
	// 		[feature.Type.ReactionBonus]: ReactionBonus,
	// 		[feature.Type.SkillBonus]: SkillBonus,
	// 		[feature.Type.SkillPointBonus]: SkillPointBonus,
	// 		[feature.Type.SpellBonus]: SpellBonus,
	// 		[feature.Type.SpellPointBonus]: SpellPointBonus,
	// 		[feature.Type.WeaponBonus]: WeaponBonus,
	// 		[feature.Type.WeaponAccBonus]: WeaponBonus,
	// 		[feature.Type.WeaponScopeAccBonus]: WeaponBonus,
	// 		[feature.Type.WeaponDRDivisorBonus]: WeaponBonus,
	// 		[feature.Type.WeaponMinSTBonus]: WeaponBonus,
	// 		[feature.Type.WeaponMinReachBonus]: WeaponBonus,
	// 		[feature.Type.WeaponMaxReachBonus]: WeaponBonus,
	// 		[feature.Type.WeaponHalfDamageRangeBonus]: WeaponBonus,
	// 		[feature.Type.WeaponMinRangeBonus]: WeaponBonus,
	// 		[feature.Type.WeaponMaxRangeBonus]: WeaponBonus,
	// 		[feature.Type.WeaponRecoilBonus]: WeaponBonus,
	// 		[feature.Type.WeaponBulkBonus]: WeaponBonus,
	// 		[feature.Type.WeaponParryBonus]: WeaponBonus,
	// 		[feature.Type.WeaponBlockBonus]: WeaponBonus,
	// 		[feature.Type.WeaponRofMode1ShotsBonus]: WeaponBonus,
	// 		[feature.Type.WeaponRofMode1SecondaryBonus]: WeaponBonus,
	// 		[feature.Type.WeaponRofMode2ShotsBonus]: WeaponBonus,
	// 		[feature.Type.WeaponRofMode2SecondaryBonus]: WeaponBonus,
	// 		[feature.Type.WeaponNonChamberShotsBonus]: WeaponBonus,
	// 		[feature.Type.WeaponChamberShotsBonus]: WeaponBonus,
	// 		[feature.Type.WeaponShotDurationBonus]: WeaponBonus,
	// 		[feature.Type.WeaponReloadTimeBonus]: WeaponBonus,
	// 		[feature.Type.WeaponSwitch]: WeaponBonus,
	// 		[feature.Type.CostReduction]: CostReduction,
	// 		[feature.Type.ContainedWeightReduction]: ContainedWeightReduction,
	// 		[feature.Type.MoveBonus]: MoveBonus,
	// 	}))
	// }
	//
	// static #TYPES: any

	/**
	 * Type safe way of verifying if an Feature is of a particular type.
	 */
	isOfType<T extends feature.Type>(...types: T[]): this is FeatureInstances[T] {
		return types.some(t => this.type === t)
	}

	static override defineSchema(): BaseFeatureSchema {
		const fields = foundry.data.fields

		return {
			type: new fields.StringField({
				required: true,
				nullable: false,
				blank: false,
				choices: feature.Types,
				initial: this.TYPE,
			}),
			amount: new fields.NumberField({ required: true, integer: true, initial: 1 }),
			per_level: new fields.BooleanField({ required: true, nullable: false, initial: false }),
			temporary: new fields.BooleanField({ required: true, nullable: false, initial: false }),
		}
	}

	constructor(data: DeepPartial<SourceFromSchema<TSchema>>, options?: DataModelConstructionOptions<ItemDataModel>) {
		super(data, options)
		this._owner = null
		this._subOwner = null

		this.featureLevel = 0
	}

	get owner(): ItemGURPS2 | null {
		return this._owner
	}

	set owner(owner: ItemGURPS2 | null) {
		this._owner = owner
		if (owner !== null) {
			if (owner.isOfType(ItemType.Effect, ItemType.Condition)) this.temporary = true
			else this.temporary = false
		}
	}

	get subOwner(): ItemGURPS2 | null {
		return this._subOwner
	}

	set subOwner(subOwner: ItemGURPS2 | null) {
		this._subOwner = subOwner
	}

	// get levels(): number {
	// 	return this.leveledAmount.level
	// }
	//
	// set levels(level: number) {
	// 	if (!this.leveledAmount) {
	// 		this.leveledAmount = new LeveledAmount(this._source)
	// 	}
	// 	this.leveledAmount.level = level
	// }

	get parentName(): string {
		if (!this.owner) return LocalizeGURPS.translations.gurps.misc.unknown
		const owner = this.owner.system.nameWithReplacements
		if (!this.subOwner) return owner
		return `${owner} (${this.subOwner.system.nameWithReplacements})`
	}

	get adjustedAmount(): number {
		let amt = this.amount
		if (this.per_level) {
			if (this.featureLevel < 0) return 0
			amt *= this.featureLevel
		}
		return amt
	}

	// get adjustedAmount(): number {
	// 	return this.leveledAmount.adjustedAmount
	// }

	// get amount(): number {
	// 	return this.leveledAmount?.amount
	// }
	//
	// set amount(amt: number) {
	// 	if (!this.leveledAmount) {
	// 		// @ts-expect-error should be fine, but only works for levelable features
	// 		this.leveledAmount = new LeveledAmount(this._source)
	// 	}
	// 	this.leveledAmount.amount = amt
	// }

	addToTooltip(tooltip: TooltipGURPS | null): void {
		return this.basicAddToTooltip(tooltip)
	}

	basicAddToTooltip(tooltip: TooltipGURPS | null): void {
		if (tooltip !== null) {
			// tooltip.push("\n")
			tooltip.push(this.parentName)
			tooltip.push(" [")
			tooltip.push(this.format(false))
			tooltip.push("]")
		}
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

	abstract fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void
}

interface BaseFeature<TSchema extends BaseFeatureSchema>
	extends foundry.abstract.DataModel<ItemDataModel, TSchema>,
		ModelPropsFromSchema<BaseFeatureSchema> {
	consturctor: typeof BaseFeature<TSchema>
}

export { BaseFeature }
