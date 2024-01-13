import { CharacterResolver, evaluateToNumber } from "@util"
import { PoolThresholdDef, ThresholdOp } from "./data"
import { Mook } from "@module/mook"

export class PoolThreshold {
	state = ""

	explanation = ""

	expression = ""

	ops: ThresholdOp[] = []

	constructor(data: PoolThresholdDef) {
		Object.assign(this, data)
	}

	threshold(resolver: CharacterResolver | Mook): number {
		return evaluateToNumber(this.expression, resolver)
	}
}
