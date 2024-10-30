import { EffectType } from "@module/data/constants.ts"
import { ActorGURPS2 } from "./actor.ts"
import { ItemGURPS2 } from "./item.ts"
import { EffectDataInstances } from "@module/data/active-effect/types.ts"
import { EffectDataModel } from "@module/data/active-effect/abstract.ts"

class ActiveEffectGURPS<
	TParent extends ActorGURPS2 | ItemGURPS2 = ActorGURPS2 | ItemGURPS2,
> extends ActiveEffect<TParent> {
	/**
	 * Type safe way of verifying if an Item is of a particular type.
	 */
	isOfType<T extends EffectType>(...types: T[]): this is { system: EffectDataInstances[T] } {
		return types.some(t => this.type === t)
	}
}

interface ActiveEffectGURPS<TParent extends ActorGURPS2 | ItemGURPS2 = ActorGURPS2 | ItemGURPS2>
	extends ActiveEffect<TParent> {
	system: EffectDataModel
}

export { ActiveEffectGURPS }
