import { attribute } from "@util/enum/attribute.ts"
import { PoolThreshold } from "./pool-threshold.ts"
import { AttributeDefObj, AttributeObj } from "./data.ts"
import { progression } from "@util/enum/progression.ts"
import { AttributeResolver, evaluateToNumber } from "@util"
import { AbstractAttributeDef } from "@system/abstract-attribute/definition.ts"
import { gid } from "@module/data/constants.ts"

export class AttributeDef extends AbstractAttributeDef {
	declare type: attribute.Type
	name: string
	private full_name: string
	cost_per_point = 0
	cost_adj_percent_per_sm = 0
	thresholds?: PoolThreshold[]
	order: number

	constructor(data: AttributeDefObj) {
		super(data)
		this.type = data.type
		this.name = data.name
		this.full_name = data.full_name ?? ""
		this.cost_per_point = data.cost_per_point ?? 0
		this.cost_adj_percent_per_sm = data.cost_adj_percent_per_sm ?? 0
		this.order = data.order ?? 0
		this.thresholds = data.thresholds?.map(threshold => new PoolThreshold(threshold))
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

	baseValue(resolver: AttributeResolver): number {
		return evaluateToNumber(this.base, resolver)
	}

	computeCost(actor: AttributeResolver, value: number, cost_reduction: number, size_modifier: number): number {
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

	override generateNewAttribute(): AttributeObj {
		return {
			...super.generateNewAttribute(),
			adj: 0,
			damage: 0,
		}
	}

	static override newObject(reservedIds: string[]): AttributeDefObj {
		return {
			...super.newObject(reservedIds),
			type: attribute.Type.Integer,
			name: "",
			full_name: "",
		}
	}
}
