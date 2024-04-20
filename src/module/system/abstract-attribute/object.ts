import { AbstractAttributeDef } from "./definition.ts"
import { AbstractAttributeObj } from "./data.ts"
import { VariableResolver } from "@module/util/index.ts"

abstract class AbstractAttribute<TActor extends VariableResolver = VariableResolver> {
	actor: TActor
	_id: string

	constructor(actor: TActor, data: AbstractAttributeObj) {
		this.actor = actor
		this._id = data.id
	}

	abstract get definition(): AbstractAttributeDef | null

	get id(): string {
		return this._id
	}

	/** Effective value of the attribute, not taking into account modifiers from temporary effects */
	get max(): number {
		const def = this.definition
		if (!def) return 0
		return def.baseValue(this.actor)
	}

	/** Current value of the attribute, applies only to pools */
	get current(): number {
		return this.max
	}

	/** Effective value of the attribute, taking into account modifiers from temporary effects */
	get effective(): number {
		return this.max
	}
}

export { AbstractAttribute }
