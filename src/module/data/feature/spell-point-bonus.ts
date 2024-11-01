import { Nameable } from "@module/util/index.ts"
import { StringComparison, feature, spellmatch } from "@util"
import { StringCriteriaField } from "../item/fields/string-criteria-field.ts"
import { BaseFeature, BaseFeatureSchema } from "./base-feature.ts"
import fields = foundry.data.fields
import { createDummyElement } from "@module/applications/helpers.ts"

class SpellPointBonus extends BaseFeature<SpellPointBonusSchema> {
	static override TYPE = feature.Type.SpellPointBonus

	static override defineSchema(): SpellPointBonusSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			match: new fields.StringField({
				required: true,
				nullable: false,
				blank: false,
				choices: spellmatch.TypesChoices,
				initial: spellmatch.Type.AllColleges,
			}),
			name: new StringCriteriaField({
				required: true,
				nullable: false,
				initial: { compare: StringComparison.Option.IsString, qualifier: "" },
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

	matchForType(replacements: Map<string, string>, name: string, powerSource: string, colleges: string[]): boolean {
		return spellmatch.Type.matchForType(this.match, replacements, this.name, name, powerSource, colleges)
	}

	override toFormElement(enabled: boolean): HTMLElement {
		const prefix = `system.features.${this.index}`
		const element = super.toFormElement(enabled)

		if (!enabled) {
			element.append(createDummyElement(`${prefix}.match`, this.match))
			element.append(createDummyElement(`${prefix}.name.compare`, this.name.compare))
			element.append(createDummyElement(`${prefix}.name.qualifier`, this.name.qualifier))
			element.append(createDummyElement(`${prefix}.tags.compare`, this.tags.compare))
			element.append(createDummyElement(`${prefix}.tags.qualifier`, this.tags.qualifier))
		}

		const rowElement1 = document.createElement("div")
		rowElement1.classList.add("form-fields", "secondary")
		const rowElement2 = document.createElement("div")
		rowElement2.classList.add("form-fields", "secondary")

		// Selection Type
		rowElement1.append(
			this.schema.fields.match.toInput({
				name: enabled ? `${prefix}.match` : "",
				value: this.match,
				localize: true,
				disabled: !enabled,
			}) as HTMLElement,
		)
		// Name
		rowElement1.append(
			this.schema.fields.name.fields.compare.toInput({
				name: enabled ? `${prefix}.name.compare` : "",
				value: this.name.compare,
				disabled: !enabled || this.match === spellmatch.Type.AllColleges,
				localize: true,
			}) as HTMLElement,
		)
		rowElement1.append(
			this.schema.fields.name.fields.qualifier.toInput({
				name: enabled ? `${prefix}.name.qualifier` : "",
				value: this.name.qualifier,
				disabled:
					!enabled ||
					this.name.compare === StringComparison.Option.AnyString ||
					this.match === spellmatch.Type.AllColleges,
			}) as HTMLElement,
		)
		element.append(rowElement1)

		// Tags
		rowElement2.append(
			this.schema.fields.tags.fields.compare.toInput({
				name: enabled ? `${prefix}.tags.compare` : "",
				value: this.tags.compare,
				localize: true,
				disabled: !enabled,
			}) as HTMLElement,
		)
		rowElement2.append(
			this.schema.fields.tags.fields.qualifier.toInput({
				name: enabled ? `${prefix}.tags.qualifier` : "",
				value: this.tags.qualifier,
				disabled: !enabled || this.tags.compare === StringComparison.Option.AnyString,
			}) as HTMLElement,
		)
		element.append(rowElement2)

		return element
	}

	fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void {
		if (this.match !== spellmatch.Type.AllColleges) {
			Nameable.extract(this.name.qualifier, m, existing)
		}
		Nameable.extract(this.tags.qualifier, m, existing)
	}
}

interface SpellPointBonus extends BaseFeature<SpellPointBonusSchema>, ModelPropsFromSchema<SpellPointBonusSchema> {}

type SpellPointBonusSchema = BaseFeatureSchema & {
	match: fields.StringField<spellmatch.Type, spellmatch.Type, true, false, true>
	name: StringCriteriaField<true, false, true>
	tags: StringCriteriaField<true, false, true>
}

export { SpellPointBonus, type SpellPointBonusSchema }
