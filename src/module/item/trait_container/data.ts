import { ItemGCSSource, ItemGCSSystemSource } from "@item/gcs/data.ts"
import { ItemType } from "@item/types.ts"
import { container, selfctrl } from "@util/enum/index.ts"

export type TraitContainerSource = ItemGCSSource<ItemType.TraitContainer, TraitContainerSystemSource>

export interface TraitContainerSystemSource extends ItemGCSSystemSource {
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
}
