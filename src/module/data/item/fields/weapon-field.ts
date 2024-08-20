import { ErrorGURPS, TooltipGURPS } from "@util"
import { AbstractWeaponTemplate } from "../templates/abstract-weapon.ts"

class WeaponField<
	TParent extends AbstractWeaponTemplate = AbstractWeaponTemplate,
	TSchema extends WeaponFieldSchema = WeaponFieldSchema,
> extends foundry.abstract.DataModel<TParent, TSchema> {
	static fromString<T extends WeaponField>(_s: string): T {
		throw ErrorGURPS("Function #WeaponField.fromString must be implemented.")
	}

	override toString(): string {
		throw ErrorGURPS("Function WeaponField.toString must be implemented.")
	}

	resolveValue<T extends this>(_w: TParent, _tooltip: TooltipGURPS): T {
		throw ErrorGURPS("Function WeaponField.resolveValue must be implemented.")
	}
}

interface WeaponField<TParent extends AbstractWeaponTemplate, TSchema extends WeaponFieldSchema>
	extends foundry.abstract.DataModel<TParent, TSchema>,
		ModelPropsFromSchema<WeaponFieldSchema> {}

type WeaponFieldSchema = {}

export { WeaponField, type WeaponFieldSchema }
