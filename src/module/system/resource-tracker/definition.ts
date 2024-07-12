import { ResourceTrackerDefSchema, ResourceTrackerSchema } from "./data.ts"
import { AbstractAttributeDef, PoolThreshold, ResourceTracker } from "@system"
import { CharacterGURPS } from "@actor"


class ResourceTrackerDef extends AbstractAttributeDef<CharacterGURPS, ResourceTrackerDefSchema> {
	// name: string
	// private full_name: string
	// thresholds: PoolThreshold[] = []
	// max = 10
	// min = 0
	// isMaxEnforced = false
	// isMinEnforced = false
	// order = 0

	constructor(data: DeepPartial<SourceFromSchema<ResourceTrackerDefSchema>>) {
		super(data)
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

	override generateNewAttribute(): SourceFromSchema<ResourceTrackerSchema> {
		return new ResourceTracker({}, 0).toObject()
		// return {
		// 	...super.generateNewAttribute(),
		// 	damage: 0,
		// }
	}

	static override newObject(reservedIds: string[]): SourceFromSchema<ResourceTrackerDefSchema> {
		return new ResourceTrackerDef({}).toObject()
	}

}

interface ResourceTrackerDef extends AbstractAttributeDef<CharacterGURPS, ResourceTrackerDefSchema>, ModelPropsFromSchema<ResourceTrackerDefSchema> { }

export { ResourceTrackerDef }
