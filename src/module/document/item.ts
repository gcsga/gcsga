import { ItemDataModel } from "@module/data/item/abstract.ts"
import { ItemType, SYSTEM_NAME } from "@module/data/constants.ts"
import { ItemDataInstances, ItemDataTemplates, ItemTemplateType } from "@module/data/item/types.ts"
import { ItemTemplateInst } from "@module/data/item/helpers.ts"
import { LocalizeGURPS } from "@util"
import { ActorGURPS2 } from "./actor.ts"
import { Nameable } from "@module/util/index.ts"

class ItemGURPS2<TParent extends ActorGURPS2 | null = ActorGURPS2 | null> extends Item<TParent> {
	/**
	 * Get the data model that represents system flags.
	 */
	get _systemFlagsDataModel(): typeof foundry.abstract.DataModel | null {
		return this.system?.metadata?.systemFlagsModel ?? null
	}

	/* -------------------------------------------- */
	/*  Getters                                     */
	/* -------------------------------------------- */
	get nameableReplacements(): Map<string, string> {
		if (Nameable.isAccesser(this.system)) return this.system.nameableReplacements
		return new Map()
	}

	/* -------------------------------------------- */

	override prepareData(): void {
		super.prepareData()
		if (SYSTEM_NAME in this.flags && this._systemFlagsDataModel) {
			this.flags[SYSTEM_NAME] = new this._systemFlagsDataModel(this._source.flags[SYSTEM_NAME], {
				parent: this,
			})
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
			if (this.flags[SYSTEM_NAME]) diff = this.flags[SYSTEM_NAME].updateSource(changes, { dryRun: true })
			else diff = new this._systemFlagsDataModel(changes, { parent: this }).toObject()
			return this.update({ flags: { [SYSTEM_NAME]: diff } })
		}
		return super.setFlag(scope, key, value)
	}

	/* -------------------------------------------- */
	/*  Helper Functions                            */
	/* -------------------------------------------- */

	/**
	 * Type safe way of verifying if an Item is of a particular type.
	 */
	isOfType<T extends ItemType>(...types: T[]): this is { system: ItemDataInstances[T] } {
		return types.some(t => this.type === t)
	}

	/**
	 * Type safe way of verifying if an Item contains a template
	 */
	hasTemplate<T extends ItemTemplateType>(template: T): this is { system: ItemDataTemplates[T] } {
		return this.system.constructor._schemaTemplates.some(t => t.name === template)
	}

	/* -------------------------------------------- */
	/*  Item Properties                             */
	/* -------------------------------------------- */
	/**
	 * The item that contains this item, if it is in a container. Returns a promise if the item is located
	 * in a compendium pack.
	 */
	get container(): ItemGURPS2 | Promise<ItemGURPS2> | null {
		if (!Object.hasOwn(this.system, "container")) return null
		if (this.isEmbedded) return this.actor!.items.get((this.system as any).container) ?? null
		if (this.pack) {
			return (
				((game.packs.get(this.pack) as CompendiumCollection<ItemGURPS2<null>>).getDocument(
					(this.system as any).container,
				) as Promise<ItemGURPS2<null>>) ?? null
			)
		}
		return game.items.get((this.system as any).container) ?? null
	}

	/**
	 * Prepare creation data for the provided items and any items contained within them. The data created by this method
	 * can be passed to `createDocuments` with `keepId` always set to true to maintain links to container contents.
	 * @param {ItemGURPS2[]} items                     Items to create.
	 * @param {object} [context={}]                Context for the item's creation.
	 * @param {ItemGURPS2} [context.container]         Container in which to create the item.
	 * @param {boolean} [context.keepId=false]     Should IDs be maintained?
	 * @param {Function} [context.transformAll]    Method called on provided items and their contents.
	 * @param {Function} [context.transformFirst]  Method called only on provided items.
	 * @returns {Promise<object[]>}                Data for items to be created.
	 */
	static async createWithContents(
		items: ItemGURPS2[] | Collection<ItemGURPS2>,
		options: Partial<CreateWithContentsOptions> = {},
	): Promise<ItemGURPS2["_source"][]> {
		options.keepId ??= false
		let depth = 0
		if (options.container) {
			depth = 1 + (await options.container.system.allContainers()).length
			if (depth > ItemDataModel.MAX_DEPTH) {
				ui.notifications.warn(
					LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Messages.ContainerMaxDepth, {
						depth: ItemDataModel.MAX_DEPTH,
					}),
				)
				return []
			}
		}

		const createItemData = async (item: ItemGURPS2, containerId: string, depth: number): Promise<void> => {
			let newItemData: ItemGURPS2 | ItemGURPS2["_source"] = options.transformAll
				? await options.transformAll(item)
				: item
			if (options.transformFirst && depth === 0) newItemData = await options.transformFirst(newItemData)
			if (!newItemData) return
			if (newItemData instanceof Item) newItemData = newItemData.toObject()
			fu.mergeObject(newItemData, { "system.container": containerId })
			if (!options.keepId) newItemData._id = fu.randomID()

			created.push(newItemData)

			const contents = await (item as ItemTemplateInst<ItemTemplateType.Container>).system.contents
			if (contents && depth < ItemDataModel.MAX_DEPTH) {
				for (const doc of contents) await createItemData(doc, newItemData._id!, depth + 1)
			}
		}

		const created: ItemGURPS2["_source"][] = []
		for (const item of items) await createItemData(item, options.container!.id, depth)
		return created
	}
}

type CreateWithContentsOptions = {
	container: ItemTemplateInst<ItemTemplateType.Container> | null
	keepId: boolean
	transformAll?: (item: ItemGURPS2 | ItemGURPS2["_source"]) => ItemGURPS2["_source"] | Promise<ItemGURPS2["_source"]>
	transformFirst?: (
		item: ItemGURPS2 | ItemGURPS2["_source"],
	) => ItemGURPS2["_source"] | Promise<ItemGURPS2["_source"]>
}

interface ItemGURPS2<TParent extends ActorGURPS2 | null> extends Item<TParent> {
	system: ItemDataModel
}

export { ItemGURPS2 }
