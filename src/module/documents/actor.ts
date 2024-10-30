import { ActorDataInstances, ActorDataTemplates, ActorTemplateType } from "@module/data/actor/types.ts"
import { ActorType, SYSTEM_NAME } from "@module/data/constants.ts"
import { Evaluator } from "@module/util/index.ts"
import { ItemCollectionsMap } from "@system/item-collections.ts"
import { ActiveEffectGURPS } from "./active-effect.ts"
import { ItemGURPS2 } from "./item.ts"
import { type TokenDocumentGURPS } from "./token.ts"
import { ActorDataModel } from "@module/data/actor/abstract.ts"
import { ActorSystemFlags } from "./actor-system-flags.ts"

class ActorGURPS2<TParent extends TokenDocumentGURPS | null = TokenDocumentGURPS | null> extends Actor<TParent> {
	declare items: foundry.abstract.EmbeddedCollection<ItemGURPS2<this>>
	declare effects: foundry.abstract.EmbeddedCollection<ActiveEffectGURPS<this>>

	/**
	 * Get the data model that represents system flags.
	 */
	get _systemFlagsDataModel(): ConstructorOf<ActorSystemFlags> | null {
		return this.system?.metadata?.systemFlagsModel ?? null
	}

	/* -------------------------------------------- */

	override prepareData() {
		super.prepareData()
		if (SYSTEM_NAME in this.flags && this._systemFlagsDataModel) {
			this.flags[SYSTEM_NAME] = new this._systemFlagsDataModel(this._source.flags[SYSTEM_NAME], {
				parent: this,
			}) as unknown as Record<string, unknown>
		}
	}

	/**
	 * Update this Document using incremental data, saving it to the database.
	 * @see {@link Document.updateDocuments}
	 * @param [data={}]    Differential update data which modifies the existing values of this document data
	 * @param [operation={}] Additional context which customizes the update workflow
	 * @returns The updated Document instance
	 */
	override update(
		data: Record<string, unknown>,
		operation?: Partial<DatabaseUpdateOperation<TParent>>,
	): Promise<this | undefined> {
		return super.update(data, operation)
	}

	/* -------------------------------------------- */
	/*  Socket Event Handlers                       */
	/* -------------------------------------------- */

	/**
	 * Perform preliminary operations before a Document of this type is created.
	 * Pre-creation operations only occur for the client which requested the operation.
	 * @param data    The initial data object provided to the document creation request.
	 * @param options Additional options which modify the creation request.
	 * @param user   The User requesting the document creation.
	 * @returns      A return value of false indicates the creation operation should be cancelled.
	 */
	protected override async _preCreate(
		data: this["_source"],
		options: DatabaseCreateOperation<TParent>,
		user: User,
	): Promise<boolean | void> {
		let allowed = await super._preCreate(data, options, user)
		if (foundry.utils.isNewerVersion(game.version, 12)) return allowed
		if (allowed !== false) allowed = await this.system._preCreate?.(data, options, user)
		return allowed
	}

	/* -------------------------------------------- */

	/**
	 * Perform preliminary operations before a Document of this type is updated.
	 * Pre-update operations only occur for the client which requested the operation.
	 * @param changed The differential data that is changed relative to the documents prior values
	 * @param options Additional options which modify the update request
	 * @param user    The User requesting the document update
	 * @returns       A return value of false indicates the update operation should be cancelled.
	 */
	protected override async _preUpdate(
		changed: Partial<this["_source"]>,
		options: DatabaseUpdateOperation<TParent>,
		user: foundry.documents.BaseUser,
	): Promise<boolean | void> {
		let allowed = await super._preUpdate(changed, options, user)
		if (foundry.utils.isNewerVersion(game.version, 12)) return allowed
		if (allowed !== false) allowed = await this.system._preUpdate?.(changed, options, user)
		return allowed
	}

	/* -------------------------------------------- */

	/**
	 * Perform preliminary operations before a Document of this type is deleted.
	 * Pre-delete operations only occur for the client which requested the operation.
	 * @param options Additional options which modify the deletion request
	 * @param user    The User requesting the document deletion
	 * @returns       A return value of false indicates the deletion operation should be cancelled.
	 */
	protected override async _preDelete(
		options: DatabaseDeleteOperation<TParent>,
		user: foundry.documents.BaseUser,
	): Promise<boolean | void> {
		let allowed = await super._preDelete(options, user)
		if (foundry.utils.isNewerVersion(game.version, 12)) return allowed
		if (allowed !== false) allowed = await this.system._preDelete?.(options, user)
		return allowed
	}

