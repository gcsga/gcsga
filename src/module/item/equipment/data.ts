import { ItemFlagsGURPS } from "@item/data/index.ts"
import { ItemFlags, ItemType, SYSTEM_NAME } from "@module/data/constants.ts"
import { FeatureSchema, PrereqList, PrereqListSchema } from "@system"
import { WeightString } from "@util"
import fields = foundry.data.fields
import {
	AbstractContainerSource,
	AbstractContainerSystemData,
	AbstractContainerSystemSchema,
} from "@item/abstract-container/data.ts"
import { EquipmentGURPS } from "./document.ts"
import { BaseFeature } from "@system/feature/base.ts"

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
			weight: new fields.StringField<WeightString>(),
			max_uses: new fields.NumberField({ integer: true, min: 0 }),
			uses: new fields.NumberField({ integer: true, min: 0 }),
			prereqs: new fields.SchemaField(PrereqList.defineSchema()),
			equipped: new fields.BooleanField({ initial: true }),
			features: new fields.ArrayField(new fields.SchemaField(BaseFeature.defineSchema())),
			ignore_weight_for_skills: new fields.BooleanField({ initial: false }),
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
	weight: fields.StringField<WeightString>
	max_uses: fields.NumberField
	uses: fields.NumberField
	prereqs: fields.SchemaField<PrereqListSchema>
	features: fields.ArrayField<fields.SchemaField<FeatureSchema>>
	equipped: fields.BooleanField
	ignore_weight_for_skills: fields.BooleanField
}

type EquipmentSystemSource = SourceFromSchema<EquipmentSystemSchema>

type EquipmentSource = AbstractContainerSource<ItemType.Equipment, EquipmentSystemSource>

export type { EquipmentSource, EquipmentSystemSource, EquipmentFlags }
export { EquipmentSystemData }
