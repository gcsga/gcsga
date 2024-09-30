import fields = foundry.data.fields
import { gid } from "@data"
import { BaseFeature, BaseFeatureSchema } from "./base-feature.ts"
import { feature } from "@util"

enum MoveBonusType {
	Base = "base",
	Enhanced = "enhanced",
}

const MoveBonusTypeChoices = Object.freeze({
	[MoveBonusType.Base]: "GURPS.Item.Features.FIELDS.MoveBonus.Base",
	[MoveBonusType.Enhanced]: "GURPS.Item.Features.FIELDS.MoveBonus.Enhanced",
})

class MoveBonus extends BaseFeature<MoveBonusSchema> {
	static override TYPE = feature.Type.MoveBonus

	static override defineSchema(): MoveBonusSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			move_type: new fields.StringField({ initial: gid.Ground }),
			limitation: new fields.StringField({
				required: true,
				nullable: false,
				blank: false,
				choices: MoveBonusTypeChoices,
				initial: MoveBonusType.Base,
			}),
		}
	}

	override toFormElement(): HTMLElement {
		const prefix = `system.features.${this.index}`
		const element = super.toFormElement()

		const rowElement = document.createElement("div")
		rowElement.classList.add("form-fields", "secondary")

		rowElement.append(
			foundry.applications.fields.createSelectInput({
				name: `${prefix}.attribute`,
				value: this.move_type,
				localize: true,
				options: [
					{ value: gid.Ground, label: "GROUND" },
					{ value: gid.Water, label: "WATER" },
					{ value: gid.Air, label: "AIR" },
					{ value: gid.Space, label: "SPACE" },
				],
			}),
		)

		rowElement.append(
			this.schema.fields.limitation.toInput({
				name: `${prefix}.limitation`,
				value: this.limitation,
				localize: true,
			}) as HTMLElement,
		)

		element.append(rowElement)

		return element
	}

	fillWithNameableKeys(_m: Map<string, string>, _existing: Map<string, string>): void {}
}

interface MoveBonus extends BaseFeature<MoveBonusSchema>, ModelPropsFromSchema<MoveBonusSchema> {}

type MoveBonusSchema = BaseFeatureSchema & {
	move_type: fields.StringField<string, string, true, false, true>
	limitation: fields.StringField<MoveBonusType, MoveBonusType, true, false, true>
}

export { MoveBonus, MoveBonusType, type MoveBonusSchema }
