import { ItemFlagsGURPS } from "@item/data/index.ts"
import { ItemFlags, ItemType, NumericCompareType, SYSTEM_NAME } from "@module/data/constants.ts"
import { BasePrereq, Prereq } from "@system"
import { Weight, feature, prereq } from "@util"
import fields = foundry.data.fields
import {
	AbstractContainerSource,
	AbstractContainerSystemData,
	AbstractContainerSystemSchema,
} from "@item/abstract-container/data.ts"
import { EquipmentGURPS } from "./document.ts"
import { RecordField } from "@system/schema-data-fields.ts"
import { Feature, FeatureTypes } from "@system/feature/types.ts"

type EquipmentFlags = ItemFlagsGURPS & {
	[SYSTEM_NAME]: {
		[ItemFlags.Other]: boolean
	}
}

class EquipmentSystemData extends AbstractContainerSystemData<EquipmentGURPS, EquipmentSystemSchema> {
	static override defineSchema(): EquipmentSystemSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({ required: true, initial: ItemType.Equipment }),
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
			weight: new fields.StringField(),
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
			equipped: new fields.BooleanField({ initial: true }),
			features: new fields.ArrayField(new fields.TypedSchemaField(FeatureTypes)),
			ignore_weight_for_skills: new fields.BooleanField({ initial: false }),
			replacements: new RecordField(
				new fields.StringField({ required: true, nullable: false }),
				new fields.StringField({ required: true, nullable: false }),
			),
		}
	}
}

interface EquipmentSystemData
	extends AbstractContainerSystemData<EquipmentGURPS, EquipmentSystemSchema>,
		ModelPropsFromSchema<EquipmentSystemSchema> {}

type EquipmentSystemSchema = AbstractContainerSystemSchema & {
	type: fields.StringField<ItemType.Equipment, ItemType.Equipment, true, false, true>
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
	weight: fields.StringField<Weight.String>
	max_uses: fields.NumberField
	uses: fields.NumberField
	prereqs: fields.ArrayField<fields.TypedSchemaField<Record<prereq.Type, ConstructorOf<Prereq>>>>
	features: fields.ArrayField<fields.TypedSchemaField<Record<feature.Type, ConstructorOf<Feature>>>>
	equipped: fields.BooleanField
	ignore_weight_for_skills: fields.BooleanField
	replacements: RecordField<
		fields.StringField<string, string, true, false, false>,
		fields.StringField<string, string, true, false, false>
	>
}

type EquipmentSystemSource = SourceFromSchema<EquipmentSystemSchema>

type EquipmentSource = AbstractContainerSource<ItemType.Equipment, EquipmentSystemSource>

export type { EquipmentSource, EquipmentSystemSource, EquipmentFlags }
export { EquipmentSystemData }
