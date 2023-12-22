import { VariableResolver, evaluateToNumber, sanitizeId } from "@util"
import { MoveTypeDefObj } from "./data"
import { reserved_ids } from "@module/attribute"
import { MoveTypeOverride } from "./override"

export class MoveTypeDef {
	private def_id!: string

	name: string

	move_type_base: string

	cost_per_point: number

	order?: number

	overrides: MoveTypeOverride[]

	constructor(data: MoveTypeDefObj) {
		this.id = data.id
		this.name = data.name
		this.move_type_base = data.move_type_base ?? ""
		this.cost_per_point = data.cost_per_point ?? 0
		this.overrides = data.overrides.map(e => new MoveTypeOverride(e))
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
