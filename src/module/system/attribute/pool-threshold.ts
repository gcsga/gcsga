import { VariableResolver, evaluateToNumber } from "@util"
import { PoolThresholdObj, ThresholdOp } from "./data.ts"

export class PoolThreshold {
	// Name
	state = ""
	// Long description
	explanation = ""
	// Value to check current value of the pool against
	expression = ""
	ops: ThresholdOp[] = []

	constructor(data: PoolThresholdObj) {
		this.state = data.state
		this.explanation = data.explanation ?? ""
		this.expression = data.expression ?? ""
		this.ops = data.ops ?? []
	}

	threshold(resolver: VariableResolver): number {
		return evaluateToNumber(this.expression, resolver)
	}
}
