import {
	AbstractContainerSource,
	AbstractContainerSystemData,
	AbstractContainerSystemSource,
} from "@item/abstract-container/data.ts"
import { ItemType } from "@module/data/constants.ts"
import { TemplatePickerObj } from "@system"
import { container, selfctrl } from "@util"
import { TraitContainerGURPS } from "./document.ts"
import { ItemSystemSchema } from "@item/base/schema.ts"
import fields = foundry.data.fields

class TraitContainerSystemData extends AbstractContainerSystemData<TraitContainerGURPS, TraitContainerSystemSchema> {
	static override defineSchema(): TraitContainerSystemSchema {

	}
}

interface TraitContainerSystemData
	extends ItemSystemModel<TraitContainerGURPS, TraitContainerSystemSchema>,
	ModelPropsFromSchema<TraitContainerSystemSchema> { }

type TraitContainerSystemSchema = ItemSystemSchema & {
	type: fields.StringField<ItemType.TraitContainer, ItemType.TraitContainer, true, false, true>
	name: fields.StringField<string, string, true, false, true>
	reference: fields.StringField
	reference_highlight: fields.StringField
	notes: fields.StringField
	vtt_notes: fields.StringField
	ancestry: fields.StringField
	userdesc: fields.StringField
	tags: fields.ArrayField<fields.StringField>
	template_picker: TemplatePickerSchema
	cr: fields.NumberField<selfctrl.Roll>
	cr_adj: fields.StringField<selfctrl.Adjustment>
	container_type: fields.StringField<container.Type>
	// features: fields.ArrayField<fields.ObjectField<FeatureObj>>
	disabled: fields.BooleanField
	open: fields.BooleanField
}

// type TraitContainerSource = AbstractContainerSource<ItemType.TraitContainer, TraitContainerSystemSource>

interface TraitContainerSystemSource extends AbstractContainerSystemSource {
	type: ItemType.TraitContainer
	name: string
	reference: string
	reference_highlight: string
	notes: string
	vtt_notes: string
	ancestry: string
	userdesc: string
	tags: string[]
	template_picker: TemplatePickerObj
	cr: selfctrl.Roll
	cr_adj: selfctrl.Adjustment
	container_type: container.Type
	disabled: boolean
	open: boolean
}

interface TraitContainerSystemData extends TraitContainerSystemSource, AbstractContainerSystemData { }

export type { TraitContainerSource, TraitContainerSystemData, TraitContainerSystemSource }
