import fields = foundry.data.fields
import type { TokenPool } from "@module/data/types.ts"
import type { ResourceTrackerDef } from "./resource-tracker-definition.ts"
import { SheetSettings } from "@module/data/sheet-settings.ts"
import {
	AbstractAttribute,
	AbstractAttributeConstructionOptions,
	AbstractAttributeSchema,
} from "../abstract-attribute/index.ts"
import { PoolThreshold } from "../attribute/index.ts"
import { ActorDataModel } from "../actor/abstract.ts"

class ResourceTracker extends AbstractAttribute<ActorDataModel, ResourceTrackerSchema> {
	order: number
	// damage?: number

	constructor(
		data: DeepPartial<SourceFromSchema<ResourceTrackerSchema>>,
		options?: AbstractAttributeConstructionOptions<ActorDataModel>,
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
	extends AbstractAttribute<ActorDataModel, ResourceTrackerSchema>,
		ModelPropsFromSchema<ResourceTrackerSchema> {}

type ResourceTrackerSchema = AbstractAttributeSchema & {
	damage: fields.NumberField<number, number, true, false, true>
}

export { ResourceTracker, type ResourceTrackerSchema }
