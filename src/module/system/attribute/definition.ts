import { PoolThreshold } from "./pool-threshold.ts"
import type { AttributeDefSchema } from "./data.ts"
import { AbstractAttributeDef } from "@system/abstract-attribute/definition.ts"
import { gid } from "@module/data/constants.ts"
import type { ActorGURPS, CharacterGURPS } from "@actor"
import { AttributeGURPS } from "./object.ts"
import type { Mook } from "@system/mook/index.ts"
import { attribute, progression } from "@util"
import { evaluateToNumber } from "@module/util/gcs/eval.ts"

class AttributeDef extends AbstractAttributeDef<CharacterGURPS | Mook, AttributeDefSchema> {
	constructor(
		data: DeepPartial<SourceFromSchema<AttributeDefSchema>>,
		options?: DataModelConstructionOptions<CharacterGURPS | Mook>,
	) {
		super(data, options)
		this.thresholds = data.thresholds?.map(threshold => new PoolThreshold(threshold!)) ?? []
	}

	static override defineSchema(): AttributeDefSchema {
		const fields = foundry.data.fields

		return {
			type: new fields.StringField({
				choices: attribute.Types,
				initial: attribute.Type.Integer,
			}),
			id: new fields.StringField({ initial: "id" }),
			base: new fields.StringField({ initial: "10" }),
			name: new fields.StringField({ initial: "id" }),
			full_name: new fields.StringField({ initial: "" }),
			cost_per_point: new fields.NumberField({ min: 0 }),
			cost_adj_percent_per_sm: new fields.NumberField({ integer: true, min: 0, max: 80, initial: 0 }),
			thresholds: new fields.ArrayField(new fields.SchemaField(PoolThreshold.defineSchema()), {
				required: false,
				nullable: true,
				initial: null,
			}),
			order: new fields.NumberField({ min: 0 }),
		}
	}

	get fullName(): string {
		if (!this.full_name) return this.name
		return this.full_name
	}

	get combinedName(): string {
		if (!this.full_name) return this.name
		if (!this.name || this.name === this.full_name) return this.full_name
		return `${this.full_name} (${this.name})`
	}

	get isPrimary(): boolean {
		if (this.type === attribute.Type.PrimarySeparator) return true
		if ([attribute.Type.SecondarySeparator, attribute.Type.PoolSeparator, attribute.Type.Pool].includes(this.type))
			return false
		return !isNaN(parseInt(this.base))
	}

	baseValue(resolver: ActorGURPS | Mook): number {
		return evaluateToNumber(this.base, resolver)
	}

	computeCost(actor: CharacterGURPS | Mook, value: number, cost_reduction: number, size_modifier: number): number {
		let cost = value * (this.cost_per_point || 0)
		if (
			size_modifier > 0 &&
			(this.cost_adj_percent_per_sm ?? 0) > 0 &&
			!(
				this.id === gid.HitPoints &&
				actor.settings.damage_progression === progression.Option.KnowingYourOwnStrength
			)
		)
			cost_reduction = size_modifier * (this.cost_adj_percent_per_sm ?? 0)
		if (cost_reduction > 0) {
			if (cost_reduction > 80) cost_reduction = 80
			cost = (cost * (100 - cost_reduction)) / 100
		}
		return Math.round(cost)
	}

	generateNewAttribute(): AttributeGURPS {
		return new AttributeGURPS({ id: this.id }, { parent: this.parent, order: 0 })
	}
}

interface AttributeDef
	extends AbstractAttributeDef<CharacterGURPS | Mook, AttributeDefSchema>,
		Omit<ModelPropsFromSchema<AttributeDefSchema>, "thresholds"> {
	thresholds: PoolThreshold[] | null
}

export { AttributeDef }
