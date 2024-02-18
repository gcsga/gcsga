import { CharacterResolver, evaluateToNumber } from "@util"
import { PoolThresholdDef, ThresholdOp } from "./data.ts"
import { CharacterGURPS } from "@actor"

export class PoolThreshold {
	state = ""

	explanation = ""

	expression = ""

	ops: ThresholdOp[] = []

	constructor(data: Partial<PoolThresholdDef>) {
		Object.assign(this, data)
	}

	threshold(resolver: CharacterGURPS | CharacterResolver): number {
		return evaluateToNumber(this.expression, resolver)
	}
}
