import { EffectType } from "@module/data/constants.ts"
import { ActorGURPS2 } from "./actor.ts"
import { ItemGURPS2 } from "./item.ts"
import { EffectDataInstances } from "@module/data/active-effect/types.ts"
import { EffectDataModel } from "@module/data/active-effect/abstract.ts"
import { ItemTemplateType, ItemDataTemplates } from "@module/data/item/types.ts"

class ActiveEffectGURPS<
	TParent extends ActorGURPS2 | ItemGURPS2 = ActorGURPS2 | ItemGURPS2,
> extends ActiveEffect<TParent> {
	/**
	 * Type safe way of verifying if an Item is of a particular type.
	 */
	isOfType<T extends EffectType>(...types: T[]): this is { system: EffectDataInstances[T] } {
		return types.some(t => this.type === t)
	}

	/**
	 * Type safe way of verifying if an Item contains a template
	 */
	hasTemplate<T extends ItemTemplateType>(template: T): this is { system: ItemDataTemplates[T] } {
		if (this.system.constructor !== EffectDataModel) {
			const prototype = this.system.constructor.prototype.constructor
			return [prototype, ...prototype._schemaTemplates].some(t => t.name === template)
		}
		return this.system.constructor._schemaTemplates.some(t => t.name === template)
	}
}

interface ActiveEffectGURPS<TParent extends ActorGURPS2 | ItemGURPS2 = ActorGURPS2 | ItemGURPS2>
	extends ActiveEffect<TParent> {
	system: EffectDataModel
}

export { ActiveEffectGURPS }
