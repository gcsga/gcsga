import { ItemType } from "@data"
import { BaseContainerSource } from "@item/container/data.ts"
import { ItemGCSSystemSource } from "@item/gcs/data.ts"
import { TemplatePickerObj } from "@sytem/template_picker/document.ts"
import { container, selfctrl } from "@util/enum/index.ts"

export type TraitContainerSource = BaseContainerSource<ItemType.TraitContainer, TraitContainerSystemSource>

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
