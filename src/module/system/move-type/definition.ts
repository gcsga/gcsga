import { MoveTypeOverride } from "./override.ts"
import type { CharacterGURPS } from "@actor"
import { evaluateToNumber } from "@module/util/gcs/eval.ts"
import { AbstractAttributeDef } from "@system/abstract-attribute/index.ts"
import type { MoveTypeDefSchema } from "./data.ts"
import { MoveType } from "./object.ts"

class MoveTypeDef extends AbstractAttributeDef<CharacterGURPS, MoveTypeDefSchema> {
	constructor(
		data: DeepPartial<SourceFromSchema<MoveTypeDefSchema>>,
		options?: DataModelConstructionOptions<CharacterGURPS>,
	) {
		super(data, options)

		if (data.overrides) {
			this.overrides = data.overrides.map(e => new MoveTypeOverride(e!, { parent: this.parent }))
		}
	}

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

	baseValue(resolver: CharacterGURPS): number {
		return evaluateToNumber(this.base, resolver)
	}

	override generateNewAttribute(): MoveType {
		return new MoveType({ id: this.id }, { parent: this.parent, order: 0 })
	}
}

interface MoveTypeDef
	extends AbstractAttributeDef<CharacterGURPS, MoveTypeDefSchema>,
		Omit<ModelPropsFromSchema<MoveTypeDefSchema>, "overrides"> {
	overrides: MoveTypeOverride[]
}

export { MoveTypeDef }
