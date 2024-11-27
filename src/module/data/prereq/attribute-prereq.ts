import { BasePrereq, BasePrereqSchema, PrereqConstructionOptions } from "./base-prereq.ts"
import fields = foundry.data.fields
import { prereq } from "@util/enum/prereq.ts"
import { ActorType, gid } from "@data"
import { NumericComparison, TooltipGURPS } from "@util"
import { ActorInst } from "../actor/helpers.ts"
import { NumericCriteriaField } from "../item/fields/numeric-criteria-field.ts"
import { getAttributeChoices } from "../stat/attribute/helpers.ts"
import { createDummyElement } from "@module/applications/helpers.ts"

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
			total: new NumericCriteriaField({
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

		let satisfied = this.total.matches(value)
		if (!this.has) satisfied = !satisfied

		if (!satisfied && tooltip !== null) {
			tooltip.push(game.i18n.localize("GURPS.Tooltip.Prefix"))
			if (this.combined_with !== "") {
				tooltip.push(
					game.i18n.format("GURPS.Prereq.Attribute.CombinedWith", {
						has: this.hasText,
						att1: this.which,
						att2: this.combined_with,
						qualifier: this.total.toString(),
					}),
				)
			} else {
				tooltip.push(
					game.i18n.format("GURPS.Prereq.Attribute.NotCombinedWith", {
						has: this.hasText,
						att1: this.which,
						qualifier: this.total.toString(),
					}),
				)
			}
		}
		return satisfied
	}

	override toFormElement(enabled: boolean): HTMLElement {
		const prefix = `system.prereqs.${this.index}`

		// Root element
		const element = super.toFormElement(enabled)

		if (!enabled) {
			element.append(createDummyElement(`${prefix}.which`, this.which))
			element.append(createDummyElement(`${prefix}.combined_with`, this.combined_with))
			element.append(createDummyElement(`${prefix}.total.compare`, this.total.compare))
			element.append(createDummyElement(`${prefix}.total.qualifier`, this.total.qualifier))
		}

		const rowElement = document.createElement("div")
		rowElement.classList.add("form-fields", "secondary")

		// Which
		rowElement.append(
			this.schema.fields.which.toInput({
				name: enabled ? `${prefix}.which` : "",
				value: this.which,
				disabled: !enabled,
			}) as HTMLElement,
		)

		// Combined With
		rowElement.append(
			this.schema.fields.combined_with.toInput({
				name: enabled ? `${prefix}.combined_with` : "",
				value: this.combined_with,
				disabled: !enabled,
			}) as HTMLElement,
		)

		// Compare
		rowElement.append(
			this.schema.fields.total.fields.compare.toInput({
				name: enabled ? `${prefix}.total.compare` : "",
				value: this.total.compare,
				disabled: !enabled,
			}) as HTMLElement,
		)

		// Qualifier
		rowElement.append(
			this.schema.fields.total.fields.qualifier.toInput({
				name: enabled ? `${prefix}.total.qualifier` : "",
				value: this.total.qualifier.toString(),
				disabled: !enabled,
			}) as HTMLElement,
		)

		element.append(rowElement)

		return element
	}

	fillWithNameableKeys(_m: Map<string, string>, _existing: Map<string, string>): void {}
}

interface AttributePrereq extends BasePrereq<AttributePrereqSchema>, ModelPropsFromSchema<AttributePrereqSchema> {}

type AttributePrereqSchema = BasePrereqSchema & {
	which: fields.StringField<string, string, true, false, true>
	combined_with: fields.StringField<string, string, true, false, true>
	total: NumericCriteriaField<true, false, true>
}

export { AttributePrereq, type AttributePrereqSchema }
