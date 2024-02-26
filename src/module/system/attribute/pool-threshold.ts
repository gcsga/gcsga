import { VariableResolver, evaluateToNumber } from "@util"
import { PoolThresholdDef, ThresholdOp } from "./data.ts"

export class PoolThreshold {
	state = ""

	explanation = ""

	expression = ""

	ops: ThresholdOp[] = []

	constructor(data: Partial<PoolThresholdDef>) {
		Object.assign(this, data)
	}

	threshold(resolver: VariableResolver): number {
		return evaluateToNumber(this.expression, resolver)
	}
}
