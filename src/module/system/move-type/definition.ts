import { MoveTypeResolver, evaluateToNumber } from "@util"
import { MoveTypeDefObj, MoveTypeObj } from "./data.ts"
import { MoveTypeOverride } from "./override.ts"
import { AbstractAttributeDef } from "@system"

export class MoveTypeDef extends AbstractAttributeDef {
	name: string
	cost_per_point = 0
	overrides: MoveTypeOverride[]
	order: number

	constructor(data: MoveTypeDefObj) {
		super(data)
		this.name = data.name
		this.cost_per_point = data.cost_per_point ?? 0
		this.order = data.order ?? 0
		this.overrides = data.overrides?.map(threshold => new MoveTypeOverride(threshold))
	}

	baseValue(resolver: MoveTypeResolver): number {
		return evaluateToNumber(this.base, resolver)
	}

	override generateNewAttribute(): MoveTypeObj {
		return {
			...super.generateNewAttribute(),
			adj: 0,
		}
	}

	static override newObject(reservedIds: string[]): MoveTypeDefObj {
		return {
			...super.newObject(reservedIds),
			name: "",
			overrides: [],
		}
	}
}
