import { VariableResolver, evaluateToNumber } from "@util"
import { PoolThresholdObj, ThresholdOp } from "./data.ts"

const fields = foundry.data.fields

export type PoolThresholdSchema = {
	state: foundry.data.fields.StringField
	explanation?: foundry.data.fields.StringField
	expression: foundry.data.fields.StringField
	ops: foundry.data.fields.ArrayField<foundry.data.fields.StringField<ThresholdOp>>
}

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

	static defineSchema(): PoolThresholdSchema {
		return {
			state: new fields.StringField(),
			explanation: new fields.StringField({ required: false }),
			expression: new fields.StringField(),
			ops: new fields.ArrayField(new fields.StringField<ThresholdOp>()),
		}
	}

	threshold(resolver: VariableResolver): number {
		return evaluateToNumber(this.expression, resolver)
	}

	static newObject(): PoolThresholdObj {
		return {
			state: "",
			explanation: "",
			expression: "",
			ops: [],
		}
	}
}
