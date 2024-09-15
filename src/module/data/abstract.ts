import { ActorType, ItemType, SYSTEM_NAME } from "./constants.ts"

import fields = foundry.data.fields
import { ItemGURPS2 } from "@module/document/item.ts"
import { ItemDataInstances, ItemDataTemplates, ItemTemplateType } from "./item/types.ts"
import { type ActorGURPS2 } from "@module/document/actor.ts"
import { ActorDataInstances, ActorDataTemplates, ActorTemplateType } from "./actor/types.ts"
import { ErrorGURPS } from "@util"
import { CellData } from "./item/fields/cell-data.ts"
import { ItemTemplateInst } from "./item/helpers.ts"

interface SystemDataModelMetadata {
	systemFlagsModel: typeof foundry.abstract.DataModel | null
}

interface ItemDataModelMetadata extends SystemDataModelMetadata {
	singleton: boolean
}

// Type to get the instance type of a class constructor
type InstanceTypeOf<T> = T extends new (...args: any[]) => infer R ? R : never

// Type to combine instance types of all classes in the array
type CombinedInstanceType<T extends any[]> = T extends [infer U, ...infer Rest]
	? U extends new (...args: any[]) => any
		? InstanceTypeOf<U> & CombinedInstanceType<Rest>
		: never
	: {}

// Type to combine static types of all classes in the array
type CombinedStaticType<T extends any[]> = T extends [infer U, ...infer Rest] ? U & CombinedStaticType<Rest> : {}

// Type to represent the combined class with both static and instance members
type CombinedClass<T extends any[]> = CombinedStaticType<T> & (new (...args: any[]) => CombinedInstanceType<T>)

// class SystemDataModel extends foundry.abstract.TypeDataModel<foundry.abstract.Document, fields.DataSchema> {
class SystemDataModel<
	TDocument extends foundry.abstract.Document = foundry.abstract.Document,
	TSchema extends fields.DataSchema = fields.DataSchema,
