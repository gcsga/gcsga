import { isObject } from "@util/misc.ts"
import fields = foundry.data.fields
import { Action, ActionClass, ActionInstances } from "../action/types.ts"
import { MappingField, MappingFieldOptions } from "./mapping-field.ts"
import { ActionType } from "../constants.ts"
import { BaseAction } from "../action/base-action.ts"

class ActionsField<
	TRequired extends boolean = true,
	TNullable extends boolean = false,
	THasInitial extends boolean = true,
> extends MappingField<ActionField, object, ActionCollection, TRequired, TNullable, THasInitial> {
	constructor(options: MappingFieldOptions<ActionField, TRequired, TNullable, THasInitial> = {}) {
		super(new ActionField(), options)
	}

	/* -------------------------------------------- */

	override initialize(
		value: unknown,
		model: ConstructorOf<foundry.abstract.DataModel>,
		options: fields.ObjectFieldOptions<ActionField, TRequired, TNullable, THasInitial> = {},
	): ActionCollection {
		super.initialize(value, model)
		const actions = Object.values(super.initialize(value, model, options) as unknown as Record<string, Action>)
		actions.sort((a, b) => a.sort - b.sort)
		return new ActionCollection(model, actions)
	}
}

class ActionField extends fields.ObjectField<Action> {
	static override recursive = true

	/* -------------------------------------------- */

	override _cleanType(value: unknown, options: fields.CleanFieldOptions) {
		if (!(typeof value === "object")) value = {}

		const cls = this.getModel(value)
		if (cls) return cls.cleanData(value as object, { ...options })
		return value
	}

	/* -------------------------------------------- */

	getModel(value: unknown): ActionClass | null {
		if (
			isObject(value) &&
			Object.hasOwn(value, "type") &&
			Object.keys(ActionInstances).includes((value as any).type)
		) {
			return ActionInstances[(value as any).type as ActionType] as ActionClass
		}
		return null
	}

	/* -------------------------------------------- */

	override initialize(
		value: unknown,
		model: any,
		options?: fields.ObjectFieldOptions<Action, true, false, true> | undefined,
	): Action {
		super.initialize(value)
		const cls = this.getModel(value)
		if (cls) return new cls(value as object, { parent: model, ...options })
		return foundry.utils.deepClone(value) as Action
	}

	/* -------------------------------------------- */

	migrateSource(_sourceData: object, fieldData: any) {
		const cls = this.getModel(fieldData)
		if (cls) cls.migrateDataSafe(fieldData)
	}
}

class ActionCollection extends Collection<Action> {
	#model: ConstructorOf<foundry.abstract.DataModel>
	/* -------------------------------------------- */

	#types: Map<string, Set<string>> = new Map()

	constructor(model: ConstructorOf<foundry.abstract.DataModel>, entries: Action[]) {
		super()
		this.#model = model
		for (const entry of entries) {
			if (!(entry instanceof BaseAction)) continue
			this.set(entry._id, entry)
		}
	}

	/* -------------------------------------------- */

	override set(key: string, value: Action) {
		if (!this.#types.has(value.type)) this.#types.set(value.type, new Set())
		this.#types.get(value.type)?.add(key)
		return super.set(key, value)
	}

	/* -------------------------------------------- */

	override delete(key: string) {
		this.#types.get(this.get(key)?.type ?? "")?.delete(key)
		return super.delete(key)
	}

	/* -------------------------------------------- */

	toObject(source = true) {
		return this.map(doc => doc.toObject(source))
	}
}

export { ActionsField, ActionField, ActionCollection }
