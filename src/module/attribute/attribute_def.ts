import { PoolThreshold } from "./pool_threshold"
import { CharacterResolver, evaluateToNumber, sanitizeId } from "@util"
import { AttributeDefObj, reserved_ids } from "./data"
import { attribute, progression } from "@util/enum"
import { Mook } from "@module/mook"

export class AttributeDef {
	private def_id!: string

	type!: attribute.Type

	name!: string

	full_name!: string

	attribute_base!: string

	cost_per_point?: number

	cost_adj_percent_per_sm?: number

	thresholds?: PoolThreshold[]

	order?: number

	constructor(data?: AttributeDefObj) {
		if (data) {
			const thr: PoolThreshold[] = []
			if (data.thresholds)
				for (const t of data.thresholds) {
					thr.push(new PoolThreshold(t))
				}
			data.thresholds = thr
			Object.assign(this, data)
		}
	}

	get id(): string {
		return this.def_id
	}

	set id(v: string) {
		this.def_id = sanitizeId(v, false, reserved_ids)
	}

	get resolveFullName(): string {
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
		if (this.type.includes("_separator")) return false
		return !isNaN(parseInt(this.attribute_base))
	}

	baseValue(resolver: CharacterResolver | Mook): number {
		return evaluateToNumber(this.attribute_base, resolver)
	}

	computeCost(actor: CharacterResolver | Mook, value: number, cost_reduction: number, size_modifier: number): number {
		let cost = value * (this.cost_per_point || 0)
		if (
			size_modifier > 0 &&
			(this.cost_adj_percent_per_sm ?? 0) > 0 &&
			!(this.def_id === "hp" && actor.settings.damage_progression === progression.Option.KnowingYourOwnStrength)
		)
			cost_reduction = size_modifier * (this.cost_adj_percent_per_sm ?? 0)
		if (cost_reduction > 0) {
			if (cost_reduction > 80) cost_reduction = 80
			cost = (cost * (100 - cost_reduction)) / 100
		}
		return Math.round(cost)
	}
}
