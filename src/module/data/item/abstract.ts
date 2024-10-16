import { ItemType } from "../constants.ts"
import { type ItemGURPS2 } from "@module/document/item.ts"
import type { ItemDataInstances, ItemDataTemplates, ItemTemplateType } from "./types.ts"
import { type ActorGURPS2 } from "@module/document/actor.ts"
import { type CellData } from "./components/cell-data.ts"
import { type ItemTemplateInst } from "./helpers.ts"
import { ErrorGURPS } from "@util/misc.ts"
import { SystemDataModel, SystemDataModelMetadata } from "../abstract.ts"
import { ItemSystemFlags } from "@module/document/item-system-flags.ts"
import { SheetButton } from "./components/sheet-button.ts"

interface ItemDataModelMetadata extends SystemDataModelMetadata {
	systemFlagsModel: ConstructorOf<ItemSystemFlags> | null
}

/**
 * Variant of the SystemDataModel with support for rich item tooltips.
 */
class ItemDataModel<TSchema extends ItemDataSchema = ItemDataSchema> extends SystemDataModel<ItemGURPS2, TSchema> {
	/**
	 * Maximum depth items can be nested in containers.
	 */
	static MAX_DEPTH = 10

	/**
	 * Type safe way of verifying if an Item is of a particular type.
	 */
	isOfType<T extends ItemType>(...types: T[]): this is ItemDataInstances[T] {
		return types.some(t => this.parent.type === t)
	}

	/**
	 * Type safe way of verifying if an Item contains a template
	 */
	hasTemplate<T extends ItemTemplateType>(template: T): this is ItemDataTemplates[T] {
		return this.constructor._schemaTemplates.some(t => t.name === template)
	}

	/* -------------------------------------------- */
	/*  Getters                                     */
	/* -------------------------------------------- */

	get actor(): ActorGURPS2 | null {
		return this.parent.actor
	}

	/* -------------------------------------------- */

	get cellData(): Record<string, CellData> {
		throw ErrorGURPS(`ItemGURPS#cellData must be implemented.`)
	}

	/* -------------------------------------------- */

	get sheetButtons(): SheetButton[] {
		return []
	}

	/* -------------------------------------------- */

	get contextMenuItmes(): ContextMenuEntry[] {
		return []
	}

	/* -------------------------------------------- */

	get ratedStrength(): number {
		return 0
	}

	/* -------------------------------------------- */

	static override metadata: ItemDataModelMetadata = Object.freeze(
		foundry.utils.mergeObject(super.metadata, { systemFlagsModel: ItemSystemFlags }, { inplace: false }),
	)

	override get metadata(): ItemDataModelMetadata {
		return (this.constructor as typeof ItemDataModel).metadata
	}

	/* -------------------------------------------- */
	/*  Socket Event Handlers                       */
	/* -------------------------------------------- */

	/**
	 * Trigger a render on all sheets for items within which this item is contained.
	 */
	async _renderContainers(
		options: {
			formerContainer?: ItemUUID
		} & RenderOptions = {},
	) {
		// Render this item's container & any containers it is within
		const parentContainers = await this.allContainers()
		parentContainers.forEach(c => c.sheet?.render(false, options))

		// Render the actor sheet, compendium, or sidebar
		if (this.parent.isEmbedded) this.parent.actor!.sheet?.render(false, options)
		else if (this.parent.pack) game.packs.get(this.parent.pack)!.apps.forEach(a => a.render(false, options))
		else ui.sidebar.tabs.items.render(false, options)

		// Render former container if it was moved between containers
		if (options.formerContainer) {
			const former = (await fromUuid(options.formerContainer)) as ItemGURPS2 | null
			former?.render(false, options)
			former?.system._renderContainers({ ...options, formerContainer: undefined })
		}
	}

	/* -------------------------------------------- */

	override _onCreate(
		_data: Partial<this["_source"]>,
		_options: DatabaseCreateOperation<ItemGURPS2["parent"]>,
		_userId: string,
	) {
		this._renderContainers()
	}

	/* -------------------------------------------- */

	override _onUpdate(
		_changed: Partial<this["_source"]>,
		options: ItemDatabaseUpdateOperation<ItemGURPS2["parent"]>,
		_userId: string,
	) {
		this._renderContainers({ formerContainer: options.formerContainer })
	}

	/* -------------------------------------------- */

	override _onDelete(_options: DatabaseDeleteOperation<ItemGURPS2["parent"]>, _userId: string) {
		this._renderContainers()
	}

	/* -------------------------------------------- */
	/*  Helpers                                     */
	/* -------------------------------------------- */

	/**
	 * Prepare type-specific data for the Item sheet.
	 * @param  context  Sheet context data.
	 */
	async getSheetData(_context: Record<string, unknown>): Promise<void> {}

	/**
	 * All of the containers this item is within up to the parent actor or collection.
	 */
	async allContainers(): Promise<ItemTemplateInst<ItemTemplateType.Container>[]> {
		let item = this.parent
		let container
		let depth = 0
		const containers = []
		while ((container = await item.container) && depth < ItemDataModel.MAX_DEPTH) {
			containers.push(container)
			item = container
			depth += 1
		}
		return containers as ItemTemplateInst<ItemTemplateType.Container>[]
	}
}

interface ItemDataModel<TSchema extends ItemDataSchema>
	extends SystemDataModel<ItemGURPS2, TSchema>,
		ModelPropsFromSchema<ItemDataSchema> {}

type ItemDataSchema = {}

type ItemDatabaseUpdateOperation<TDocument extends foundry.abstract.Document | null> =
	DatabaseUpdateOperation<TDocument> &
		RenderOptions & {
			formerContainer?: ItemUUID
		}

export { ItemDataModel, type ItemDataSchema, type ItemDatabaseUpdateOperation }
