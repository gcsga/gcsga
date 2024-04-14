import { RESERVED_IDS } from "@system"
import { getNewAttributeId, sanitizeId } from "@util"
import { AbstractAttributeDefObj, AbstractAttributeObj } from "./data.ts"
import { VariableResolver } from "@module/util/resolvers.ts"

abstract class AbstractAttributeDef {
	private _id: string
	base: string

	constructor(data: AbstractAttributeDefObj) {
		this._id = data.id
		this.base = data.base
	}

	get id(): string {
		return this._id
	}

	set id(value: string) {
		this._id = sanitizeId(value, false, RESERVED_IDS)
	}

	abstract baseValue(resolver: VariableResolver): number

	generateNewAttribute(): AbstractAttributeObj {
		return {
			id: this.id,
		}
	}

	static newObject(reservedIds: string[]): AbstractAttributeDefObj {
		return {
			id: getNewAttributeId(
				reservedIds.map(e => {
					return { id: e }
				}),
			),
			base: "10",
		}
	}
}

export { AbstractAttributeDef }
