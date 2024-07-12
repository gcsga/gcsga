import { ResourceTrackerDef } from "./definition.ts"
import { AbstractAttribute, PoolThreshold, ResourceTrackerSchema } from "@system"
import { TokenPool } from "@module/data/types.ts"
import { CharacterGURPS } from "@actor"

class ResourceTracker extends AbstractAttribute<CharacterGURPS, ResourceTrackerSchema> {
	order: number
	// damage?: number

	constructor(data: SourceFromSchema<ResourceTrackerSchema>, order: number) {
		super(data)
		// this.damage = data.damage ?? 0
		this.order = order
	}

	static override defineSchema(): ResourceTrackerSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			damage: new fields.NumberField({ initial: 0 })
		}
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

	toTokenPool(): TokenPool | null {
		return {
			value: this.current,
			max: this.definition?.isMaxEnforced ? this.max : Number.MAX_SAFE_INTEGER,
			min: this.definition?.isMinEnforced ? this.min : Number.MIN_SAFE_INTEGER,
		}
	}
}

interface ResourceTracker extends AbstractAttribute<CharacterGURPS, ResourceTrackerSchema>, ModelPropsFromSchema<ResourceTrackerSchema> { }

export { ResourceTracker }
