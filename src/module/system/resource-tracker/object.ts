import { ResourceTrackerResolver } from "@util"
import { ResourceTrackerObj } from "./data.ts"
import { ResourceTrackerDef } from "./definition.ts"
import { AbstractAttribute, PoolThreshold } from "@system"

class ResourceTracker<TActor extends ResourceTrackerResolver> extends AbstractAttribute<TActor> {
	order: number
	damage?: number

	constructor(actor: TActor, data: ResourceTrackerObj, order: number) {
		super(actor, data)
		this.damage = data.damage ?? 0
		this.order = order
	}

	get definition(): ResourceTrackerDef | null {
		return this.actor.settings.resource_trackers.find(att => att.id === this.id) ?? null
	}

	override get max(): number {
		return this.definition?.max ?? 0
	}

	get min(): number {
		return this.definition?.min ?? 0
	}

	override get current(): number {
		return this.max - (this.damage ?? 0)
	}

	get currentThreshold(): PoolThreshold | null {
		if (!this.actor || !this.definition) return null
		for (const threshold of this.definition.thresholds ?? []) {
			if (this.current <= threshold.threshold(this.actor)) return threshold
		}
		return null
	}
}

export { ResourceTracker }
