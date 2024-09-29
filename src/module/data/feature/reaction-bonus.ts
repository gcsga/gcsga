import fields = foundry.data.fields
import { BaseFeature, BaseFeatureSchema } from "./base-feature.ts"
import { feature } from "@util"
import { Nameable } from "@module/util/index.ts"

class ReactionBonus extends BaseFeature<ReactionBonusSchema> {
	static override TYPE = feature.Type.ReactionBonus

	static override defineSchema(): ReactionBonusSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			situation: new fields.StringField({
				required: true,
				nullable: false,
				initial: game.i18n.localize("gurps.feature.reaction_bonus"),
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

interface ReactionBonus extends BaseFeature<ReactionBonusSchema>, ModelPropsFromSchema<ReactionBonusSchema> {}

type ReactionBonusSchema = BaseFeatureSchema & {
	situation: fields.StringField<string, string, true, false, true>
}

export { ReactionBonus, type ReactionBonusSchema }