> extends foundry.abstract.TypeDataModel<TDocument, TSchema> {
	/** @inheritdoc */
	static _enableV10Validation = true

	/**
	 * System type that this system data model represents (e.g. "character", "npc", "vehicle").
	 */
	static _systemType: string

	/* -------------------------------------------- */

	/**
	 * Base templates used for construction.
	 * @private
	 */
	static _schemaTemplates: (typeof SystemDataModel)[] = []

	/* -------------------------------------------- */

	/**
	 * The field names of the base templates used for construction.
	 * @private
	 */
	static get _schemaTemplateFields(): Set<String> {
		const fieldNames = Object.freeze(new Set(this._schemaTemplates.map(t => t.schema.keys()).flat()))
		Object.defineProperty(this, "_schemaTemplateFields", {
			value: fieldNames,
			writable: false,
			configurable: false,
		})
		return fieldNames
	}

	/* -------------------------------------------- */

	/**
	 * A list of properties that should not be mixed-in to the final type.
	 * @private
	 */
	static _immiscible: Set<string> = new Set([
		"length",
		"mixed",
		"name",
		"prototype",
		"cleanData",
		"_cleanData",
		"_initializationOrder",
		"validateJoint",
		"_validateJoint",
		"migrateData",
		"_migrateData",
		"shimData",
		"_shimData",
		"defineSchema",
	])

	/* -------------------------------------------- */

	/**
	 * Metadata that describes this DataModel.
	 */
	static metadata: SystemDataModelMetadata = Object.freeze({
		systemFlagsModel: null,
	})

	get metadata(): SystemDataModelMetadata {
		return this.constructor.metadata
	}

	/* -------------------------------------------- */

	static override defineSchema(): fields.DataSchema {
		const schema = {}
		for (const template of this._schemaTemplates) {
			if (!template.defineSchema) {
				throw new Error(
					`Invalid ${SYSTEM_NAME} template mixin ${template} defined on class ${this.constructor}`,
				)
			}
			this.mergeSchema(schema, template.defineSchema())
		}
		return schema
	}

	/* -------------------------------------------- */

	/**
	 * Merge two schema definitions together as well as possible.
	 * @param {DataSchema} a  First schema that forms the basis for the merge. *Will be mutated.*
	 * @param {DataSchema} b  Second schema that will be merged in, overwriting any non-mergeable properties.
	 * @returns {DataSchema}  Fully merged schema.
	 */
	static mergeSchema<A extends fields.DataSchema, B extends fields.DataSchema>(a: A, b: B): A & B {
		Object.assign(a, b)
		return a as A & B
	}

	/* -------------------------------------------- */
	/*  Data Cleaning                               */
	/* -------------------------------------------- */

	static override cleanData(source: object, options?: Record<string, unknown>): SourceFromSchema<fields.DataSchema> {
		this._cleanData(source, options)
		return super.cleanData(source, options)
	}

	/* -------------------------------------------- */

	/**
	 * Performs cleaning without calling DataModel.cleanData.
	 * @param {object} [source]         The source data
	 * @param {object} [options={}]     Additional options (see DataModel.cleanData)
	 */
	static _cleanData(source: object, options?: Record<string, unknown>) {
		for (const template of this._schemaTemplates) {
			template._cleanData(source, options)
		}
	}

	/* -------------------------------------------- */
	/*  Data Initialization                         */
	/* -------------------------------------------- */

	/** @inheritdoc */
	static override *_initializationOrder(): Generator<[string, fields.DataField], void> {
		for (const template of this._schemaTemplates) {
			for (const entry of template._initializationOrder()) {
				entry[1] = this.schema.get(entry[0])!
				yield entry
			}
		}
		for (const entry of this.schema.entries()) {
			if (this._schemaTemplateFields.has(entry[0])) continue
			yield entry
		}
	}

	/* -------------------------------------------- */
	/*  Socket Event Handlers                       */
	/* -------------------------------------------- */

	/**
	 * Pre-creation logic for this system data.
	 * @param _data               The initial data object provided to the document creation request.
	 * @param _options            Additional options which modify the creation request.
	 * @param _user               The User requesting the document creation.
	 * @returns {Promise<boolean|void>}   A return value of false indicates the creation operation should be cancelled.
	 */
	override async _preCreate(
		_data: this["_source"],
		_options: DatabaseCreateOperation<TDocument["parent"]>,
		_user: User,
	): Promise<boolean | void> {}

	/**
	 * Pre-update logic for this system data.
	 * @param _data               The initial data object provided to the document creation request.
	 * @param _options            Additional options which modify the creation request.
	 * @param _user               The User requesting the document creation.
	 * @returns {Promise<boolean|void>}   A return value of false indicates the creation operation should be cancelled.
	 */
	async _preUpdate(
		_data: this["_source"],
		_options: DatabaseUpdateOperation<TDocument["parent"]>,
		_user: foundry.documents.BaseUser,
	): Promise<boolean | void> {}

	/**
	 * Pre-delete logic for this system data.
	 * @param _options            Additional options which modify the creation request.
	 * @param _user               The User requesting the document creation.
	 * @returns {Promise<boolean|void>}   A return value of false indicates the creation operation should be cancelled.
	 */
	async _preDelete(
		_options: DatabaseDeleteOperation<TDocument["parent"]>,
		_user: foundry.documents.BaseUser,
	): Promise<boolean | void> {}

	_onCreate(
		_data: Partial<this["_source"]>,
		_options: DatabaseCreateOperation<TDocument["parent"]>,
		_userId: string,
	) {}

	/* -------------------------------------------- */

	_onUpdate(
		_changed: Partial<this["_source"]>,
		_options: DatabaseUpdateOperation<TDocument["parent"]>,
		_userId: string,
	) {}

	/* -------------------------------------------- */

	_onDelete(_options: DatabaseDeleteOperation<TDocument["parent"]>, _userId: string) {}

	/* -------------------------------------------- */
	/*  Data Validation                             */
	/* -------------------------------------------- */

	/** @inheritdoc */
	override validate(options = {}) {
		if (this.constructor._enableV10Validation === false) return true
		return super.validate(options)
	}

	/* -------------------------------------------- */
	/*  Data Validation                             */
	/* -------------------------------------------- */

	/** @inheritdoc */
	static override validateJoint(data: SourceFromSchema<fields.DataSchema>) {
		this._validateJoint(data)
		return super.validateJoint(data)
	}

	/* -------------------------------------------- */

	/**
	 * Performs joint validation without calling DataModel.validateJoint.
	 * @param {object} data     The source data
	 * @throws                  An error if a validation failure is detected
	 * @protected
	 */
	static _validateJoint(data: SourceFromSchema<fields.DataSchema>) {
		for (const template of this._schemaTemplates) {
			template._validateJoint(data)
		}
	}

	/* -------------------------------------------- */
	/*  Data Migration                              */
	/* -------------------------------------------- */

	/** @inheritdoc */
	static override migrateData(source: SourceFromSchema<fields.DataSchema>) {
		this._migrateData(source)
		return super.migrateData(source)
	}

	/* -------------------------------------------- */

	/**
	 * Performs migration without calling DataModel.migrateData.
	 */
	static _migrateData(source: SourceFromSchema<fields.DataSchema>) {
		for (const template of this._schemaTemplates) {
			template._migrateData(source)
		}
	}

	/* -------------------------------------------- */

	static override shimData(data: object, options?: { embedded?: boolean }): object {
		this._shimData(data, options)
		return super.shimData(data, options)
	}

	/* -------------------------------------------- */

	/**
	 * Performs shimming without calling DataModel.shimData.
	 * @param {object} data         The source data
	 * @param {object} [options]    Additional options (see DataModel.shimData)
	 * @protected
	 */
	static _shimData(data: object, options?: { embedded?: boolean }): void {
		for (const template of this._schemaTemplates) {
			template._shimData(data, options)
		}
	}

	/* -------------------------------------------- */
	/*  Mixins                                      */
	/* -------------------------------------------- */

	/**
	 * Mix multiple templates with the base type.
	 */
	static mixin<T extends (typeof SystemDataModel<any, any>)[]>(...templates: T): CombinedClass<T> {
		for (const template of templates) {
			if (!(template.prototype instanceof SystemDataModel)) {
				throw new Error(`${template.name} is not a subclass of SystemDataModel`)
			}
		}

		const Base = class extends this {}
		Object.defineProperty(Base, "_schemaTemplates", {
			value: Object.seal([...this._schemaTemplates, ...templates]),
			writable: false,
			configurable: false,
		})

		for (const template of templates) {
			// Take all static methods and fields from template and mix in to base class
			for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(template))) {
				if (this._immiscible.has(key)) continue
				Object.defineProperty(Base, key, descriptor)
			}

			// Take all instance methods and fields from template and mix in to base class
			for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(template.prototype))) {
				if (["constructor"].includes(key)) continue
				Object.defineProperty(Base.prototype, key, descriptor)
			}
		}

		return Base as unknown as CombinedClass<T>
	}
}

