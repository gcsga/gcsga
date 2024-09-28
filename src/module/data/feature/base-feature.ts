import { feature } from "@util/enum/feature.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import type { Feature, FeatureInstances } from "./types.ts"
import { TooltipGURPS } from "@util"
import { ItemType } from "@module/data/constants.ts"
import { BaseFeatureSchema } from "./data.ts"
import { ItemDataModel } from "@module/data/abstract.ts"
import { ItemGURPS2 } from "@module/document/item.ts"
import { ItemTemplateType } from "@module/data/item/types.ts"
import { createButton } from "@module/applications/helpers.ts"

abstract class BaseFeature<TSchema extends BaseFeatureSchema = BaseFeatureSchema> extends foundry.abstract.DataModel<
	ItemDataModel,
	TSchema
> {
	private declare _owner: ItemGURPS2 | null
	private declare _subOwner: ItemGURPS2 | null

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
				label: "PER LEVEL???",
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

	get index(): number {
		if (!this.parent.hasTemplate(ItemTemplateType.Feature)) return -1
		return this.parent.features.indexOf(this as unknown as Feature)
	}

	// get levels(): number HTMLElemene/ 	return this.leveledAmount.level
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
		if (!this.owner.hasTemplate(ItemTemplateType.BasicInformation))
			return LocalizeGURPS.translations.gurps.misc.unknown
		const owner = this.owner.system.nameWithReplacements
		if (!this.subOwner) return owner
		if (!this.subOwner.hasTemplate(ItemTemplateType.BasicInformation))
			return LocalizeGURPS.translations.gurps.misc.unknown
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
		return new Handlebars.SafeString(this.toFormElement().outerHTML)
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
			return LocalizeGURPS.format(LocalizeGURPS.translations.gurps.feature.weapon_bonus.per_level, {
				total: adjustedAmt,
				base: amt,
			})
		return amt
	}

	toFormElement(): HTMLElement {
		const element = document.createElement("li")
		const prefix = `system.features.${this.index}`

		const temporaryInput = this.schema.fields.type.toInput({
			name: `${prefix}.id`,
			value: this.type,
			readonly: true,
		}) as HTMLElement
		temporaryInput.style.setProperty("display", "none")
		element.append(temporaryInput)

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
			}),
		)

		rowElement.append(
			this.schema.fields.type.toInput({
				name: `${prefix}.type`,
				value: this.type,
				dataset: {
					selector: "feature-type",
					index: this.index.toString(),
				},
				localize: true,
			}) as HTMLElement,
		)

		rowElement.append(
			this.schema.fields.amount.toInput({
				name: `${prefix}.amount`,
				value: this.amount.toString(),
				localize: true,
			}) as HTMLElement,
		)

		const perLevelLabelElement = document.createElement("label")
		perLevelLabelElement.append(
			this.schema.fields.per_level.toInput({
				name: `${prefix}.per_level`,
				value: this.per_level,
				localize: true,
			}) as HTMLElement,
		)
		perLevelLabelElement.innerHTML += this.schema.fields.per_level.options.label ?? ""
		rowElement.append(perLevelLabelElement)

		element.append(rowElement)

		return element
	}

	abstract fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void
}

interface BaseFeature<TSchema extends BaseFeatureSchema>
	extends foundry.abstract.DataModel<ItemDataModel, TSchema>,
		ModelPropsFromSchema<BaseFeatureSchema> {
	consturctor: typeof BaseFeature<TSchema>
}

export { BaseFeature }
