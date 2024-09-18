// import { ActorGURPS } from "@actor"
// import { ItemGURPS } from "@item"
//
// /** Disable Active Effects */
// export class ActiveEffectGURPS<TParent extends ActorGURPS | ItemGURPS | null> extends ActiveEffect<TParent> {
// 	constructor(
// 		data: DeepPartial<foundry.documents.ActiveEffectSource>,
// 		context?: DocumentConstructionContext<TParent>,
// 	) {
// 		data.disabled = true
// 		data.transfer = false
// 		super(data, context)
// 	}
//
// 	static override async createDocuments<T extends foundry.abstract.Document>(this: ConstructorOf<T>): Promise<T[]> {
// 		return []
// 	}
// }