interface SystemDataModel<TDocument extends foundry.abstract.Document, TSchema extends fields.DataSchema>
	extends foundry.abstract.TypeDataModel<TDocument, TSchema> {
	constructor: typeof SystemDataModel<TDocument, TSchema>
}

/* -------------------------------------------- */

/**
 * Variant of the SystemDataModel with some extra actor-specific handling.
 */
// class ActorDataModel<
// 	TDocument extends ActorGURPS2 = ActorGURPS2,
// 	TSchema extends ActorDataSchema = ActorDataSchema,
// > extends SystemDataModel<TDocument, TSchema> {
class ActorDataModel<
	// TDocument extends ActorGURPS2 = ActorGURPS2,
	TSchema extends ActorDataSchema = ActorDataSchema,
> extends SystemDataModel<ActorGURPS2, TSchema> {
	/**
	 * Type safe way of verifying if an Actor is of a particular type.
	 */
	isOfType<T extends ActorType>(...types: T[]): this is ActorDataInstances[T] {
		return types.some(t => this.parent.type === t)
	}

	/**
	 * Type safe way of verifying if an Actor contains a template
	 */
	hasTemplate<T extends ActorTemplateType>(template: T): this is ActorDataTemplates[T] {
		return this.constructor._schemaTemplates.some(t => t.name === template)
	}

	resolveVariable(_variableName: string): string {
		throw ErrorGURPS(`ActorDataModel.resolveVariable must be implemented.`)
	}

	static override defineSchema(): ActorDataSchema {
		return {}
	}
}

// interface ActorDataModel<TDocument extends ActorGURPS2, TSchema extends ActorDataSchema>
// 	extends SystemDataModel<TDocument, TSchema>,
// 		ModelPropsFromSchema<ActorDataSchema> {}
interface ActorDataModel<TSchema extends ActorDataSchema>
	extends SystemDataModel<ActorGURPS2, TSchema>,
		ModelPropsFromSchema<ActorDataSchema> {}

type ActorDataSchema = {}

/* -------------------------------------------- */

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
		throw ErrorGURPS(`ItemGURPS.cellData must be implemented.`)
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

	static override defineSchema(): ItemDataSchema {
		// const fields = foundry.data.fields
		return {
			// container: new fields.ForeignDocumentField(foundry.documents.BaseItem, {
			// 	required: true,
			// 	nullable: true,
			// 	idOnly: true,
			// 	initial: null,
			// }),
		}
	}

	/* -------------------------------------------- */

	static override metadata: ItemDataModelMetadata = Object.freeze(
		foundry.utils.mergeObject(
			super.metadata,
			{
				singleton: false,
			},
			{ inplace: false },
		),
	)

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
	/*  Helper Methods                              */
	/* -------------------------------------------- */

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
			depth++
		}
		return containers as ItemTemplateInst<ItemTemplateType.Container>[]
	}
}

interface ItemDataModel<TSchema extends ItemDataSchema>
	extends SystemDataModel<ItemGURPS2, TSchema>,
		ModelPropsFromSchema<ItemDataSchema> {}

type ItemDataSchema = {
	// container: fields.ForeignDocumentField<string>
}

export { ItemDataModel, ActorDataModel, SystemDataModel, type ItemDataSchema }

type ItemDatabaseUpdateOperation<TDocument extends foundry.abstract.Document | null> =
	DatabaseUpdateOperation<TDocument> &
		RenderOptions & {
			formerContainer?: ItemUUID
		}
