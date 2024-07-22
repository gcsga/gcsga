import { BaseItemSourceGURPS } from "@item/base/data.ts"
import { ItemSystemModel, ItemSystemSchema } from "@item/base/schema.ts"
import { ItemType } from "@module/data/constants.ts"
import { LocalizeGURPS, affects, tmcost } from "@util"
import { TraitModifierGURPS } from "./document.ts"
import fields = foundry.data.fields
import { BaseFeature } from "@system/feature/base.ts"
import { FeatureSchema } from "@system"

class TraitModifierSystemData extends ItemSystemModel<TraitModifierGURPS, TraitModifierSystemSchema> {
	static override defineSchema(): TraitModifierSystemSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({ required: true, initial: ItemType.TraitModifier }),
			name: new fields.StringField({
				required: true,
				initial: LocalizeGURPS.translations.TYPES.Item[ItemType.TraitModifier],
			}),
			reference: new fields.StringField(),
			reference_highlight: new fields.StringField(),
			notes: new fields.StringField(),
			vtt_notes: new fields.StringField(),
			tags: new fields.ArrayField(new foundry.data.fields.StringField()),
			cost: new fields.NumberField(),
			levels: new fields.NumberField(),
			affects: new fields.StringField<affects.Option>(),
			cost_type: new fields.StringField<tmcost.Type>(),
			disabled: new fields.BooleanField({ initial: false }),
			features: new fields.ArrayField(new fields.SchemaField(BaseFeature.defineSchema())),
		}
	}
}

interface TraitModifierSystemData
	extends ItemSystemModel<TraitModifierGURPS, TraitModifierSystemSchema>,
	ModelPropsFromSchema<TraitModifierSystemSchema> { }

type TraitModifierSystemSchema = ItemSystemSchema & {
	type: fields.StringField<ItemType.TraitModifier, ItemType.TraitModifier, true, false, true>
	name: fields.StringField<string, string, true, false, true>
	reference: fields.StringField
	reference_highlight: fields.StringField
	notes: fields.StringField
	vtt_notes: fields.StringField
	tags: fields.ArrayField<fields.StringField>
	cost: fields.NumberField<number, number, true, false, true>
	levels: fields.NumberField<number, number, true, false, true>
	affects: fields.StringField<affects.Option>
	cost_type: fields.StringField<tmcost.Type>
	disabled: fields.BooleanField
	features: fields.ArrayField<fields.SchemaField<FeatureSchema>>
}

type TraitModifierSystemSource = SourceFromSchema<TraitModifierSystemSchema>

type TraitModifierSource = BaseItemSourceGURPS<ItemType.TraitModifier, TraitModifierSystemSource>

export type { TraitModifierSource, TraitModifierSystemSource }
export { TraitModifierSystemData }
