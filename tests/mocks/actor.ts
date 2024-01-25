import { ActorSourceGURPS } from "@actor/data/index.ts"
import { MockCollection } from "./collection.ts"
import { MockItem } from "./item.ts"
import { TokenDocumentGURPS } from "@module/token/document.ts"
import { ItemGURPS } from "@item/base/document.ts"
import { ActorGURPS } from "@actor/base.ts"
import { ActiveEffectGURPS } from "@module/effect/document.ts"
import { ActorSystemSource } from "@actor/index.ts"
import { ItemSourceGURPS } from "@item/data/index.ts"

export class MockActor {
	_source: ActorSourceGURPS

	readonly parent: TokenDocumentGURPS<Scene | null> | null = null

	readonly items: MockCollection<ItemGURPS<ActorGURPS>> = new MockCollection()

	readonly effects: MockCollection<ActiveEffectGURPS<ActorGURPS>> = new MockCollection()

	prototypeToken = {}

	_itemGuid = 1

	constructor(
		data: ActorSourceGURPS,
		public options: DocumentConstructionContext<null> = {},
	) {
		this._source = fu.duplicate(data)
		this._source.items ??= []
		this.prepareData()
	}

	get id(): string | null {
		return this._source._id
	}

	get name(): string {
		return this._source.name
	}

	get system(): ActorSystemSource {
		return this._source.system
	}

	prepareData(): void {
		const sourceIds = this._source.items.map(source => source._id)
		for (const item of this.items) {
			if (!sourceIds.includes(item.id)) {
				this.items.delete(item.id)
			}
		}

		for (const source of this._source.items) {
			const item = this.items.get(source._id ?? "")
			if (item) {
				;(item as { _source: object })._source = fu.duplicate(source)
			} else {
				this.items.set(
					source._id ?? "",
					new MockItem(source, { parent: this as unknown as ActorGURPS }) as unknown as ItemGURPS<ActorGURPS>,
				)
			}
		}
	}

	update(changes: Record<string, unknown>): void {
		delete changes.items
		for (const [k, v] of Object.entries(changes)) {
			fu.setProperty(this._source, k, v)
		}
		this.prepareData()
	}

	static async updateDocuments(
		updates: Record<string, unknown>[] = [],
		_context: DocumentModificationContext<TokenDocumentGURPS<Scene | null>> = {},
	): Promise<ActorGURPS[]> {
		return updates.flatMap(update => {
			const actor = game.actors.find(a => a.id === update._id)
			if (!actor) throw Error("PANIC!")

			const itemUpdates = (update.items ?? []) as DeepPartial<ItemSourceGURPS>[]
			delete update.items
			fu.mergeObject(actor._source, update)
			for (const partial of itemUpdates) {
				partial._id ??= "item1"
				const source = actor._source.items.find(
					(maybeSource: ItemSourceGURPS) => maybeSource._id === partial._id,
				)
				if (source) {
					fu.mergeObject(source, partial)
				} else {
					actor.createEmbeddedDocuments("Item", [partial], {})
				}
			}
			actor.prepareData()
			return actor
		})
	}

	async updateEmbeddedDocuments(type: string, data: { _id: string }[]): Promise<void> {
		for (const changes of data) {
			if (type === "Item") {
				const source = this._source.items.find(i => i._id === changes._id)
				if (source) fu.mergeObject(source, changes)
			}
		}
		this.prepareData()
	}

	async createEmbeddedDocuments(
		type: string,
		data: ItemSourceGURPS[],
		_context: DocumentModificationContext<ActorGURPS>,
	): Promise<void> {
		if (type === "Item") {
			for (const source of data) {
				source._id = `item${this._itemGuid}`
				this._itemGuid += 1
				this._source.items.push(source)
			}
		}
		this.prepareData()
	}

	async deleteEmbeddedDocuments(type: string, ids: string[]): Promise<void> {
		if (type === "Item") {
			this._source.items = this._source.items.filter(i => !ids.includes(i._id ?? ""))
		}
		this.prepareData()
	}

	toObject(): ActorSourceGURPS {
		return fu.duplicate(this._source)
	}
}
