import { ItemType, NumericCompareType } from "@module/data/constants.ts"
import { BasePrereq, Prereq, TemplatePicker, TemplatePickerSchema } from "@system"
import { container, prereq, selfctrl } from "@util"
import { TraitContainerGURPS } from "./document.ts"
import fields = foundry.data.fields
import {
	AbstractContainerSource,
	AbstractContainerSystemData,
	AbstractContainerSystemSchema,
} from "@item/abstract-container/data.ts"
import { RecordField } from "@system/schema-data-fields.ts"

class TraitContainerSystemData extends AbstractContainerSystemData<TraitContainerGURPS, TraitContainerSystemSchema> {
	static override defineSchema(): TraitContainerSystemSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({ required: true, initial: ItemType.TraitContainer }),
			name: new fields.StringField({
				required: true,
			}),
			reference: new fields.StringField(),
			reference_highlight: new fields.StringField(),
			notes: new fields.StringField(),
			vtt_notes: new fields.StringField(),
			ancestry: new fields.StringField(),
			userdesc: new fields.StringField(),
			tags: new fields.ArrayField(new foundry.data.fields.StringField()),
			template_picker: new fields.SchemaField(TemplatePicker.defineSchema()),
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
			cr: new fields.NumberField<selfctrl.Roll, selfctrl.Roll, true, false, true>({
				choices: selfctrl.Rolls,
				initial: selfctrl.Roll.NoCR,
				nullable: false,
			}),
			cr_adj: new fields.StringField<selfctrl.Adjustment>({
				choices: selfctrl.Adjustments,
				initial: selfctrl.Adjustment.NoCRAdj,
			}),
			container_type: new fields.StringField<container.Type>({
				choices: container.Types,
				initial: container.Type.Group,
			}),
			disabled: new fields.BooleanField({ initial: false }),
			open: new fields.BooleanField({ initial: true }),
			replacements: new RecordField(
				new fields.StringField({ required: true, nullable: false }),
				new fields.StringField({ required: true, nullable: false }),
			),
		}
	}
}

interface TraitContainerSystemData
	extends AbstractContainerSystemData<TraitContainerGURPS, TraitContainerSystemSchema>,
		ModelPropsFromSchema<TraitContainerSystemSchema> {}

type TraitContainerSystemSchema = AbstractContainerSystemSchema & {
	type: fields.StringField<ItemType.TraitContainer, ItemType.TraitContainer, true, false, true>
	name: fields.StringField<string, string, true, false, true>
	reference: fields.StringField
	reference_highlight: fields.StringField
	notes: fields.StringField
	vtt_notes: fields.StringField
	ancestry: fields.StringField
	userdesc: fields.StringField
	tags: fields.ArrayField<fields.StringField>
	template_picker: fields.SchemaField<TemplatePickerSchema>
	prereqs: fields.ArrayField<fields.TypedSchemaField<Record<prereq.Type, ConstructorOf<Prereq>>>>
	cr: fields.NumberField<selfctrl.Roll, selfctrl.Roll, true, false, true>
	cr_adj: fields.StringField<selfctrl.Adjustment>
	container_type: fields.StringField<container.Type>
	disabled: fields.BooleanField
	open: fields.BooleanField
	replacements: RecordField<
		fields.StringField<string, string, true, false, false>,
		fields.StringField<string, string, true, false, false>
	>
}

type TraitContainerSystemSource = SourceFromSchema<TraitContainerSystemSchema>

type TraitContainerSource = AbstractContainerSource<ItemType.TraitContainer, TraitContainerSystemSource>

export type { TraitContainerSource, TraitContainerSystemSource }
export { TraitContainerSystemData }
