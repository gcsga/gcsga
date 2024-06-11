import { MoveTypeResolver, evaluateToNumber } from "@module/util/index.ts"
import { MoveTypeDefObj, MoveTypeObj } from "./data.ts"
import { MoveTypeOverride, MoveTypeOverrideSchema } from "./override.ts"
import { AbstractAttributeDef } from "@system"

const fields = foundry.data.fields

type MoveTypeDefDefSchema = {
	id: foundry.data.fields.StringField
	base: foundry.data.fields.StringField
	name: foundry.data.fields.StringField
	cost_per_point: foundry.data.fields.NumberField
	overrides: foundry.data.fields.ArrayField<foundry.data.fields.SchemaField<MoveTypeOverrideSchema>>
	order: foundry.data.fields.NumberField
}

export class MoveTypeDef extends AbstractAttributeDef {
	name: string
	cost_per_point = 0
	overrides: MoveTypeOverride[]
	order: number

	constructor(data: MoveTypeDefObj) {
		super(data)
		this.name = data.name
		this.cost_per_point = data.cost_per_point ?? 0
		this.order = data.order ?? 0
		this.overrides = data.overrides?.map(threshold => new MoveTypeOverride(threshold))
	}

	static defineSchema(): MoveTypeDefDefSchema {
		return {
			id: new fields.StringField({ initial: "id" }),
			base: new fields.StringField({ initial: "$basic_move" }),
			name: new fields.StringField({ initial: "id" }),
			cost_per_point: new fields.NumberField({ min: 0 }),
			overrides: new fields.ArrayField(new fields.SchemaField(MoveTypeOverride.defineSchema())),
			order: new fields.NumberField({ min: 0 }),
		}
	}

	baseValue(resolver: MoveTypeResolver): number {
		return evaluateToNumber(this.base, resolver)
	}

	override generateNewAttribute(): MoveTypeObj {
		return {
			...super.generateNewAttribute(),
			adj: 0,
		}
	}

	static override newObject(reservedIds: string[]): MoveTypeDefObj {
		return {
			...super.newObject(reservedIds),
			name: "",
			overrides: [],
		}
	}
}
