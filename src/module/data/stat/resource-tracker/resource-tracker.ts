import fields = foundry.data.fields
import { ActorDataModel } from "@module/data/actor/abstract.ts"
import { SheetSettings } from "@module/data/sheet-settings.ts"
import type { TokenPool } from "@module/data/types.ts"
import { AbstractStat, AbstractStatConstructionOptions, AbstractStatSchema } from "../abstract-stat/index.ts"
import { PoolThreshold } from "../attribute/index.ts"
import type { ResourceTrackerDef } from "./resource-tracker-definition.ts"

class ResourceTracker extends AbstractStat<ActorDataModel, ResourceTrackerSchema> {
	order: number
	// damage?: number

	constructor(
		data: DeepPartial<SourceFromSchema<ResourceTrackerSchema>>,
		options?: AbstractStatConstructionOptions<ActorDataModel>,
	) {
		super(data, options)
		this.order = options?.order ?? 0
	}

	static override defineSchema(): ResourceTrackerSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			damage: new fields.NumberField({ initial: 0 }),
		}
	}

	get definition(): ResourceTrackerDef | null {
		return SheetSettings.for(this.actor).resource_trackers.find(att => att.id === this.id) ?? null
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
			if (this.current <= threshold.threshold(this.parent)) return threshold
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

interface ResourceTracker
	extends AbstractStat<ActorDataModel, ResourceTrackerSchema>,
		ModelPropsFromSchema<ResourceTrackerSchema> {}

type ResourceTrackerSchema = AbstractStatSchema & {
	damage: fields.NumberField<number, number, true, false, true>
}

export { ResourceTracker, type ResourceTrackerSchema }
