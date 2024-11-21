import { Int, NumericComparison, StringComparison, TooltipGURPS, feature, wsel, wswitch } from "@util"
import fields = foundry.data.fields
import { BaseFeature, BaseFeatureSchema } from "./base-feature.ts"
import { ItemType } from "@module/data/constants.ts"
import { Nameable } from "@module/util/index.ts"
import { NumericCriteriaField } from "../item/fields/numeric-criteria-field.ts"
import { createButton, createDummyElement } from "@module/applications/helpers.ts"
import { BooleanSelectField } from "../item/fields/boolean-select-field.ts"
import { ActiveEffectGURPS } from "@module/documents/active-effect.ts"
import { ReplaceableStringCriteriaField } from "../item/fields/replaceable-string-criteria-field.ts"
import { BaseAttack } from "../action/base-attack.ts"

class WeaponBonus extends BaseFeature<WeaponBonusSchema> {
	declare dieCount: number

	// static override TYPE = feature.Type.WeaponBonus

	static override defineSchema(): WeaponBonusSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({
				required: true,
				nullable: false,
				blank: false,
				choices: feature.TypesChoices,
			}),
			percent: new fields.BooleanField({
				required: true,
				nullable: false,
				initial: false,

				label: "GURPS.Item.Features.FIELDS.WeaponBonus.Percent",
			}),
			switch_type: new fields.StringField({
				choices: wswitch.TypesChoices,
				nullable: true,
				blank: false,
				initial: null,
			}),
			switch_type_value: new BooleanSelectField({
				choices: {
					true: "GURPS.Item.Features.FIELDS.WeaponBonus.SwitchTypeValue.true",
					false: "GURPS.Item.Features.FIELDS.WeaponBonus.SwitchTypeValue.false",
				},
				required: true,
				nullable: true,
				initial: null,
			}),
			selection_type: new fields.StringField({
				required: true,
				nullable: false,
				blank: false,
				choices: wsel.TypesChoices,
				initial: wsel.Type.WithRequiredSkill,
			}),
			name: new ReplaceableStringCriteriaField({
				required: true,
				nullable: false,
				initial: { compare: StringComparison.Option.IsString, qualifier: "" },
			}),
			specialization: new ReplaceableStringCriteriaField({
				required: true,
				nullable: false,
				choices: StringComparison.CustomOptionsChoices("GURPS.Item.Features.FIELDS.WeaponBonus.Specialization"),
			}),
			level: new NumericCriteriaField({
				required: true,
				nullable: false,
				choices: NumericComparison.CustomOptionsChoices("GURPS.Item.Features.FIELDS.WeaponBonus.Level"),
				initial: { compare: NumericComparison.Option.AtLeastNumber, qualifier: 0 },
			}),
			usage: new ReplaceableStringCriteriaField({
				required: true,
				nullable: false,
				choices: StringComparison.CustomOptionsChoices("GURPS.Item.Features.FIELDS.WeaponBonus.Usage"),
			}),
			tags: new ReplaceableStringCriteriaField({
				required: true,
				nullable: false,
				choices: StringComparison.CustomOptionsChoicesPlural(
					"GURPS.Item.Features.FIELDS.SkillBonus.TagsSingle",
					"GURPS.Item.Features.FIELDS.SkillBonus.TagsPlural",
				),
			}),
			amount: new fields.NumberField({ integer: true, initial: 1 }),
			// leveled: new fields.BooleanField({ initial: false }),
			per_die: new fields.BooleanField({
				initial: false,
				label: "GURPS.Item.Features.FIELDS.WeaponBonus.PerDie",
			}),
		}
	}

	adjustedAmountForWeapon(wpn: BaseAttack): number {
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
		if (this.per_level) {
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
				game.i18n.format(`GURPS.Feature.WeaponBonus.${this.type}`, {
					type: this.switch_type!,
					value: this.switch_type_value!,
				}),
			)
		} else {
			buf.push(
				game.i18n.format(`GURPS.Feature.WeaponBonus.${this.type}`, {
					level: this.format(this.percent ?? false),
				}),
			)
		}
		buf.push("]")
		tooltip.push(buf)
	}

	get derivedLevel(): number {
		if (this.owner instanceof ActiveEffectGURPS || this.subOwner instanceof ActiveEffectGURPS) return 0

		if (this.subOwner?.isOfType(ItemType.Trait, ItemType.TraitModifier)) {
			if (this.subOwner.system.isLeveled) return this.subOwner.system.levels ?? 0
		} else if (this.owner?.isOfType(ItemType.Trait, ItemType.TraitModifier)) {
			if (this.owner.system.isLeveled) return this.owner.system.levels ?? 0
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
			case this.per_die && this.per_level:
				return game.i18n.format("GURPS.Feature.WeaponBonus.PerDiePerLevel", {
					total: adjustedAmt,
					base: amt,
				})
			case this.per_die:
				return game.i18n.format("GURPS.Feature.WeaponBonus.PerDie", {
					total: adjustedAmt,
					base: amt,
				})
			case this.per_level:
				return game.i18n.format("GURPS.Feature.WeaponBonus.PerLevel", {
					total: adjustedAmt,
					base: amt,
				})
			default:
				return amt
		}
	}

	override toFormElement(enabled: boolean): HTMLElement {
		const prefix = `system.features.${this.index}`
		const element = document.createElement("li")

		element.append(createDummyElement(`${prefix}.temporary`, this.temporary))
		if (!enabled) {
			element.append(createDummyElement(`${prefix}.type`, this.type))
			element.append(createDummyElement(`${prefix}.amount`, this.amount))
			element.append(createDummyElement(`${prefix}.per_level`, this.per_level))
			element.append(createDummyElement(`${prefix}.per_die`, this.per_die))
			element.append(createDummyElement(`${prefix}.percent`, this.percent))
			element.append(createDummyElement(`${prefix}.selection_type`, this.selection_type))
			element.append(createDummyElement(`${prefix}.name.compare`, this.name.compare))
			element.append(createDummyElement(`${prefix}.name.qualifier`, this.name.qualifier))
			element.append(createDummyElement(`${prefix}.specialization.compare`, this.specialization.compare))
			element.append(createDummyElement(`${prefix}.specialization.qualifier`, this.specialization.qualifier))
			element.append(createDummyElement(`${prefix}.usage.compare`, this.usage.compare))
			element.append(createDummyElement(`${prefix}.usage.qualifier`, this.usage.qualifier))
			element.append(createDummyElement(`${prefix}.tags.compare`, this.tags.compare))
			element.append(createDummyElement(`${prefix}.tags.qualifier`, this.tags.qualifier))

			if (this.switch_type !== null) element.append(createDummyElement(`${prefix}.switch_type`, this.switch_type))
			if (this.switch_type_value !== null)
				element.append(createDummyElement(`${prefix}.switch_type_value`, this.switch_type_value))
		}

		const rowElement1 = document.createElement("div")
		rowElement1.classList.add("form-fields")

		rowElement1.append(
			createButton({
				icon: ["fa-regular", "fa-trash"],
				label: "",
				data: {
					deleteFeature: "",
					index: this.index.toString(),
				},
				disabled: !enabled,
			}),
		)

		rowElement1.append(
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

		if (this.type === feature.Type.WeaponSwitch) {
			element.append(rowElement1)

			const rowElement2 = document.createElement("div")
			rowElement2.classList.add("form-fields", "secondary")

			const switchElement = this.schema.fields.switch_type.toInput({
				name: enabled ? `${prefix}.switch_type` : "",
				value: this.switch_type || wswitch.Type.CanBlock,
				localize: true,
				disabled: !enabled,
			}) as HTMLElement
			// Remove blank option
			switchElement.children.item(0)?.remove()
			rowElement2.append(switchElement)
			rowElement2.append(
				this.schema.fields.switch_type_value.toInput({
					name: enabled ? `${prefix}.switch_type_value` : "",
					value: this.switch_type_value || false,
					localize: true,
					disabled: !enabled,
				}) as HTMLElement,
			)
			element.append(rowElement2)
		} else {
			rowElement1.append(
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
			rowElement1.append(perLevelLabelElement)

			if (this.type !== feature.Type.WeaponEffectiveSTBonus && this.type !== feature.Type.WeaponMinSTBonus) {
				const perDieLabelElement = document.createElement("label")
				perDieLabelElement.append(
					this.schema.fields.per_die.toInput({
						name: enabled ? `${prefix}.per_die` : "",
						value: this.per_die,
						localize: true,
						disabled: !enabled,
					}) as HTMLElement,
				)
				perDieLabelElement.innerHTML += game.i18n.localize(this.schema.fields.per_die.options.label ?? "")
				rowElement1.append(perDieLabelElement)
			}

			const percentLabelElement = document.createElement("label")
			percentLabelElement.append(
				this.schema.fields.percent.toInput({
					name: enabled ? `${prefix}.percent` : "",
					value: this.percent,
					localize: true,
					disabled: !enabled,
				}) as HTMLElement,
			)
			percentLabelElement.innerHTML += game.i18n.localize(this.schema.fields.percent.options.label ?? "")
			rowElement1.append(percentLabelElement)

			element.append(rowElement1)
		}
		element.append(...this._getFormElementFilters(enabled))

		return element
	}

	private _getFormElementFilters(enabled: boolean): HTMLElement[] {
		const prefix = `system.features.${this.index}`
		const replacements = this.replacements

		const rowElement1 = document.createElement("div")
		rowElement1.classList.add("form-fields", "secondary")
		const rowElement2 = document.createElement("div")
		rowElement2.classList.add("form-fields", "secondary")
		const rowElement3 = document.createElement("div")
		rowElement3.classList.add("form-fields", "secondary")
		const rowElement4 = document.createElement("div")
		rowElement4.classList.add("form-fields", "secondary")
		const rowElement5 = document.createElement("div")
		rowElement5.classList.add("form-fields", "secondary")

		// Selection Type and Name
		rowElement1.append(
			this.schema.fields.selection_type.toInput({
				name: enabled ? `${prefix}.selection_type` : "",
				value: this.selection_type,
				localize: true,
				disabled: !enabled,
			}) as HTMLElement,
		)
		rowElement1.append(
			this.schema.fields.name.fields.compare.toInput({
				name: enabled ? `${prefix}.name.compare` : "",
				value: this.name.compare,
				localize: true,
				disabled: !enabled || this.selection_type === wsel.Type.ThisWeapon,
			}) as HTMLElement,
		)
		rowElement1.append(
			this.schema.fields.name.fields.qualifier.toInput({
				name: enabled ? `${prefix}.name.qualifier` : "",
				value: this.name.qualifier,
				disabled:
					!enabled ||
					this.selection_type === wsel.Type.ThisWeapon ||
					this.name.compare === StringComparison.Option.AnyString,
				replacements,
			}) as HTMLElement,
		)

		// Specialization
		rowElement2.append(
			this.schema.fields.specialization.fields.compare.toInput({
				name: enabled ? `${prefix}.specialization.compare` : "",
				value: this.specialization.compare,
				localize: true,
				disabled: !enabled,
			}) as HTMLElement,
		)
		rowElement2.append(
			this.schema.fields.specialization.fields.qualifier.toInput({
				name: enabled ? `${prefix}.specialization.qualifier` : "",
				value: this.specialization.qualifier,
				disabled: !enabled || this.specialization.compare === StringComparison.Option.AnyString,
				replacements,
			}) as HTMLElement,
		)

		// Usage
		rowElement3.append(
			this.schema.fields.usage.fields.compare.toInput({
				name: enabled ? `${prefix}.usage.compare` : "",
				value: this.usage.compare,
				localize: true,
				disabled: !enabled,
			}) as HTMLElement,
		)
		rowElement3.append(
			this.schema.fields.usage.fields.qualifier.toInput({
				name: enabled ? `${prefix}.usage.qualifier` : "",
				value: this.usage.qualifier,
				disabled: !enabled || this.usage.compare === StringComparison.Option.AnyString,
				replacements,
			}) as HTMLElement,
		)

		// Tags
		rowElement4.append(
			this.schema.fields.tags.fields.compare.toInput({
				name: enabled ? `${prefix}.tags.compare` : "",
				value: this.tags.compare,
				localize: true,
				disabled: !enabled,
			}) as HTMLElement,
		)
		rowElement4.append(
			this.schema.fields.tags.fields.qualifier.toInput({
				name: enabled ? `${prefix}.tags.qualifier` : "",
				value: this.tags.qualifier,
				disabled: !enabled || this.tags.compare === StringComparison.Option.AnyString,
				replacements,
			}) as HTMLElement,
		)

		// Level
		rowElement5.append(
			this.schema.fields.level.fields.compare.toInput({
				name: enabled ? `${prefix}.level.compare` : "",
				value: this.level.compare,
				localize: true,
				disabled: !enabled,
			}) as HTMLElement,
		)
		rowElement5.append(
			this.schema.fields.level.fields.qualifier.toInput({
				name: enabled ? `${prefix}.level.qualifier` : "",
				value: this.level.qualifier.toString(),
				disabled: !enabled || this.level.compare === NumericComparison.Option.AnyNumber,
			}) as HTMLElement,
		)

		switch (this.selection_type) {
			case wsel.Type.WithName:
				return [rowElement1, rowElement3, rowElement4]
			case wsel.Type.WithRequiredSkill:
				return [rowElement1, rowElement2, rowElement3, rowElement4, rowElement5]
			case wsel.Type.ThisWeapon:
				return [rowElement1, rowElement3]
		}
	}

	fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void {
		Nameable.extract(this.specialization?.qualifier ?? "", m, existing)
		if (this.selection_type !== wsel.Type.ThisWeapon) {
			Nameable.extract(this.name?.qualifier ?? "", m, existing)
			Nameable.extract(this.usage?.qualifier ?? "", m, existing)
			Nameable.extract(this.tags?.qualifier ?? "", m, existing)
		}
	}
}

interface WeaponBonus extends BaseFeature<WeaponBonusSchema>, ModelPropsFromSchema<WeaponBonusSchema> {}

type WeaponBonusSchema = BaseFeatureSchema & {
	percent: fields.BooleanField<boolean, boolean, true, false, true>
	switch_type: fields.StringField<string, wswitch.Type, true, true>
	switch_type_value: BooleanSelectField<boolean, boolean, true, true, true>
	selection_type: fields.StringField<wsel.Type, wsel.Type, true, false, true>
	name: ReplaceableStringCriteriaField<true, false, true>
	specialization: ReplaceableStringCriteriaField<true, false, true>
	level: NumericCriteriaField<true, false, true>
	usage: ReplaceableStringCriteriaField<true, false, true>
	tags: ReplaceableStringCriteriaField<true, false, true>
	amount: fields.NumberField<number, number, true, false>
	// leveled: fields.BooleanField<boolean, boolean, true, false, true>
	per_die: fields.BooleanField<boolean, boolean, true, false, true>
}

export { WeaponBonus, type WeaponBonusSchema }
