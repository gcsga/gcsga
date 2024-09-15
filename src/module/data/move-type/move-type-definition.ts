import { MoveTypeOverride, MoveTypeOverrideSchema } from "./move-type-override.ts"
import fields = foundry.data.fields
import { VariableResolver, evaluateToNumber } from "@module/util/gcs/eval.ts"
import { MoveType } from "./move-type.ts"
import { ActorDataModel } from "../abstract.ts"
import {
	AbstractAttributeDef,
	AbstractAttributeDefSchema,
} from "../abstract-attribute/abstract-attribute-definition.ts"

class MoveTypeDef extends AbstractAttributeDef<ActorDataModel, MoveTypeDefSchema> {
	// constructor(
	// 	data: DeepPartial<SourceFromSchema<MoveTypeDefSchema>>,
	// 	options?: DataModelConstructionOptions<CharacterGURPS>,
	// ) {
	// 	super(data, options)
	//
	// 	if (data.overrides) {
	// 		this.overrides = data.overrides.map(e => new MoveTypeOverride(e!, { parent: this.parent }))
	// 	}
	// }

	static override defineSchema(): MoveTypeDefSchema {
		const fields = foundry.data.fields

		return {
			id: new fields.StringField({ initial: "id" }),
			base: new fields.StringField({ initial: "$basic_move" }),
			name: new fields.StringField({ initial: "id" }),
			cost_per_point: new fields.NumberField({ min: 0 }),
			overrides: new fields.ArrayField(new fields.SchemaField(MoveTypeOverride.defineSchema())),
			order: new fields.NumberField({ min: 0 }),
		}
	}

	baseValue(resolver: VariableResolver): number {
		return evaluateToNumber(this.base, resolver)
	}

	override generateNewAttribute(): MoveType {
		return new MoveType({ id: this.id }, { parent: this.parent, order: 0 })
	}
}

interface MoveTypeDef
	extends AbstractAttributeDef<ActorDataModel, MoveTypeDefSchema>,
		ModelPropsFromSchema<MoveTypeDefSchema> {}

type MoveTypeDefSchema = AbstractAttributeDefSchema & {
	name: fields.StringField
	cost_per_point: fields.NumberField
	overrides: fields.ArrayField<
		fields.SchemaField<MoveTypeOverrideSchema, SourceFromSchema<MoveTypeOverrideSchema>, MoveTypeOverride>
	>
	order: fields.NumberField
}

export { MoveTypeDef, type MoveTypeDefSchema }
