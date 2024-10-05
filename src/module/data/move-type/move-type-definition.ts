import { MoveTypeOverride, MoveTypeOverrideSchema } from "./move-type-override.ts"
import fields = foundry.data.fields
import { VariableResolver, evaluateToNumber } from "@module/util/gcs/eval.ts"
import {
	AbstractAttributeDef,
	AbstractAttributeDefSchema,
} from "../abstract-attribute/abstract-attribute-definition.ts"

class MoveTypeDef extends AbstractAttributeDef<MoveTypeDefSchema> {
	// static override attributeClass = MoveType

	static override defineSchema(): MoveTypeDefSchema {
		const fields = foundry.data.fields

		return {
			id: new fields.StringField({
				required: true,
				nullable: false,
				initial: "id",
				label: "GURPS.MoveType.Definition.FIELDS.Id.Name",
			}),
			base: new fields.StringField({
				required: true,
				nullable: false,
				initial: "$basic_move",
				label: "GURPS.MoveType.Definition.FIELDS.Base.Name",
			}),
			name: new fields.StringField({
				required: true,
				nullable: false,
				initial: "id",
				label: "GURPS.MoveType.Definition.FIELDS.Name.Name",
			}),
			cost_per_point: new fields.NumberField({
				required: true,
				nullable: false,
				min: 0,
				initial: 0,
				label: "GURPS.MoveType.Definition.FIELDS.CostPerPoint.Name",
			}),
			overrides: new fields.ArrayField(new fields.EmbeddedDataField(MoveTypeOverride), {
				required: true,
				nullable: false,
				initial: [],
				label: "GURPS.MoveType.Definition.FIELDS.Overrides.Name",
			}),
		}
	}

	baseValue(resolver: VariableResolver): number {
		return evaluateToNumber(this.base, resolver)
	}

	// override generateNewAttribute(): MoveType {
	// 	return new MoveType({ id: this.id }, { parent: this.actor.system, order: 0 })
	// }
}

interface MoveTypeDef extends AbstractAttributeDef<MoveTypeDefSchema>, ModelPropsFromSchema<MoveTypeDefSchema> {}

type MoveTypeDefSchema = AbstractAttributeDefSchema & {
	name: fields.StringField<string, string, true, false, true>
	cost_per_point: fields.NumberField<number, number, true, false, true>
	overrides: fields.ArrayField<
		fields.EmbeddedDataField<MoveTypeOverride>,
		Partial<SourceFromSchema<MoveTypeOverrideSchema>>[],
		MoveTypeOverride[],
		true,
		false,
		true
	>
}
export { MoveTypeDef, type MoveTypeDefSchema }
