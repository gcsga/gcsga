import { evaluateToNumber } from "@module/util/index.ts"
import { MoveTypeOverride } from "./override.ts"
import { AbstractAttributeDef, MoveTypeDefSchema, MoveTypeSchema } from "@system"
import { CharacterGURPS } from "@actor"

class MoveTypeDef extends AbstractAttributeDef<MoveTypeDefSchema, CharacterGURPS> {
	// name: string
	// cost_per_point = 0
	// overrides: MoveTypeOverride[]
	// order: number

	constructor(data: SourceFromSchema<MoveTypeDefSchema>) {
		super(data)
		// this.name = data.name
		// this.cost_per_point = data.cost_per_point ?? 0
		// this.order = data.order ?? 0
		// this.overrides = data.overrides?.map(threshold => new MoveTypeOverride(threshold))
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

	override generateNewAttribute(): SourceFromSchema<MoveTypeSchema> {
		return {
			...super.generateNewAttribute(),
			adj: 0,
		}
	}
}

interface MoveTypeDef extends AbstractAttributeDef<MoveTypeDefSchema, CharacterGURPS>, ModelPropsFromSchema<MoveTypeDefSchema> { }

export { MoveTypeDef }
