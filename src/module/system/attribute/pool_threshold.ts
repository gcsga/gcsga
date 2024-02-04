import { CharacterResolver, evaluateToNumber } from "@util"
import { PoolThresholdDef, ThresholdOp } from "./data.ts"

export class PoolThreshold {
	state = ""

	explanation = ""

	expression = ""

	ops: ThresholdOp[] = []

	constructor(data: PoolThresholdDef) {
		Object.assign(this, data)
	}

	threshold(resolver: CharacterResolver): number {
		return evaluateToNumber(this.expression, resolver)
	}
}
