// import { ActorGURPS } from "@actor"
// import { ItemGURPS } from "@item"
// import { ItemSourceGURPS, ItemSystemSource } from "@item/data/index.ts"
//
// export class MockItem {
// 	readonly _source: ItemSourceGURPS
//
// 	readonly parent: ActorGURPS | null
//
// 	constructor(
// 		data: ItemSourceGURPS,
// 		public options: DocumentConstructionContext<ActorGURPS | null> = {},
// 	) {
// 		this._source = fu.duplicate(data)
// 		this.parent = options.parent ?? null
// 	}
//
// 	get id(): string | null {
// 		return this._source._id
// 	}
//
// 	get name(): string {
// 		return this._source.name
// 	}
//
// 	get system(): ItemSystemSource {
// 		return this.system
// 	}
//
// 	// get level(): number | null {
// 	// 	return this.system.level?.value ?? null
// 	// }
//
// 	// get traits(): Set<string> {
// 	//     return new Set(this.system.traits?.value ?? []);
// 	// }
//
// 	// get isMagical(): boolean {
// 	//     return ["magical", "arcane", "primal", "divine", "occult"].some((trait) => this.traits.has(trait));
// 	// }
//
// 	// get isAlchemical(): boolean {
// 	//     return this.traits.has("alchemical");
// 	// }
//
// 	static async updateDocuments(
// 		updates: Record<string, unknown>[] = [],
// 		_operation: Partial<DatabaseUpdateOperation<ActorGURPS | null>> = {},
// 	): Promise<ItemGURPS<ActorGURPS | null>[]> {
// 		return updates.flatMap(update => {
// 			const item = game.items.find(item => item.id === update._id)
// 			if (item) fu.mergeObject(item._source, update, { performDeletions: true })
// 			return item ?? []
// 		})
// 	}
//
// 	update(changes: object): void {
// 		fu.mergeObject(this._source, changes, { performDeletions: true })
// 	}
//
// 	toObject(): ItemSourceGURPS {
// 		return fu.duplicate(this._source)
// 	}
// }
