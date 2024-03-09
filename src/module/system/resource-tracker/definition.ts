import { ResourceTrackerResolver } from "@util"
import { ResourceTrackerDefObj, ResourceTrackerObj } from "./data.ts"
import { AbstractAttributeDef, PoolThreshold } from "@system"

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
