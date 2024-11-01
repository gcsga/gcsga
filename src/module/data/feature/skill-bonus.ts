import fields = foundry.data.fields
import { StringComparison, feature, skillsel } from "@util"
import { BaseFeature, BaseFeatureSchema } from "./base-feature.ts"
import { Nameable } from "@module/util/index.ts"
import { StringCriteriaField } from "../item/fields/string-criteria-field.ts"
import { createDummyElement } from "@module/applications/helpers.ts"

class SkillBonus extends BaseFeature<SkillBonusSchema> {
	static override TYPE = feature.Type.SkillBonus

	static override defineSchema(): SkillBonusSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			selection_type: new fields.StringField({
				required: true,
				nullable: false,
				blank: false,
				choices: skillsel.TypesChoices,
				initial: skillsel.Type.Name,
			}),
			name: new StringCriteriaField({
				required: true,
				nullable: false,
				initial: { compare: StringComparison.Option.IsString, qualifier: "" },
			}),
			specialization: new StringCriteriaField({
				required: true,
				nullable: false,
				choices: StringComparison.CustomOptionsChoices("GURPS.Item.Features.FIELDS.SkillBonus.Specialization"),
			}),
			tags: new StringCriteriaField({
				required: true,
				nullable: false,
				choices: StringComparison.CustomOptionsChoicesPlural(
					"GURPS.Item.Features.FIELDS.SkillBonus.TagsSingle",
					"GURPS.Item.Features.FIELDS.SkillBonus.TagsPlural",
				),
			}),
		}
	}

	override toFormElement(enabled: boolean): HTMLElement {
		const prefix = `system.features.${this.index}`
		const element = super.toFormElement(enabled)

		if (!enabled) {
			element.append(createDummyElement(`${prefix}.selection_type`, this.selection_type))
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

		// Selection Type
		rowElement1.append(
			this.schema.fields.selection_type.toInput({
				name: enabled ? `${prefix}.selection_type` : "",
				value: this.selection_type,
				localize: true,
				disabled: !enabled,
			}) as HTMLElement,
		)
		// Name
		rowElement1.append(
			this.schema.fields.name.fields.compare.toInput({
				name: enabled ? `${prefix}.name.compare` : "",
				value: this.name.compare,
				localize: true,
				disabled: !enabled || this.selection_type === skillsel.Type.ThisWeapon,
			}) as HTMLElement,
		)
		rowElement1.append(
			this.schema.fields.name.fields.qualifier.toInput({
				name: enabled ? `${prefix}.name.qualifier` : "",
				value: this.name.qualifier,
				disabled:
					!enabled ||
					this.selection_type === skillsel.Type.ThisWeapon ||
					this.name.compare === StringComparison.Option.AnyString,
			}) as HTMLElement,
		)
		element.append(rowElement1)

		// Specialization | Usage
		const specializationOptions = Object.entries(
			StringComparison.CustomOptionsChoices("GURPS.Item.Features.FIELDS.SkillBonus.Specialization"),
		).map(([value, label]) => {
			return { value, label }
		})
		const usageOptions = Object.entries(
			StringComparison.CustomOptionsChoices("GURPS.Item.Features.FIELDS.SkillBonus.Usage"),
		).map(([value, label]) => {
			return { value, label }
		})
		rowElement2.append(
			foundry.applications.fields.createSelectInput({
				name: enabled ? `${prefix}.specialization.compare` : "",
				value: this.specialization.compare,
				localize: true,
				options: this.selection_type === skillsel.Type.Name ? specializationOptions : usageOptions,
				disabled: !enabled,
			}),
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
		if (this.selection_type !== skillsel.Type.ThisWeapon) {
			const rowElement3 = document.createElement("div")
			rowElement3.classList.add("form-fields", "secondary")

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
		}

		return element
	}

	fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void {
		Nameable.extract(this.specialization.qualifier, m, existing)
		if (this.selection_type !== skillsel.Type.ThisWeapon) {
			Nameable.extract(this.name.qualifier, m, existing)
			Nameable.extract(this.tags.qualifier, m, existing)
		}
	}
}

interface SkillBonus extends BaseFeature<SkillBonusSchema>, ModelPropsFromSchema<SkillBonusSchema> {}

type SkillBonusSchema = BaseFeatureSchema & {
	selection_type: fields.StringField<skillsel.Type, skillsel.Type, true, false, true>
	name: StringCriteriaField<true, false, true>
	specialization: StringCriteriaField<true, false, true>
	tags: StringCriteriaField<true, false, true>
}

export { SkillBonus, type SkillBonusSchema }
