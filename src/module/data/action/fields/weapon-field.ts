import { ErrorGURPS, TooltipGURPS } from "@util"
import { type ItemGURPS2 } from "@module/documents/item.ts"
import { BaseAttack } from "../base-attack.ts"

class WeaponField<
	TParent extends BaseAttack = BaseAttack,
	TSchema extends WeaponFieldSchema = WeaponFieldSchema,
> extends foundry.abstract.DataModel<TParent, TSchema> {
	get item(): ItemGURPS2 {
		return this.parent.item
	}

	static fromString(_s: string): WeaponField {
		throw ErrorGURPS("Function #WeaponField.fromString must be implemented.")
	}

	override toString(..._args: unknown[]): string {
		throw ErrorGURPS("Function WeaponField#toString must be implemented.")
	}

	tooltip(_w: TParent): string {
		throw ErrorGURPS("Function WeaponField#tooltip must be implemented.")
	}

	resolve(_w: TParent, _tooltip: TooltipGURPS | null, ..._args: unknown[]): WeaponField {
		throw ErrorGURPS("Function WeaponField#resolve must be implemented.")
	}
}

interface WeaponField<TParent extends BaseAttack, TSchema extends WeaponFieldSchema>
	extends foundry.abstract.DataModel<TParent, TSchema>,
		ModelPropsFromSchema<WeaponFieldSchema> {}

type WeaponFieldSchema = {}
export { WeaponField, type WeaponFieldSchema }
