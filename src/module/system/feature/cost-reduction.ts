import { gid } from "@data"
import { CostReductionSchema } from "./data.ts"
import { BaseFeature } from "./base.ts"

class CostReduction extends BaseFeature<CostReductionSchema> {
	static override defineSchema(): CostReductionSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			attribute: new fields.StringField({ initial: gid.Strength }),
			percentage: new fields.NumberField({ choices: CONFIG.GURPS.select.percentage, initial: 40 }),
		}
	}

	fillWithNameableKeys(_m: Map<string, string>, _existing: Map<string, string>): void {}
}

interface CostReduction extends BaseFeature<CostReductionSchema>, ModelPropsFromSchema<CostReductionSchema> {}

export { CostReduction }
