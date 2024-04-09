import { ResourceTrackerResolver } from "@util"
import { ResourceTrackerDefObj, ResourceTrackerObj } from "./data.ts"
import { AbstractAttributeDef, PoolThreshold } from "@system"
import { PoolThresholdSchema } from "@system/attribute/pool-threshold.ts"

const fields = foundry.data.fields

type ResourceTrackerDefSchema = {
	id: foundry.data.fields.StringField
	base: foundry.data.fields.StringField
	name: foundry.data.fields.StringField
	full_name: foundry.data.fields.StringField
	thresholds: foundry.data.fields.ArrayField<foundry.data.fields.SchemaField<PoolThresholdSchema>>
	max: foundry.data.fields.NumberField
	min: foundry.data.fields.NumberField
	isMaxEnforced: foundry.data.fields.BooleanField
	isMinEnforced: foundry.data.fields.BooleanField
	order: foundry.data.fields.NumberField
}

export class ResourceTrackerDef extends AbstractAttributeDef {
	name: string
	private full_name: string
	thresholds: PoolThreshold[] = []
	max = 10
	min = 0
	isMaxEnforced = false
	isMinEnforced = false
	order = 0

	constructor(data: ResourceTrackerDefObj) {
		super(data)
		this.name = data.name
		this.full_name = data.full_name
		this.max = data.max ?? 10
		this.min = data.min ?? 0
		this.isMaxEnforced = data.isMaxEnforced ?? false
		this.isMinEnforced = data.isMinEnforced ?? false
		this.order = data.order ?? 0
	}

	static defineSchema(): ResourceTrackerDefSchema {
		return {
			id: new fields.StringField({ initial: "id" }),
			base: new fields.StringField({ initial: "10" }),
			name: new fields.StringField({ initial: "id" }),
			full_name: new fields.StringField(),
			thresholds: new fields.ArrayField(new fields.SchemaField(PoolThreshold.defineSchema())),
			max: new fields.NumberField({ integer: true, initial: 10 }),
			min: new fields.NumberField({ integer: true, initial: 0 }),
			isMaxEnforced: new fields.BooleanField({ initial: false }),
			isMinEnforced: new fields.BooleanField({ initial: false }),
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

	baseValue(_resolver: ResourceTrackerResolver): number {
		return this.max
	}

	override generateNewAttribute(): ResourceTrackerObj {
		return {
			...super.generateNewAttribute(),
			damage: 0,
		}
	}

	static override newObject(reservedIds: string[]): ResourceTrackerDefObj {
		return {
			...super.newObject(reservedIds),
			name: "",
			full_name: "",
			min: 0,
			max: 10,
			isMinEnforced: false,
			isMaxEnforced: false,
		}
	}
}