	/* -------------------------------------------- */

	/**
	 * Perform follow-up operations after a Document of this type is created.
	 * Post-creation operations occur for all clients after the creation is broadcast.
	 * @param data    The initial data object provided to the document creation request
	 * @param options Additional options which modify the creation request
	 * @param userId  The id of the User requesting the document update
	 */
	protected override _onCreate(
		data: this["_source"],
		options: DatabaseCreateOperation<TParent>,
		userId: string,
	): void {
		super._onCreate(data, options, userId)
		if (foundry.utils.isNewerVersion(game.version, 12)) return
		this.system._onCreate?.(data, options, userId)
	}

	/* -------------------------------------------- */

	/**
	 * Perform follow-up operations after a Document of this type is updated.
	 * Post-update operations occur for all clients after the update is broadcast.
	 * @param changed The differential data that was changed relative to the documents prior values
	 * @param options Additional options which modify the update request
	 * @param userId  The id of the User requesting the document update
	 */
	protected override _onUpdate(
		changed: Partial<this["_source"]>,
		options: DatabaseUpdateOperation<TParent>,
		userId: string,
	): void {
		super._onUpdate(changed, options, userId)
		if (foundry.utils.isNewerVersion(game.version, 12)) return
		this.system._onUpdate?.(changed, options, userId)
	}

	/* -------------------------------------------- */

	/**
	 * Perform follow-up operations after a Document of this type is deleted.
	 * Post-deletion operations occur for all clients after the deletion is broadcast.
	 * @param {object} options            Additional options which modify the deletion request
	 * @param {string} userId             The id of the User requesting the document update
	 * @see {Document#_onDelete}
	 * @protected
	 */
	override _onDelete(options: DatabaseDeleteOperation<TParent>, userId: string): void {
		super._onDelete(options, userId)
		if (foundry.utils.isNewerVersion(game.version, 12)) return
		this.system._onDelete?.(options, userId)
	}

	/* -------------------------------------------- */

	override async setFlag(scope: string, key: string, value: unknown): Promise<this> {
		if (scope === SYSTEM_NAME && this._systemFlagsDataModel) {
			let diff
			const changes = foundry.utils.expandObject({ [key]: value })
			if (this.flags[SYSTEM_NAME])
				diff = (this.flags[SYSTEM_NAME] as unknown as ActorSystemFlags).updateSource(changes, { dryRun: true })
			else diff = new this._systemFlagsDataModel(changes, { parent: this }).toObject()
			return this.update({ flags: { [SYSTEM_NAME]: diff } }) as unknown as this
		}
		return super.setFlag(scope, key, value)
	}

	// Map of item collections
	declare itemCollections: ItemCollectionsMap<this>

	/* -------------------------------------------- */

	/**
	 * Type safe way of verifying if an Item is of a particular type.
	 */
	isOfType<T extends ActorType>(...types: T[]): this is { system: ActorDataInstances[T] } {
		return types.some(t => this.type === t)
	}

	/* -------------------------------------------- */

	/**
	 * Type safe way of verifying if an Item contains a template
	 */
	hasTemplate<T extends ActorTemplateType>(template: T): this is { system: ActorDataTemplates[T] } {
		return this.system.constructor._schemaTemplates.some(t => t.name === template)
	}

	/* -------------------------------------------- */

	/**
	 * Resolves an embedded expression
	 */
	embeddedEval(s: string): string {
		const ev = new Evaluator(this.system)
		const exp = s.slice(2, s.length - 2)
		const result = String(ev.evaluate(exp))
		return result
	}

	/* -------------------------------------------- */

	override prepareBaseData(): void {
		// super.prepareBaseData()
		this.itemCollections = new ItemCollectionsMap<this>(this.items)

		this.system.prepareBaseData?.()
		super.prepareBaseData()
	}

	/* -------------------------------------------- */

	override prepareEmbeddedDocuments(): void {
		super.prepareEmbeddedDocuments()

		this.system._prepareEmbeddedDocuments?.()
	}

	/* -------------------------------------------- */
}

interface ActorGURPS2<TParent extends TokenDocumentGURPS | null> extends Actor<TParent> {
	system: ActorDataModel
}

export { ActorGURPS2 }
