import fields = foundry.data.fields
import { BaseFeature, BaseFeatureSchema } from "./base-feature.ts"
import { feature } from "@util"
import { Nameable } from "@module/util/index.ts"

class ConditionalModifierBonus extends BaseFeature<ConditionalModifierBonusSchema> {
	static override TYPE = feature.Type.ConditionalModifierBonus

	static override defineSchema(): ConditionalModifierBonusSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			situation: new fields.StringField({
				required: true,
				nullable: false,
				initial: game.i18n.localize("gurps.feature.conditional_modifier"),
			}),
		}
	}

	override toFormElement(): HTMLElement {
		const prefix = `system.features.${this.index}`
		const element = super.toFormElement()

		const rowElement = document.createElement("div")
		rowElement.classList.add("form-fields", "secondary")

		rowElement.append(
			this.schema.fields.situation.toInput({
				name: `${prefix}.situation`,
				value: this.situation,
				localize: true,
			}) as HTMLElement,
		)

		element.append(rowElement)

		return element
	}

	fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void {
		Nameable.extract(this.situation, m, existing)
	}
}

interface ConditionalModifierBonus
	extends BaseFeature<ConditionalModifierBonusSchema>,
		ModelPropsFromSchema<ConditionalModifierBonusSchema> {}

type ConditionalModifierBonusSchema = BaseFeatureSchema & {
	situation: fields.StringField<string, string, true, false, true>
}

export { ConditionalModifierBonus, type ConditionalModifierBonusSchema }
