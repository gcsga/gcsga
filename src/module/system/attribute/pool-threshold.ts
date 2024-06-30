import { VariableResolver, evaluateToNumber } from "@module/util/index.ts"
import { PoolThresholdSchema, ThresholdOp } from "./data.ts"


export class PoolThreshold {
	// Name
	state = ""
	// Long description
	explanation = ""
	// Value to check current value of the pool against
	expression = ""
	ops: ThresholdOp[] = []

	constructor(data: SourceFromSchema<PoolThresholdSchema>) {
		this.state = data.state
		this.explanation = data.explanation ?? ""
		this.expression = data.expression ?? ""
		this.ops = data.ops ?? []
	}

	static defineSchema(): PoolThresholdSchema {
		const fields = foundry.data.fields

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

	static newObject(): SourceFromSchema<PoolThresholdSchema> {
		return {
			state: "",
			explanation: "",
			expression: "",
			ops: [],
		}
	}
}
