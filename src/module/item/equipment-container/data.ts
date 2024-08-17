import fields = foundry.data.fields
import {
	AbstractContainerSource,
	AbstractContainerSystemData,
	AbstractContainerSystemSchema,
} from "@item/abstract-container/data.ts"
import { ItemType, NumericCompareType } from "@module/data/constants.ts"
import { WeightString, feature, prereq } from "@util"
import { EquipmentContainerGURPS } from "./document.ts"
import { BasePrereq, Feature, Prereq } from "@system"
import { BaseFeature } from "@system/feature/base.ts"
import { RecordField } from "@system/schema-data-fields.ts"

class EquipmentContainerSystemData extends AbstractContainerSystemData<
	EquipmentContainerGURPS,
	EquipmentContainerSystemSchema
> {
	static override defineSchema(): EquipmentContainerSystemSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({ required: true, initial: ItemType.EquipmentContainer }),
			description: new fields.StringField({
				required: true,
			}),
			reference: new fields.StringField(),
			reference_highlight: new fields.StringField(),
			notes: new fields.StringField(),
			vtt_notes: new fields.StringField(),
			tech_level: new fields.StringField(),
			legality_class: new fields.StringField(),
			tags: new fields.ArrayField(new foundry.data.fields.StringField()),
			rated_strength: new fields.NumberField({ integer: true, min: 0, nullable: true }),
			quantity: new fields.NumberField({ integer: true, min: 0 }),
			value: new fields.NumberField({ min: 0, nullable: false }),
			weight: new fields.StringField<WeightString>(),
			max_uses: new fields.NumberField({ integer: true, min: 0 }),
			uses: new fields.NumberField({ integer: true, min: 0 }),
			prereqs: new fields.ArrayField(new fields.TypedSchemaField(BasePrereq.TYPES), {
				initial: [
					{
						type: prereq.Type.List,
						id: "root",
						all: true,
						when_tl: { compare: NumericCompareType.AnyNumber, qualifier: 0 },
						prereqs: [],
					},
				],
			}),
			features: new fields.ArrayField(new fields.TypedSchemaField(BaseFeature.TYPES)),
			equipped: new fields.BooleanField({ initial: true }),
			ignore_weight_for_skills: new fields.BooleanField({ initial: false }),
			open: new fields.BooleanField({ initial: true }),
			replacements: new RecordField(
				new fields.StringField({ required: true, nullable: false }),
				new fields.StringField({ required: true, nullable: false }),
			),
		}
	}
}

interface EquipmentContainerSystemData
	extends AbstractContainerSystemData<EquipmentContainerGURPS, EquipmentContainerSystemSchema>,
		ModelPropsFromSchema<EquipmentContainerSystemSchema> {}

type EquipmentContainerSystemSchema = AbstractContainerSystemSchema & {
	type: fields.StringField<ItemType.EquipmentContainer, ItemType.EquipmentContainer, true, false, true>
	description: fields.StringField<string, string, true, false, true>
	reference: fields.StringField
	reference_highlight: fields.StringField
	notes: fields.StringField
	vtt_notes: fields.StringField
	tech_level: fields.StringField
	legality_class: fields.StringField
	tags: fields.ArrayField<fields.StringField>
	rated_strength: fields.NumberField
	quantity: fields.NumberField<number, number, true, false, true>
	value: fields.NumberField<number, number, true, false, true>
	weight: fields.StringField<WeightString>
	max_uses: fields.NumberField
	uses: fields.NumberField
	prereqs: fields.ArrayField<fields.TypedSchemaField<Record<prereq.Type, ConstructorOf<Prereq>>>>
	features: fields.ArrayField<fields.TypedSchemaField<Record<feature.Type, ConstructorOf<Feature>>>>
	equipped: fields.BooleanField
	ignore_weight_for_skills: fields.BooleanField
	open: fields.BooleanField
	replacements: RecordField<
		fields.StringField<string, string, true, false, false>,
		fields.StringField<string, string, true, false, false>
	>
}

type EquipmentContainerSystemSource = SourceFromSchema<EquipmentContainerSystemSchema>

type EquipmentContainerSource = AbstractContainerSource<ItemType.EquipmentContainer, EquipmentContainerSystemSource>

export type { EquipmentContainerSource, EquipmentContainerSystemSource }
export { EquipmentContainerSystemData }
