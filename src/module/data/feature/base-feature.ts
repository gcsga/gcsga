import { createButton, createDummyElement } from "@module/applications/helpers.ts"
import { ItemDataModel } from "@module/data/item/abstract.ts"
import { ItemType } from "@module/data/constants.ts"
import { ItemTemplateType } from "@module/data/item/types.ts"
import { ActiveEffectGURPS } from "@module/documents/active-effect.ts"
import { type ItemGURPS2 } from "@module/documents/item.ts"
import { TooltipGURPS } from "@util"
import { feature } from "@util/enum/feature.ts"
import type { Feature, FeatureInstances } from "./types.ts"
import fields = foundry.data.fields
import { EffectDataModel } from "../active-effect/abstract.ts"

abstract class BaseFeature<TSchema extends BaseFeatureSchema = BaseFeatureSchema> extends foundry.abstract.DataModel<
	ItemDataModel | EffectDataModel,
	TSchema
> {
	private declare _owner: ItemGURPS2 | ActiveEffectGURPS | null
	private declare _subOwner: ItemGURPS2 | ActiveEffectGURPS | null

	declare featureLevel: number

	declare static TYPE: feature.Type
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
				choices: feature.TypesChoices,
				initial: this.TYPE,
			}),
			amount: new fields.NumberField({ required: true, integer: true, initial: 1 }),
			per_level: new fields.BooleanField({
				required: true,
				nullable: false,
				initial: false,
				label: "GURPS.Item.Features.FIELDS.PerLevel",
			}),
			temporary: new fields.BooleanField({ required: true, nullable: false, initial: false }),
		}
	}

	constructor(data: DeepPartial<SourceFromSchema<TSchema>>, options?: DataModelConstructionOptions<ItemDataModel>) {
		super(data, options)
		this._owner = null
		this._subOwner = null

		this.featureLevel = 0
	}

	get owner(): ItemGURPS2 | ActiveEffectGURPS | null {
		return this._owner
	}

	set owner(owner: ItemGURPS2 | ActiveEffectGURPS | null) {
		this._owner = owner
		if (owner !== null) {
			if (owner instanceof ActiveEffectGURPS) this.temporary = true
			// if (owner.isOfType(ItemType.Effect, ItemType.Condition)) this.temporary = true
			else this.temporary = false
		}
	}

	get subOwner(): ItemGURPS2 | ActiveEffectGURPS | null {
		return this._subOwner
	}

	set subOwner(subOwner: ItemGURPS2 | ActiveEffectGURPS | null) {
		this._subOwner = subOwner
	}

	get index(): number {
		if (this.parent instanceof ItemDataModel && !this.parent.hasTemplate(ItemTemplateType.Feature)) return -1

		return (this.parent as any).features.indexOf(this as unknown as Feature)
	}

	get parentName(): string {
		if (!this.owner) return "Unknown"
		if (this.owner instanceof ActiveEffectGURPS) return this.owner.name

		if (!this.owner.hasTemplate(ItemTemplateType.BasicInformation)) return "Unknown"
		const owner = this.owner.system.nameWithReplacements
		if (!this.subOwner) return owner
		if (this.subOwner instanceof ActiveEffectGURPS) return this.subOwner.name

		if (!this.subOwner.hasTemplate(ItemTemplateType.BasicInformation)) return "Unknown"
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

	get element(): Handlebars.SafeString {
		const enabled: boolean = (this.parent.parent.sheet as any).editable
		return new Handlebars.SafeString(this.toFormElement(enabled).outerHTML)
	}

	get nameableReplacements(): Map<string, string> {
		return this.parent instanceof ItemDataModel && this.parent.hasTemplate(ItemTemplateType.Replacement)
			? this.parent.nameableReplacements
			: new Map()
	}

	getTypeChoices(): { value: string; label: string }[] {
		const choices =
			!(this.parent instanceof ItemDataModel) || this.parent.isOfType(ItemType.EquipmentContainer)
				? feature.TypesChoices
				: feature.TypesWithoutContainedWeightReductionChoices

		return Object.entries(choices).map(([value, label]) => {
			return { value, label }
		})
	}

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
			return game.i18n.format("GURPS.Feature.WeaponBonus.PerLevel", {
				total: adjustedAmt,
				base: amt,
			})
		return amt
	}

	toFormElement(enabled: boolean): HTMLElement {
		const prefix = `system.features.${this.index}`
		const element = document.createElement("li")

		element.append(createDummyElement(`${prefix}.temporary`, this.temporary))
		if (!enabled) {
			element.append(createDummyElement(`${prefix}.type`, this.type))
			element.append(createDummyElement(`${prefix}.amount`, this.amount))
			element.append(createDummyElement(`${prefix}.per_level`, this.per_level))
		}

		const rowElement = document.createElement("div")
		rowElement.classList.add("form-fields")

		rowElement.append(
			createButton({
				icon: ["fa-regular", "fa-trash"],
				label: "",
				data: {
					action: "deleteFeature",
					index: this.index.toString(),
				},
				disabled: !enabled,
			}),
		)

		rowElement.append(
			foundry.applications.fields.createSelectInput({
				name: enabled ? `${prefix}.type` : "",
				value: this.type,
				dataset: {
					selector: "feature-type",
					index: this.index.toString(),
				},
				localize: true,
				options: this.getTypeChoices(),
				disabled: !enabled,
			}),
		)

		rowElement.append(
			this.schema.fields.amount.toInput({
				name: enabled ? `${prefix}.amount` : "",
				value: this.amount.toString(),
				localize: true,
				disabled: !enabled,
			}) as HTMLElement,
		)

		const perLevelLabelElement = document.createElement("label")
		perLevelLabelElement.append(
			this.schema.fields.per_level.toInput({
				name: enabled ? `${prefix}.per_level` : "",
				value: this.per_level,
				localize: true,
				disabled: !enabled,
			}) as HTMLElement,
		)
		perLevelLabelElement.innerHTML += game.i18n.localize(this.schema.fields.per_level.options.label ?? "")
		rowElement.append(perLevelLabelElement)

		element.append(rowElement)

		return element
	}

	abstract fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void
}

interface BaseFeature<TSchema extends BaseFeatureSchema>
	extends foundry.abstract.DataModel<ItemDataModel | EffectDataModel, TSchema>,
		ModelPropsFromSchema<BaseFeatureSchema> {
	consturctor: typeof BaseFeature<TSchema>
}

type BaseFeatureSchema = {
	type: fields.StringField<feature.Type, feature.Type, true>
	amount: fields.NumberField<number, number, true, false>
	per_level: fields.BooleanField
	temporary: fields.BooleanField<boolean, boolean, true, false, true>
}

export { BaseFeature, type BaseFeatureSchema }
