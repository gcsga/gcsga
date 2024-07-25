import { evaluateToNumber } from "@module/util/index.ts"
import { PoolThresholdSchema, ThresholdOp } from "./data.ts"
import { CharacterGURPS } from "@actor"
import { Mook } from "@system/mook/document.ts"
import { AttributeDef } from "./definition.ts"
import { ResourceTrackerDef } from "@system/resource-tracker/definition.ts"

class PoolThreshold extends foundry.abstract.DataModel<AttributeDef | ResourceTrackerDef, PoolThresholdSchema> {
	constructor(
		data: DeepPartial<SourceFromSchema<PoolThresholdSchema>>,
		options?: DataModelConstructionOptions<AttributeDef | ResourceTrackerDef>
	) {
		super(data, options)
	}

	static override defineSchema(): PoolThresholdSchema {
		const fields = foundry.data.fields

		return {
			state: new fields.StringField(),
			explanation: new fields.StringField({ required: false }),
			expression: new fields.StringField(),
			ops: new fields.ArrayField(new fields.StringField<ThresholdOp>(), { required: false }),
		}
	}

	threshold(actor: CharacterGURPS | Mook): number {
		return evaluateToNumber(this.expression, actor)
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

interface PoolThreshold
	extends foundry.abstract.DataModel<AttributeDef | ResourceTrackerDef, PoolThresholdSchema>,
	ModelPropsFromSchema<PoolThresholdSchema> { }

export { PoolThreshold }
