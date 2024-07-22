import { feature } from "@util/enum/feature.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { TooltipGURPS } from "@util"
import type { ItemGURPS } from "@item"
import { ItemType } from "@module/data/constants.ts"
import { BaseFeatureSchema, LeveledAmountSchema } from "./data.ts"
import { LaxSchemaField } from "@system/schema-data-fields.ts"

abstract class BaseFeature<
	TSchema extends BaseFeatureSchema = BaseFeatureSchema
> extends foundry.abstract.DataModel<ItemGURPS, TSchema> {

	protected declare static _schema: LaxSchemaField<BaseFeatureSchema> | undefined

	declare private _owner: ItemGURPS | null
	declare private _subOwner: ItemGURPS | null

	declare effective: boolean
	declare leveledAmount: LeveledAmount

	static override defineSchema(): BaseFeatureSchema {
		const fields = foundry.data.fields

		return {
			type: new fields.StringField({ choices: feature.Types, initial: undefined }),
		}
	}

	static override get schema(): LaxSchemaField<BaseFeatureSchema> {
		if (this._schema && Object.hasOwn(this, "_schema")) return this._schema

		const schema = new LaxSchemaField(Object.freeze(this.defineSchema()))
		schema.name = this.name
		Object.defineProperty(this, "_schema", { value: schema, writable: false })

		return schema
	}

	constructor(
		data: DeepPartial<SourceFromSchema<TSchema>>,
		options?: DocumentConstructionContext<ItemGURPS>
	) {
		super(data, options)
		this._owner = null
		this._subOwner = null
		this.effective = false
		// @ts-expect-error should be fine, but only works for levelable features
		this.leveledAmount = new LeveledAmount(data)
	}

	get owner(): ItemGURPS | null {
		return this._owner
	}

	set owner(owner: ItemGURPS | null) {
		this._owner = owner
		if (owner !== null) {
			if (owner.isOfType(ItemType.Effect, ItemType.Condition)) this.effective = true
			else this.effective = false
		}
	}

	get subOwner(): ItemGURPS | null {
		return this._subOwner
	}

	set subOwner(subOwner: ItemGURPS | null) {
		this._subOwner = subOwner
	}

	get levels(): number {
		return this.leveledAmount.level
	}

	set levels(level: number) {
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

	basicAddToTooltip(amt: LeveledAmount, tooltip: TooltipGURPS | null): void {
		if (tooltip !== null) {
			// tooltip.push("\n")
			tooltip.push(this.parentName)
			tooltip.push(" [")
			tooltip.push(amt.format(false))
			tooltip.push("]")
		}
	}

}

interface BaseFeature<TSchema extends BaseFeatureSchema>
	extends foundry.abstract.DataModel<ItemGURPS, TSchema>, ModelPropsFromSchema<BaseFeatureSchema> { }

class LeveledAmount {

	declare level: number

	static defineSchema(): LeveledAmountSchema {
		const fields = foundry.data.fields

		return {
			amount: new fields.NumberField({ integer: true, initial: 1 }),
			per_level: new fields.BooleanField({ initial: false }),
			effective: new fields.BooleanField({ initial: false })
		}
	}

	constructor(data: DeepPartial<SourceFromSchema<LeveledAmountSchema>>) {
		this.level = 0
		this.amount = data.amount ?? 0
		this.per_level = data.per_level ?? false
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
}

interface LeveledAmount extends ModelPropsFromSchema<LeveledAmountSchema> { }


export { BaseFeature, LeveledAmount }
