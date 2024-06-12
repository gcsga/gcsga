import {
	AbstractContainerSource,
	AbstractContainerSystemData,
	AbstractContainerSystemSource,
} from "@item/abstract-container/data.ts"
import { ItemType } from "@module/data/constants.ts"
import { TemplatePickerObj } from "@system"
import { container, selfctrl } from "@util"

type TraitContainerSource = AbstractContainerSource<ItemType.TraitContainer, TraitContainerSystemSource>

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

interface TraitContainerSystemData extends TraitContainerSystemSource, AbstractContainerSystemData {}

export type { TraitContainerSource, TraitContainerSystemData, TraitContainerSystemSource }
