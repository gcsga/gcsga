import { PoolThreshold, PoolThresholdSchema } from "./pool-threshold.ts"
import fields = foundry.data.fields
import { gid } from "@module/data/constants.ts"
import { AttributeGURPS } from "./attribute.ts"
import { attribute, progression } from "@util"
import { ActorDataModel } from "@module/data/abstract.ts"
import { ActorTemplateType } from "@module/data/actor/types.ts"
import { AttributeHolderTemplate } from "@module/data/actor/templates/attribute-holder.ts"
import { VariableResolver, evaluateToNumber } from "@module/util/index.ts"
import { AbstractAttributeDef, AbstractAttributeDefSchema } from "../abstract-attribute/index.ts"

class AttributeDef<TActor extends AttributeHolderTemplate = AttributeHolderTemplate> extends AbstractAttributeDef<
	TActor,
	AttributeDefSchema
> {
	constructor(
		data: DeepPartial<SourceFromSchema<AttributeDefSchema>>,
		options?: DataModelConstructionOptions<TActor>,
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

	baseValue(resolver: VariableResolver): number {
		return evaluateToNumber(this.base, resolver)
	}

	computeCost(actor: ActorDataModel, value: number, cost_reduction: number, size_modifier: number): number {
		if (!actor.hasTemplate(ActorTemplateType.Settings)) {
			console.error("Actor does not have settings. Cannot compute cost")
			return 0
		}
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

interface AttributeDef<TActor extends AttributeHolderTemplate>
	extends AbstractAttributeDef<TActor, AttributeDefSchema>,
		Omit<ModelPropsFromSchema<AttributeDefSchema>, "thresholds"> {
	thresholds: PoolThreshold[] | null
}

type AttributeDefSchema = AbstractAttributeDefSchema & {
	type: fields.StringField<attribute.Type, attribute.Type, true>
	name: fields.StringField<string, string, true, false, true>
	full_name: fields.StringField<string, string, true, false, true>
	cost_per_point: fields.NumberField<number, number, true, false, true>
	cost_adj_percent_per_sm: fields.NumberField<number, number, true, false, true>
	thresholds: fields.ArrayField<
		fields.SchemaField<PoolThresholdSchema>,
		Partial<SourceFromSchema<PoolThresholdSchema>>[],
		ModelPropsFromSchema<PoolThresholdSchema>[],
		false,
		true
	>
	order: fields.NumberField<number, number, true, false, true>
}

export { AttributeDef, type AttributeDefSchema }
