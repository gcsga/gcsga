import { Nameable } from "@module/util/index.ts"
import { StringComparison, TooltipGURPS, feature } from "@util"
import { LocalizeGURPS } from "@util/localize.ts"
import { BaseFeature, BaseFeatureSchema } from "./base-feature.ts"
import { StringCriteriaField } from "../item/fields/string-criteria-field.ts"
import { createDummyElement } from "@module/applications/helpers.ts"

class SkillPointBonus extends BaseFeature<SkillPointBonusSchema> {
	static override TYPE = feature.Type.SkillPointBonus

	static override defineSchema(): SkillPointBonusSchema {
		return {
			...super.defineSchema(),
			name: new StringCriteriaField({
				required: true,
				nullable: false,
				choices: StringComparison.CustomOptionsChoices("GURPS.Item.Features.FIELDS.SkillPointBonus.Name"),
				initial: { compare: StringComparison.Option.IsString, qualifier: "" },
			}),
			specialization: new StringCriteriaField({
				required: true,
				nullable: false,
				choices: StringComparison.CustomOptionsChoices(
					"GURPS.Item.Features.FIELDS.SkillPointBonus.Specialization",
				),
			}),
			tags: new StringCriteriaField({
				required: true,
				nullable: false,
				choices: StringComparison.CustomOptionsChoicesPlural(
					"GURPS.Item.Features.FIELDS.SkillPointBonus.TagsSingle",
					"GURPS.Item.Features.FIELDS.SkillPointBonus.TagsPlural",
				),
			}),
		}
	}

	override addToTooltip(tooltip: TooltipGURPS | null): void {
		if (tooltip !== null) {
			let lang = LocalizeGURPS.translations.gurps.feature.points_multiple
			if (this.adjustedAmount === 1) lang = LocalizeGURPS.translations.gurps.feature.points_one
			if (tooltip.length !== 0) tooltip.push("<br>")
			tooltip.push(
				LocalizeGURPS.format(lang, {
					source: this.parentName,
					// amount: this.leveledAmount.format(false),
					amount: this.format(false),
				}),
			)
		}
	}

	override toFormElement(enabled: boolean): HTMLElement {
		const prefix = `system.features.${this.index}`
		const element = super.toFormElement(enabled)

		if (!enabled) {
			element.append(createDummyElement(`${prefix}.name.compare`, this.name.compare))
			element.append(createDummyElement(`${prefix}.name.qualifier`, this.name.qualifier))
			element.append(createDummyElement(`${prefix}.specialization.compare`, this.specialization.compare))
			element.append(createDummyElement(`${prefix}.specialization.qualifier`, this.specialization.qualifier))
			element.append(createDummyElement(`${prefix}.tags.compare`, this.tags.compare))
			element.append(createDummyElement(`${prefix}.tags.qualifier`, this.tags.qualifier))
		}

		const rowElement1 = document.createElement("div")
		rowElement1.classList.add("form-fields", "secondary")
		const rowElement2 = document.createElement("div")
		rowElement2.classList.add("form-fields", "secondary")
		const rowElement3 = document.createElement("div")
		rowElement3.classList.add("form-fields", "secondary")

		// Name
		rowElement1.append(
			this.schema.fields.name.fields.compare.toInput({
				name: enabled ? `${prefix}.name.compare` : "",
				value: this.name.compare,
				localize: true,
				disabled: !enabled,
			}) as HTMLElement,
		)
		rowElement1.append(
			this.schema.fields.name.fields.qualifier.toInput({
				name: enabled ? `${prefix}.name.qualifier` : "",
				value: this.name.qualifier,
				disabled: !enabled || this.name.compare === StringComparison.Option.AnyString,
			}) as HTMLElement,
		)
		element.append(rowElement1)

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
			}) as HTMLElement,
		)
		element.append(rowElement2)

		// Tags
		rowElement3.append(
			this.schema.fields.tags.fields.compare.toInput({
				name: enabled ? `${prefix}.tags.compare` : "",
				value: this.tags.compare,
				localize: true,
				disabled: !enabled,
			}) as HTMLElement,
		)
		rowElement3.append(
			this.schema.fields.tags.fields.qualifier.toInput({
				name: enabled ? `${prefix}.tags.qualifier` : "",
				value: this.tags.qualifier,
				disabled: !enabled || this.tags.compare === StringComparison.Option.AnyString,
			}) as HTMLElement,
		)
		element.append(rowElement3)

		return element
	}

	fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void {
		Nameable.extract(this.specialization.qualifier, m, existing)
		Nameable.extract(this.name.qualifier, m, existing)
		Nameable.extract(this.tags.qualifier, m, existing)
	}
}

interface SkillPointBonus extends BaseFeature<SkillPointBonusSchema>, ModelPropsFromSchema<SkillPointBonusSchema> {}

type SkillPointBonusSchema = BaseFeatureSchema & {
	name: StringCriteriaField<true, false, true>
	specialization: StringCriteriaField<true, false, true>
	tags: StringCriteriaField<true, false, true>
}

export { SkillPointBonus, type SkillPointBonusSchema }
