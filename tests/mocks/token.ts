import { ActorGURPS } from "@actor/base.ts"

export class MockToken {
	actor: ActorGURPS | null
	readonly parent: Scene | null
	readonly _source: foundry.documents.TokenSource

	constructor(
		data: foundry.documents.TokenSource,
		context: { parent?: Scene | null; actor?: ActorGURPS | null } = {},
	) {
		this._source = fu.duplicate(data)
		this.parent = context.parent ?? null
		this.actor = context.actor ?? null
	}

	get id(): string {
		return this._source._id ?? ""
	}

	get name(): string {
		return this._source.name
	}

	get scene(): this["parent"] {
		return this.parent
	}

	update(
		changes: EmbeddedDocumentUpdateData,
		context: SceneEmbeddedModificationContext<NonNullable<this["parent"]>> = {},
	): void {
		changes._id = this.id
		this.scene?.updateEmbeddedDocuments("Token", [changes], context)
	}
}
