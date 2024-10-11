import { ActiveEffectGURPS } from "@module/document/active-effect.ts"
import { EffectType } from "../constants.ts"
import { ActorGURPS2 } from "@module/document/actor.ts"
import { ItemGURPS2 } from "@module/document/item.ts"
import { SystemDataModel } from "../abstract.ts"
import { EffectDataInstances } from "./types.ts"

/**
 * Variant of the SystemDataModel with support for rich active effect tooltips.
 */
class EffectDataModel<TSchema extends EffectDataSchema = EffectDataSchema> extends SystemDataModel<
	ActiveEffectGURPS,
	TSchema
> {
	/**
	 * Type safe way of verifying if an Item is of a particular type.
	 */
	isOfType<T extends EffectType>(...types: T[]): this is EffectDataInstances[T] {
		return types.some(t => this.parent.type === t)
	}

	/* -------------------------------------------- */
	/*  Getters                                     */
	/* -------------------------------------------- */

	get item(): ItemGURPS2 | null {
		const parent = this.parent.parent
		if (parent instanceof Item) return parent
		return null
	}
	/* -------------------------------------------- */

	get actor(): ActorGURPS2 | null {
		const parent = this.parent.parent
		if (parent instanceof Actor) return parent
		return parent.parent
	}
}

interface EffectDataModel<TSchema extends EffectDataSchema>
	extends SystemDataModel<ActiveEffectGURPS, TSchema>,
		ModelPropsFromSchema<EffectDataSchema> {}

type EffectDataSchema = {}

export { EffectDataModel, type EffectDataSchema }
