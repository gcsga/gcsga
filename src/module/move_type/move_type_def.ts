import { VariableResolver, evaluateToNumber, sanitizeId } from "@util"
import { MoveTypeDefObj } from "./data"
import { reserved_ids } from "@module/attribute"

export class MoveTypeDef {
	private def_id!: string

	name!: string

	move_type_base!: string

	cost_per_point?: number

	order?: number

	constructor(data?: MoveTypeDefObj) {
		Object.assign(this, data)
	}

	get id(): string {
		return this.def_id
	}

	set id(v: string) {
		this.def_id = sanitizeId(v, false, reserved_ids)
	}

	baseValue(resolver: VariableResolver): number {
		return evaluateToNumber(this.move_type_base, resolver)
	}
}
