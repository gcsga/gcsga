import fields = foundry.data.fields
import { ResourceTracker } from "./resource-tracker.ts"
import { ActorDataModel } from "../abstract.ts"
import { PoolThreshold, PoolThresholdSchema } from "../attribute/index.ts"
import { AbstractAttributeDef, AbstractAttributeDefSchema } from "../abstract-attribute/index.ts"

class ResourceTrackerDef extends AbstractAttributeDef<ActorDataModel, ResourceTrackerDefSchema> {
	constructor(
		data: DeepPartial<SourceFromSchema<ResourceTrackerDefSchema>>,
		options?: DataModelConstructionOptions<ActorDataModel>,
	) {
		super(data, options)
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

	baseValue(_resolver: ActorDataModel): number {
		return this.max
	}

	override generateNewAttribute(): ResourceTracker {
		return new ResourceTracker({ id: this.id }, { parent: this.parent, order: 0 })
	}
}

interface ResourceTrackerDef
	extends AbstractAttributeDef<ActorDataModel, ResourceTrackerDefSchema>,
		Omit<ModelPropsFromSchema<ResourceTrackerDefSchema>, "thresholds"> {
	thresholds: PoolThreshold[]
}

type ResourceTrackerDefSchema = AbstractAttributeDefSchema & {
	name: fields.StringField
	full_name: fields.StringField
	max: fields.NumberField<number, number, true, false, true>
	min: fields.NumberField<number, number, true, false, true>
	isMaxEnforced: fields.BooleanField
	isMinEnforced: fields.BooleanField
	thresholds: fields.ArrayField<fields.SchemaField<PoolThresholdSchema>>
	order: fields.NumberField
}

export { ResourceTrackerDef, type ResourceTrackerDefSchema }
