import { BasePrereq, BasePrereqSchema, PrereqConstructionOptions } from "./base-prereq.ts"
import fields = foundry.data.fields
import { prereq } from "@util/enum/prereq.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { ActorType, gid } from "@data"
import { NumericComparison, TooltipGURPS } from "@util"
import { ActorInst } from "../actor/helpers.ts"
import { NumericCriteriaField } from "../item/fields/numeric-criteria-field.ts"
import { getAttributeChoices } from "../attribute/helpers.ts"
import { BooleanSelectField } from "../item/fields/boolean-select-field.ts"

class AttributePrereq extends BasePrereq<AttributePrereqSchema> {
	static override TYPE = prereq.Type.Attribute

	constructor(data: DeepPartial<SourceFromSchema<AttributePrereqSchema>>, options?: PrereqConstructionOptions) {
		super(data, options)
		if (options?.parent?.actor) {
			const actor = options.parent.actor
			const whichChoices = getAttributeChoices(
				actor,
				data.which ?? gid.Strength,
				"GURPS.Item.Prereqs.FIELDS.Attribute.Which",
				{
					blank: false,
					ten: false,
					size: true,
					dodge: true,
					parry: true,
					block: true,
					skill: false,
				},
			)
			const combinedWithChoices = getAttributeChoices(
				actor,
				data.combined_with ?? "",
				"GURPS.Item.Prereqs.FIELDS.Attribute.CombinedWith",
				{
					blank: true,
					ten: false,
					size: true,
					dodge: true,
					parry: true,
					block: true,
					skill: false,
				},
			)
			;(this.schema.fields.which as any).choices = whichChoices.choices
			this.which = whichChoices.current
			;(this.schema.fields.combined_with as any).choices = combinedWithChoices.choices
			this.combined_with = combinedWithChoices.current
		}
	}

	static override defineSchema(): AttributePrereqSchema {
		const fields = foundry.data.fields

		const whichChoices = getAttributeChoices(null, gid.Strength, "GURPS.Item.Prereqs.FIELDS.Attribute.Which", {
			blank: false,
			ten: false,
			size: true,
			dodge: true,
			parry: true,
			block: true,
			skill: false,
		})
		const combinedWithChoices = getAttributeChoices(null, "", "GURPS.Item.Prereqs.FIELDS.Attribute.CombinedWith", {
			blank: true,
			ten: false,
			size: true,
			dodge: true,
			parry: true,
			block: true,
			skill: false,
		})

		const localizationKey = "GURPS.Item.Prereqs.FIELDS.Attribute.Compare"

		return {
			...super.defineSchema(),
			has: new BooleanSelectField({
				required: true,
				nullable: false,
				choices: {
					true: "GURPS.Item.Prereqs.FIELDS.Has.Choices.true",
					false: "GURPS.Item.Prereqs.FIELDS.Has.Choices.false",
				},
				initial: true,
			}),
			which: new fields.StringField({
				required: true,
				nullable: false,
				choices: whichChoices.choices,
				initial: whichChoices.current,
			}),
			combined_with: new fields.StringField({
				required: true,
				nullable: false,
				blank: true,
				choices: combinedWithChoices.choices,
				initial: combinedWithChoices.current,
			}),
			value: new NumericCriteriaField({
				required: true,
				nullable: false,
				choices: NumericComparison.CustomOptionsChoices(localizationKey),
				initial: {
					compare: NumericComparison.Option.AtLeastNumber,
					qualifier: 10,
				},
			}),
		}
	}

	satisfied(actor: ActorInst<ActorType.Character>, _exclude: unknown, tooltip: TooltipGURPS | null): boolean {
		let value = actor.system.resolveAttributeCurrent(this.which)
		if (this.combined_with !== "") value += actor.system.resolveAttributeCurrent(this.combined_with)

		let satisfied = this.value.matches(value)
		if (!this.has) satisfied = !satisfied

		if (!satisfied && tooltip !== null) {
			tooltip.push(LocalizeGURPS.translations.GURPS.Tooltip.Prefix)
			if (this.combined_with !== "") {
				tooltip.push(
					LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Prereq.Attribute.CombinedWith, {
						has: this.hasText,
						att1: this.which,
						att2: this.combined_with,
						qualifier: this.value.toString(),
					}),
				)
			} else {
				tooltip.push(
					LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Prereq.Attribute.NotCombinedWith, {
						has: this.hasText,
						att1: this.which,
						qualifier: this.value.toString(),
					}),
				)
			}
		}
		return satisfied
	}

	override toFormElement(): HTMLElement {
		const prefix = `system.prereqs.${this.index}`

		// Root element
		const element = super.toFormElement()

		const rowElement = document.createElement("div")
		rowElement.classList.add("form-fields")

		// Which
		rowElement.append(
			this.schema.fields.which.toInput({
				name: `${prefix}.which`,
				value: this.which,
			}) as HTMLElement,
		)

		// Combined With
		rowElement.append(
			this.schema.fields.combined_with.toInput({
				name: `${prefix}.combined_with`,
				value: this.combined_with,
			}) as HTMLElement,
		)

		// Compare
		rowElement.append(
			this.schema.fields.value.fields.compare.toInput({
				name: `${prefix}.value.compare`,
				value: this.value.compare,
			}) as HTMLElement,
		)

		// Qualifier
		rowElement.append(
			this.schema.fields.value.fields.qualifier.toInput({
				name: `${prefix}.value.qualifier`,
				value: this.value.qualifier.toString(),
			}) as HTMLElement,
		)

		element.append(rowElement)

		return element
	}

	fillWithNameableKeys(_m: Map<string, string>, _existing: Map<string, string>): void {}
}

interface AttributePrereq extends BasePrereq<AttributePrereqSchema>, ModelPropsFromSchema<AttributePrereqSchema> {}

type AttributePrereqSchema = BasePrereqSchema & {
	has: BooleanSelectField<boolean, boolean, true, false, true>
	which: fields.StringField<string, string, true, false, true>
	combined_with: fields.StringField<string, string, true, false, true>
	value: NumericCriteriaField<true, false, true>
}
export { AttributePrereq }
