import { UserSource } from "types/foundry/common/documents/module.js"

export class MockUser {
	readonly _source: UserSource

	constructor(data: UserSource) {
		this._source = fu.duplicate(data)
	}

	get name(): string {
		return this._source.name
	}

	async update(changes: Record<string, unknown>): Promise<this> {
		for (const [k, v] of Object.entries(changes)) {
			fu.setProperty(this._source, k, v)
		}
		return this
	}
}
