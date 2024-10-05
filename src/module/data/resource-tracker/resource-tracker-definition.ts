import fields = foundry.data.fields
import { ActorDataModel } from "../abstract.ts"
import { PoolThreshold, PoolThresholdSchema } from "../attribute/index.ts"
import { AbstractAttributeDef, AbstractAttributeDefSchema } from "../abstract-attribute/index.ts"

class ResourceTrackerDef extends AbstractAttributeDef<ResourceTrackerDefSchema> {
	static override defineSchema(): ResourceTrackerDefSchema {
		const fields = foundry.data.fields
		return {
			id: new fields.StringField({
				required: true,
				nullable: false,
				initial: "id",
				label: "GURPS.ResourceTracker.Definition.FIELDS.Id.Name",
			}),
			base: new fields.StringField({
				required: true,
				nullable: false,
				initial: "10",
				label: "GURPS.ResourceTracker.Definition.FIELDS.Base.Name",
			}),
			name: new fields.StringField({
				required: true,
				nullable: false,
				initial: "id",
				label: "GURPS.ResourceTracker.Definition.FIELDS.Name.Name",
			}),
			full_name: new fields.StringField({
				required: false,
				nullable: false,
				initial: "",
				label: "GURPS.ResourceTracker.Definition.FIELDS.FullName.Name",
			}),
			thresholds: new fields.ArrayField(new fields.EmbeddedDataField(PoolThreshold), {
				required: true,
				nullable: false,
				label: "GURPS.ResourceTracker.Definition.FIELDS.Thresholds.Name",
			}),
			max: new fields.NumberField({
				required: true,
				nullable: false,
				integer: true,
				initial: 10,
				label: "GURPS.ResourceTracker.Definition.FIELDS.Max.Name",
			}),
			min: new fields.NumberField({
				integer: true,
				initial: 0,
				label: "GURPS.ResourceTracker.Definition.FIELDS.Min.Name",
			}),
			isMaxEnforced: new fields.BooleanField({
				required: true,
				nullable: false,
				initial: false,
				label: "GURPS.ResourceTracker.Definition.FIELDS.IsMaxEnforced.Name",
			}),
			isMinEnforced: new fields.BooleanField({
				required: true,
				nullable: false,
				initial: false,
				label: "GURPS.ResourceTracker.Definition.FIELDS.IsMinEnforced.Name",
			}),
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

	// override generateNewAttribute(): ResourceTracker {
	// 	return new ResourceTracker({ id: this.id }, { parent: this.actor.system, order: 0 })
	// }
}

interface ResourceTrackerDef
	extends AbstractAttributeDef<ResourceTrackerDefSchema>,
		ModelPropsFromSchema<ResourceTrackerDefSchema> {}

type ResourceTrackerDefSchema = AbstractAttributeDefSchema & {
	name: fields.StringField<string, string, true, false, true>
	full_name: fields.StringField<string, string, false, false, true>
	max: fields.NumberField<number, number, true, false, true>
	min: fields.NumberField<number, number, true, false, true>
	isMaxEnforced: fields.BooleanField<boolean, boolean, true, false, true>
	isMinEnforced: fields.BooleanField<boolean, boolean, true, false, true>
	thresholds: fields.ArrayField<
		fields.EmbeddedDataField<PoolThreshold>,
		Partial<SourceFromSchema<PoolThresholdSchema>>[],
		PoolThreshold[],
		true,
		false,
		true
	>
}

export { ResourceTrackerDef, type ResourceTrackerDefSchema }
