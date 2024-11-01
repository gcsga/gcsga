import { gid } from "@data"
import { feature } from "@util/enum/feature.ts"
import { stlimit } from "@util/enum/stlimit.ts"
import { getAttributeChoices } from "../attribute/helpers.ts"
import { BaseFeature, BaseFeatureSchema } from "./base-feature.ts"
import fields = foundry.data.fields
import { createDummyElement } from "@module/applications/helpers.ts"

class AttributeBonus extends BaseFeature<AttributeBonusSchema> {
	static override TYPE = feature.Type.AttributeBonus

	static override defineSchema(): AttributeBonusSchema {
		const fields = foundry.data.fields

		const attributeChoices = getAttributeChoices(
			null,
			gid.Strength,
			"GURPS.Item.Features.FIELDS.Attribute.Attribute",
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

		return {
			...super.defineSchema(),
			attribute: new fields.StringField({
				required: true,
				nullable: false,
				choices: attributeChoices.choices,
				initial: gid.Strength,
			}),
			limitation: new fields.StringField({
				required: true,
				nullable: false,
				blank: false,
				choices: stlimit.OptionsChoices,
				initial: stlimit.Option.None,
			}),
		}
	}

	get actualLimitation(): stlimit.Option {
		if (this.attribute === gid.Strength) return this.limitation ?? stlimit.Option.None
		return stlimit.Option.None
	}

	override toFormElement(enabled: boolean): HTMLElement {
		const prefix = `system.features.${this.index}`
		const element = super.toFormElement(enabled)

		if (!enabled) {
			element.append(createDummyElement(`${prefix}.attribute`, this.attribute))
			element.append(createDummyElement(`${prefix}.limitation`, this.limitation))
		}

		const attributeChoices = Object.entries(
			getAttributeChoices(this.parent.actor, this.attribute, "GURPS.Item.Features.FIELDS.Attribute.Attribute", {
				blank: false,
				ten: false,
				size: true,
				dodge: true,
				parry: true,
				block: true,
				skill: false,
			}).choices,
		).map(([value, label]) => {
			return { value, label }
		})

		const rowElement = document.createElement("div")
		rowElement.classList.add("form-fields", "secondary")

		rowElement.append(
			foundry.applications.fields.createSelectInput({
				name: enabled ? `${prefix}.attribute` : "",
				value: this.attribute,
				localize: true,
				options: attributeChoices,
				disabled: !enabled,
			}),
		)

		rowElement.append(
			this.schema.fields.limitation.toInput({
				name: enabled ? `${prefix}.limitation` : "",
				value: this.attribute === gid.Strength ? this.limitation : stlimit.Option.None,
				disabled: !enabled || this.attribute !== gid.Strength,
				localize: true,
			}) as HTMLElement,
		)

		element.append(rowElement)

		return element
	}

	fillWithNameableKeys(_m: Map<string, string>, _existing: Map<string, string>): void {}
}

interface AttributeBonus extends BaseFeature<AttributeBonusSchema>, ModelPropsFromSchema<AttributeBonusSchema> {}

type AttributeBonusSchema = BaseFeatureSchema & {
	attribute: fields.StringField<string, string, true, false, true>
	limitation: fields.StringField<stlimit.Option, stlimit.Option, true, false, true>
}

export { AttributeBonus }
