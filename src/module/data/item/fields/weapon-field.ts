import { ErrorGURPS, TooltipGURPS } from "@util"
import { AbstractWeaponTemplate } from "../templates/abstract-weapon.ts"
import { type ItemGURPS2 } from "@module/document/item.ts"

class WeaponField<
	TParent extends AbstractWeaponTemplate = AbstractWeaponTemplate,
	TSchema extends WeaponFieldSchema = WeaponFieldSchema,
> extends foundry.abstract.DataModel<TParent, TSchema> {
	get item(): ItemGURPS2 {
		return this.parent.parent
	}

	// @ts-expect-error abstract function
	static fromString(s: string): WeaponField {
		throw ErrorGURPS("Function #WeaponField.fromString must be implemented.")
	}

	// @ts-expect-error abstract function
	override toString(...args: unknown[]): string {
		throw ErrorGURPS("Function WeaponField.toString must be implemented.")
	}

	// @ts-expect-error abstract function
	tooltip(w: TParent): string {
		throw ErrorGURPS("Function WeaponField.tooltip must be implemented.")
	}

	// @ts-expect-error abstract function
	resolveValue(w: TParent, tooltip: TooltipGURPS, ...args: unknown[]): WeaponField {
		throw ErrorGURPS("Function WeaponField.resolveValue must be implemented.")
	}

	clean(): void {
		throw ErrorGURPS("Function WeaponField.clean must be implemented.")
	}
}

interface WeaponField<TParent extends AbstractWeaponTemplate, TSchema extends WeaponFieldSchema>
	extends foundry.abstract.DataModel<TParent, TSchema>,
		ModelPropsFromSchema<WeaponFieldSchema> {}

type WeaponFieldSchema = {}

export { WeaponField, type WeaponFieldSchema }
