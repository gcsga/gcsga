import { AttributeGURPS } from "../../stat/attribute/attribute.ts"
import fields = foundry.data.fields
import { MappingField, MappingFieldOptions } from "../../fields/mapping-field.ts"
import { Stat } from "@module/data/stat/types.ts"
import { AbstractStat } from "@module/data/stat/abstract-stat/abstract-stat.ts"
import { ResourceTracker } from "@module/data/stat/index.ts"

type StatsFieldOptions<
	TModel extends Stat,
	TSourceProp extends object,
	TRequired extends boolean = true,
	TNullable extends boolean = false,
	THasInitial extends boolean = true,
> = MappingFieldOptions<TSourceProp, TRequired, TNullable, THasInitial> & {
	model: TModel["constructor"]
}

// class Attributes extends foundry.abstract.DataModel<ActorDataModel, AttributesSchema> {
class StatsField<
	TModel extends Stat,
	TRequired extends boolean = true,
	TNullable extends boolean = false,
	THasInitial extends boolean = true,
> extends MappingField<StatField<TModel>, object, StatCollection<TModel>, TRequired, TNullable, THasInitial> {
	constructor(options: StatsFieldOptions<TModel, StatField<TModel>, TRequired, TNullable, THasInitial>) {
		super(new StatField(options.model), options)
	}

	override initialize(
		value: unknown,
		model: ConstructorOf<TModel>,
		options: fields.ObjectFieldOptions<StatCollection<TModel>, TRequired, TNullable, THasInitial> = {},
	): StatCollection<TModel> {
		super.initialize(value, model)
		const attributes = Object.values(super.initialize(value, model, options) as unknown as Record<string, TModel>)
		return new StatCollection(model, attributes)
	}
}

class StatField<TModel extends Stat> extends fields.ObjectField<TModel> {
	static override recursive = true

	#model: TModel["constructor"]

	constructor(type: TModel["constructor"]) {
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
		return new this.#model(value as object, { parent: model, ...options }) as TModel
	}

	/* -------------------------------------------- */

	migrateSource(_sourceData: object, fieldData: any) {
		this.#model.migrateDataSafe(fieldData)
	}
}

class StatCollection<TModel extends Stat> extends Collection<TModel> {
	#model: ConstructorOf<TModel>

	/* -------------------------------------------- */

	constructor(model: ConstructorOf<TModel>, entries: TModel[]) {
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

	get primary(): Map<string, TModel> {
		return new Map(this.filter(att => att instanceof AttributeGURPS && att.isPrimary).map(e => [e.id, e]))
	}

	/* -------------------------------------------- */

	get secondary(): Map<string, TModel> {
		return new Map(this.filter(att => att instanceof AttributeGURPS && att.isSecondary).map(e => [e.id, e]))
	}

	/* -------------------------------------------- */

	get pool(): Map<string, TModel> {
		return new Map(
			this.filter(att => att instanceof ResourceTracker || (att instanceof AttributeGURPS && att.isPool)).map(
				e => [e.id, e],
			),
		)
	}

	/* -------------------------------------------- */

	toObject(source = true) {
		return this.map(doc => doc.toObject(source))
	}
}

export { StatsField }
