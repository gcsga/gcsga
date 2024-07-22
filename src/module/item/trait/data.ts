import { AbstractContainerSource, AbstractContainerSystemData, AbstractContainerSystemSchema } from "@item/abstract-container/data.ts"
import { ItemType, StringCompareType } from "@module/data/constants.ts"
import { FeatureSchema, PrereqList, PrereqListSchema, SkillBonus, Study } from "@system"
import { LocalizeGURPS, feature, selfctrl, skillsel, study } from "@util"
import { TraitGURPS } from "./document.ts"
import fields = foundry.data.fields
import { BaseFeature } from "@system/feature/base.ts"

function getCRFeatures(): Map<string, SkillBonus[]> {
	return new Map([
		[
			selfctrl.Adjustment.MajorCostOfLivingIncrease,
			[
				new SkillBonus({
					type: feature.Type.SkillBonus,
					selection_type: skillsel.Type.Name,
					name: { compare: StringCompareType.IsString, qualifier: "Merchant" },
					specialization: { compare: StringCompareType.AnyString },
					tags: { compare: StringCompareType.AnyString },
					amount: 1,
				}),
			],
		],
	])
}

class TraitSystemData extends AbstractContainerSystemData<TraitGURPS, TraitSystemSchema> {
	static override defineSchema(): TraitSystemSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({ required: true, initial: ItemType.Trait }),
			name: new fields.StringField({
				required: true,
				initial: LocalizeGURPS.translations.TYPES.Item[ItemType.Trait],
			}),
			reference: new fields.StringField(),
			reference_highlight: new fields.StringField(),
			notes: new fields.StringField(),
			vtt_notes: new fields.StringField(),
			userdesc: new fields.StringField(),
			tags: new fields.ArrayField(new foundry.data.fields.StringField()),
			base_points: new fields.NumberField({ integer: true, initial: 0 }),
			levels: new fields.NumberField({ min: 0, nullable: true }),
			points_per_level: new fields.NumberField({ integer: true, nullable: true }),
			prereqs: new fields.SchemaField(PrereqList.defineSchema()),
			features: new fields.ArrayField(new fields.SchemaField(BaseFeature.defineSchema())),
			study: new fields.ArrayField(new fields.ObjectField<Study>()),
			cr: new fields.NumberField<selfctrl.Roll, selfctrl.Roll, true, false, true>({ choices: selfctrl.Rolls, initial: selfctrl.Roll.NoCR, nullable: false }),
			cr_adj: new fields.StringField<selfctrl.Adjustment>({
				choices: selfctrl.Adjustments,
				initial: selfctrl.Adjustment.NoCRAdj,
			}),
			study_hours_needed: new fields.StringField<study.Level>({
				choices: study.Levels,
				initial: study.Level.Standard,
			}),
			disabled: new fields.BooleanField({ initial: false }),
			round_down: new fields.BooleanField({ initial: false }),
			can_level: new fields.BooleanField({ initial: false }),
		}
	}
}

interface TraitSystemData
	extends AbstractContainerSystemData<TraitGURPS, TraitSystemSchema>,
	ModelPropsFromSchema<TraitSystemSchema> { }

type TraitSystemSchema = AbstractContainerSystemSchema & {
	type: fields.StringField<ItemType.Trait, ItemType.Trait, true, false, true>
	name: fields.StringField<string, string, true, false, true>
	reference: fields.StringField
	reference_highlight: fields.StringField
	notes: fields.StringField
	vtt_notes: fields.StringField
	userdesc: fields.StringField
	tags: fields.ArrayField<fields.StringField>
	base_points: fields.NumberField<number, number, true, false, true>
	levels: fields.NumberField
	points_per_level: fields.NumberField
	prereqs: fields.SchemaField<PrereqListSchema>
	features: fields.ArrayField<fields.SchemaField<FeatureSchema>>
	study: fields.ArrayField<fields.ObjectField<Study>>
	cr: fields.NumberField<selfctrl.Roll, selfctrl.Roll, true, false, true>
	cr_adj: fields.StringField<selfctrl.Adjustment>
	study_hours_needed: fields.StringField<study.Level>
	disabled: fields.BooleanField
	round_down: fields.BooleanField
	can_level: fields.BooleanField
}

type TraitSystemSource = SourceFromSchema<TraitSystemSchema>

type TraitSource = AbstractContainerSource<ItemType.Trait, TraitSystemSource>

export { getCRFeatures, TraitSystemData }
export type { TraitSource, TraitSystemSource }
