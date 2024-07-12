import { evaluateToNumber } from "@module/util/index.ts"
import { PoolThresholdSchema, ThresholdOp } from "./data.ts"
import { CharacterGURPS } from "@actor"


class PoolThreshold extends foundry.abstract.DataModel<CharacterGURPS, PoolThresholdSchema> {

	constructor(data: DeepPartial<SourceFromSchema<PoolThresholdSchema>>) {
		super(data)
	}

	static override defineSchema(): PoolThresholdSchema {
		const fields = foundry.data.fields

		return {
			state: new fields.StringField(),
			explanation: new fields.StringField({ required: false }),
			expression: new fields.StringField(),
			ops: new fields.ArrayField(new fields.StringField<ThresholdOp>()),
		}
	}

	threshold(resolver: CharacterGURPS): number {
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

interface PoolThreshold extends foundry.abstract.DataModel<CharacterGURPS, PoolThresholdSchema>, ModelPropsFromSchema<PoolThresholdSchema> {

}

export { PoolThreshold }
