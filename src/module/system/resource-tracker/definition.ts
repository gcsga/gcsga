import { AbstractAttributeDef } from "@system/abstract-attribute/definition.ts"
import { ResourceTrackerDefSchema } from "./data.ts"
import type { CharacterGURPS } from "@actor"
import { PoolThreshold } from "@system/attribute/pool-threshold.ts"
import { ResourceTracker } from "./object.ts"

class ResourceTrackerDef extends AbstractAttributeDef<CharacterGURPS, ResourceTrackerDefSchema> {
	// name: string
	// private full_name: string
	// thresholds: PoolThreshold[] = []
	// max = 10
	// min = 0
	// isMaxEnforced = false
	// isMinEnforced = false
	// order = 0

	constructor(
		data: DeepPartial<SourceFromSchema<ResourceTrackerDefSchema>>,
		options?: DataModelConstructionOptions<CharacterGURPS>,
	) {
		super(data, options)
		// this.name = data.name
		// this.full_name = data.full_name
		// this.max = data.max ?? 10
		// this.min = data.min ?? 0
		// this.isMaxEnforced = data.isMaxEnforced ?? false
		// this.isMinEnforced = data.isMinEnforced ?? false
		// this.order = data.order ?? 0
	}

	static override defineSchema(): ResourceTrackerDefSchema {
		const fields = foundry.data.fields
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

	baseValue(_resolver: CharacterGURPS): number {
		return this.max
	}

	override generateNewAttribute(): ResourceTracker {
		return new ResourceTracker({ id: this.id }, { parent: this.parent, order: 0 })
	}
}

interface ResourceTrackerDef
	extends AbstractAttributeDef<CharacterGURPS, ResourceTrackerDefSchema>,
		Omit<ModelPropsFromSchema<ResourceTrackerDefSchema>, "thresholds"> {
	thresholds: PoolThreshold[]
}

export { ResourceTrackerDef }
