import { AttributeGURPS } from "../../stat/attribute/attribute.ts"
import fields = foundry.data.fields
import { MappingField, MappingFieldOptions } from "../../fields/mapping-field.ts"
import { StatClass } from "@module/data/stat/types.ts"
import { AbstractStat } from "@module/data/stat/abstract-stat/abstract-stat.ts"

type StatsFieldOptions<
	TModel extends StatClass,
	TSourceProp extends object,
	TRequired extends boolean = true,
	TNullable extends boolean = false,
	THasInitial extends boolean = true,
> = MappingFieldOptions<TSourceProp, TRequired, TNullable, THasInitial> & {
	model: TModel
}

// class Attributes extends foundry.abstract.DataModel<ActorDataModel, AttributesSchema> {
class StatsField<
	TModel extends StatClass,
	TRequired extends boolean = true,
	TNullable extends boolean = false,
	THasInitial extends boolean = true,
> extends MappingField<StatField<TModel>, object, StatCollection<TModel>, TRequired, TNullable, THasInitial> {
	constructor(options: StatsFieldOptions<TModel, StatField<TModel>, TRequired, TNullable, THasInitial>) {
		super(new StatField(options.model), options)
	}

	override initialize(
		value: unknown,
		model: TModel,
		options: fields.ObjectFieldOptions<StatCollection<TModel>, TRequired, TNullable, THasInitial> = {},
	): StatCollection<TModel> {
		super.initialize(value, model)
		const attributes = Object.values(
			super.initialize(value, model, options) as unknown as Record<string, InstanceType<TModel>>,
		)
		return new StatCollection(model, attributes)
	}
}

class StatField<TModel extends StatClass> extends fields.ObjectField<TModel> {
	static override recursive = true

	#model: TModel

	constructor(type: TModel) {
		super()
		this.#model = type
	}

	/* -------------------------------------------- */

	override _cleanType(value: unknown, options: fields.CleanFieldOptions) {
		if (!(typeof value === "object")) value = {}

		return this.#model.cleanData(value as object, { ...options })
	}

	/* -------------------------------------------- */

	override initialize(
		value: unknown,
		model: any,
		options?: fields.ObjectFieldOptions<TModel, true, false, true> | undefined,
	): TModel {
		super.initialize(value)
		return new this.#model(value as object, { parent: model, ...options }) as unknown as TModel
	}

	/* -------------------------------------------- */

	migrateSource(_sourceData: object, fieldData: any) {
		this.#model.migrateDataSafe(fieldData)
	}
}

class StatCollection<TModel extends StatClass> extends Collection<InstanceType<TModel>> {
	#model: ConstructorOf<foundry.abstract.DataModel>

	/* -------------------------------------------- */

	constructor(model: TModel, entries: InstanceType<TModel>[]) {
		super()
		this.#model = model
		for (const entry of entries) {
			if (!(entry instanceof AbstractStat)) continue
			this.set(entry.id, entry)
		}
	}

	/* -------------------------------------------- */

	get model(): ConstructorOf<foundry.abstract.DataModel> {
		return this.#model
	}

	/* -------------------------------------------- */

	get primary(): Map<string, InstanceType<TModel>> {
		return new Map(
			this.entries().filter(([, att]) => {
				att instanceof AttributeGURPS && att.isPrimary
			}),
		)
	}

	/* -------------------------------------------- */

	get secondary(): Map<string, InstanceType<TModel>> {
		return new Map(
			this.entries().filter(([, att]) => {
				att instanceof AttributeGURPS && att.isSecondary
			}),
		)
	}

	/* -------------------------------------------- */

	get pool(): Map<string, InstanceType<TModel>> {
		return new Map(
			this.entries().filter(([, att]) => {
				att instanceof AttributeGURPS && att.isPool
			}),
		)
	}

	/* -------------------------------------------- */

	toObject(source = true) {
		return this.map(doc => doc.toObject(source))
	}
}

export { StatsField }

// class AttributeField extends fields.ObjectField<AttributeGURPS> {
// 	static override recursive = true
//
// 	/* -------------------------------------------- */
//
// 	override _cleanType(value: unknown, options: fields.CleanFieldOptions) {
// 		if (!(typeof value === "object")) value = {}
//
// return AttributeGURPS.cleanData(value as object, { ...options })
// 	}
//
// 	/* -------------------------------------------- */
//
//
// 	override initialize(
// 		value: unknown,
// 		model: any,
// 		options?: fields.ObjectFieldOptions<AttributeGURPS, true, false, true> | undefined,
// 	): AttributeGURPS {
// 		super.initialize(value)
// 		 return new AttributeGURPS(value as object, { parent: model, ...options })
// 		return foundry.utils.deepClone(value) as AttributeGURPS
// 	}
//
// 	/* -------------------------------------------- */
//
// 	migrateSource(_sourceData: object, fieldData: any) {
// 		const cls = this.getModel(fieldData)
// 		if (cls) cls.migrateDataSafe(fieldData)
// 	}
// }

// private declare _map: Map<string, AttributeGURPS>
// private declare _set: Record<string, AttributeGURPS>

// static override defineSchema(): AttributesSchema {
// 	const fields = foundry.data.fields
// 	return {
// 		list: new fields.ArrayField(new fields.EmbeddedDataField(AttributeGURPS), {
// 			required: true,
// 			nullable: false,
// 			initial: [],
// 		}),
// 	}
// }

// 	// get map(): Map<string, AttributeGURPS> {
// 	// 	return (this._map ??= new Map(this.list.map(e => [e.id, e])))
// 	// }
//
// 	get set(): Record<string, AttributeGURPS> {
// 		return Object.fromEntries(this.list.map(e => [e.id, e]))
// 	}
//
// 	get primary(): Record<string, AttributeGURPS> {
// 		return Object.fromEntries(this.list.filter(e => e.isPrimary).map(e => [e.id, e]))
// 	}
//
// 	get secondary(): Record<string, AttributeGURPS> {
// 		return Object.fromEntries(this.list.filter(e => e.isSecondary).map(e => [e.id, e]))
// 	}
//
// 	get pool(): Record<string, AttributeGURPS> {
// 		return Object.fromEntries(this.list.filter(e => e.isPool).map(e => [e.id, e]))
// 	}
// }

// interface Attributes extends ModelPropsFromSchema<AttributesSchema> {}
//
// type AttributesSchema = {
// 	list: fields.ArrayField<
// 		fields.EmbeddedDataField<AttributeGURPS>,
// 		SourceFromSchema<AttributeSchema>[],
// 		AttributeGURPS[],
// 		true,
// 		false,
// 		true
// 	>
// }
//
// export { Attributes, type AttributesSchema }
