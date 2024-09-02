import { SystemDataModel, ActorDataModel } from "@module/data/abstract.ts"
import { ActorType, SYSTEM_NAME } from "@module/data/constants.ts"
import { ItemGURPS2 } from "./item.ts"
import { ActorDataInstances } from "@module/data/actor/types.ts"
import { Evaluator } from "@module/util/index.ts"

class ActorGURPS2<TParent extends TokenDocument | null = TokenDocument | null> extends Actor<TParent> {
	/**
	 * Type safe way of verifying if an Item is of a particular type.
	 */
	isOfType<T extends ActorType>(...types: T[]): this is { system: ActorDataInstances[T] } {
		return types.some(t => this.type === t)
	}

	// Resolves an embedded expression
	embeddedEval(s: string): string {
		const ev = new Evaluator({ resolver: this })
		const exp = s.slice(2, s.length - 2)
		const result = ev.evaluate(exp)
		return result
	}

	override prepareData() {
		super.prepareData()
		if (SYSTEM_NAME in this.flags && this._systemFlagsDataModel) {
			// @ts-expect-error probably fine
			this.flags[SYSTEM_NAME] = new this._systemFlagsDataModel(this._source.flags[SYSTEM_NAME], {
				parent: this,
			})
		}
	}

	/* -------------------------------------------- */

	override async setFlag(scope: string, key: string, value: unknown): Promise<this> {
		if (scope === SYSTEM_NAME && this._systemFlagsDataModel) {
			let diff
			const changes = foundry.utils.expandObject({ [key]: value })
			// @ts-expect-error probably fine
			if (this.flags[SYSTEM_NAME]) diff = this.flags[SYSTEM_NAME].updateSource(changes, { dryRun: true })
			else diff = new this._systemFlagsDataModel(changes, { parent: this }).toObject()
			// @ts-expect-error probably fine
			return this.update({ flags: { [SYSTEM_NAME]: diff } })
		}
		return super.setFlag(scope, key, value)
	}

	/** @inheritDoc */
	get _systemFlagsDataModel(): typeof SystemDataModel | null {
		return this.system?.metadata?.systemFlagsModel ?? null
	}

	/* -------------------------------------------- */
	/*  Socket Event Handlers                       */
	/* -------------------------------------------- */

	/**
	 * Perform preliminary operations before a Document of this type is created.
	 * Pre-creation operations only occur for the client which requested the operation.
	 */

	protected override async _preCreate(
		data: this["_source"],
		options: DatabaseCreateOperation<TParent>,
		user: User,
	): Promise<boolean | void> {
		let allowed = await super._preCreate(data, options, user)
		if (foundry.utils.isNewerVersion(game.version, 12)) return allowed
		// @ts-expect-error function exists
		if (allowed !== false) allowed = await this.system._preCreate?.(data, options, user)
		return allowed
	}

	/* -------------------------------------------- */

	/**
	 * Perform preliminary operations before a Document of this type is updated.
	 * Pre-update operations only occur for the client which requested the operation.
	 */
	protected override async _preUpdate(
		changed: DeepPartial<this["_source"]>,
		options: DatabaseUpdateOperation<TParent>,
		user: foundry.documents.BaseUser,
	): Promise<boolean | void> {
		let allowed = await super._preUpdate(changed, options, user)
		if (foundry.utils.isNewerVersion(game.version, 12)) return allowed
		// @ts-expect-error function exists
		if (allowed !== false) allowed = await this.system._preUpdate?.(changed, options, user)
		return allowed
	}

	/* -------------------------------------------- */

	/**
	 * Perform preliminary operations before a Document of this type is deleted.
	 * Pre-delete operations only occur for the client which requested the operation.
	 */
	protected override async _preDelete(
		options: DatabaseDeleteOperation<TParent>,
		user: foundry.documents.BaseUser,
	): Promise<boolean | void> {
		let allowed = await super._preDelete(options, user)
		if (foundry.utils.isNewerVersion(game.version, 12)) return allowed
		// @ts-expect-error function exists
		if (allowed !== false) allowed = await this.system._preDelete?.(options, user)
		return allowed
	}

	/* -------------------------------------------- */

	/**
	 * Perform follow-up operations after a Document of this type is created.
	 * Post-creation operations occur for all clients after the creation is broadcast.
	 */
	protected override _onCreate(
		data: this["_source"],
		operation: DatabaseCreateOperation<TParent>,
		userId: string,
	): void {
		super._onCreate(data, operation, userId)
		if (foundry.utils.isNewerVersion(game.version, 12)) return
		// @ts-expect-error function exists
		this.system._onCreate?.(data, operation, userId)
	}

	/* -------------------------------------------- */

	/**
	 * Perform follow-up operations after a Document of this type is updated.
	 * Post-update operations occur for all clients after the update is broadcast.
	 */
	protected override _onUpdate(
		data: DeepPartial<this["_source"]>,
		operation: DatabaseUpdateOperation<TParent>,
		userId: string,
	): void {
		super._onUpdate(data, operation, userId)
		if (foundry.utils.isNewerVersion(game.version, 12)) return
		// @ts-expect-error function exists
		this.system._onUpdate?.(data, operation, userId)
	}

	/* -------------------------------------------- */

	/**
	 * Perform follow-up operations after a Document of this type is deleted.
	 * Post-deletion operations occur for all clients after the deletion is broadcast.
	 */
	protected override _onDelete(operation: DatabaseDeleteOperation<TParent>, userId: string): void {
		super._onDelete(operation, userId)
		if (foundry.utils.isNewerVersion(game.version, 12)) return
		// @ts-expect-error function exists
		this.system._onDelete?.(operation, userId)
	}
}

interface ActorGURPS2<TParent extends TokenDocument | null> extends Actor<TParent> {
	constructor: typeof ActorGURPS2
	system: ActorDataModel
	readonly items: foundry.abstract.EmbeddedCollection<ItemGURPS2<this>>
}

export { ActorGURPS2 }