import fields = foundry.data.fields
import type { AttributeDef } from "./attribute-definition.ts"
import { ErrorGURPS, threshold } from "@util"
import { VariableResolver, evaluateToNumber } from "@module/util/index.ts"
import { ResourceTrackerDef } from "../resource-tracker/resource-tracker-definition.ts"
import { ActorGURPS2 } from "@module/documents/actor.ts"

class PoolThreshold extends foundry.abstract.DataModel<AttributeDef | ResourceTrackerDef, PoolThresholdSchema> {
	static override defineSchema(): PoolThresholdSchema {
		const fields = foundry.data.fields
		return {
			state: new fields.StringField({
				required: true,
				nullable: false,
				initial: "",
				label: "GURPS.Attribute.Threshold.FIELDS.State.Name",
			}),
			explanation: new fields.StringField({
				required: false,
				nullable: false,
				initial: "",
				label: "GURPS.Attribute.Threshold.FIELDS.Explanation.Name",
			}),
			expression: new fields.StringField({
				required: true,
				nullable: false,
				initial: "",
				label: "GURPS.Attribute.Threshold.FIELDS.Expression.Name",
			}),
			ops: new fields.ArrayField(
				new fields.StringField({
					required: false,
					nullable: false,
					choices: threshold.OpsChoices,
				}),
				{ required: false, nullable: false, label: "GURPS.Attribute.Threshold.FIELDS.Ops.Name" },
			),
		}
	}

	/* -------------------------------------------- */

	get actor(): ActorGURPS2 {
		return this.parent.actor
	}

	/* -------------------------------------------- */

	/*
	 * Returns the index of this threshold within the Attribute definition it is contained in
	 */
	get index(): number {
		const index = this.parent.thresholds?.indexOf(this) ?? null
		if (index === null) throw ErrorGURPS(`Pool Threshold with state "${this.state} has no index.`)
		return index
	}

	/* -------------------------------------------- */

	/*
	 * Returns the minimum value which falls within this threshold
	 */
	get min(): number {
		const nextThreshold = this.parent.thresholds![this.index - 1] ?? null
		if (this.index === 0 || nextThreshold === null) return Number.MIN_SAFE_INTEGER
		return nextThreshold.threshold()
	}

	/* -------------------------------------------- */

	/*
	 * Returns the maximum value which falls within this threshold
	 */
	get max(): number {
		return this.threshold()
	}

	/* -------------------------------------------- */

	threshold(actor: VariableResolver = this.actor.system): number {
		return evaluateToNumber(this.expression, actor)
	}

	/* -------------------------------------------- */
}

interface PoolThreshold
	extends foundry.abstract.DataModel<AttributeDef | ResourceTrackerDef, PoolThresholdSchema>,
		ModelPropsFromSchema<PoolThresholdSchema> {}

type PoolThresholdSchema = {
	state: fields.StringField<string, string, true, false, true>
	explanation: fields.StringField<string, string, false, false, true>
	expression: fields.StringField<string, string, true, false, true>
	ops: fields.ArrayField<fields.StringField<threshold.Op, threshold.Op, false, false, false>>
}

export { PoolThreshold, type PoolThresholdSchema }
