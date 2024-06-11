import {
	AbstractContainerSource,
	AbstractContainerSystemData,
	AbstractContainerSystemSource,
} from "@item/abstract-container/data.ts"
import { ItemType } from "@module/data/constants.ts"
import { TemplatePickerObj } from "@system"

type SpellContainerSource = AbstractContainerSource<ItemType.SpellContainer, SpellContainerSystemSource>

interface SpellContainerSystemSource extends AbstractContainerSystemSource {
	type: ItemType.SpellContainer
	name: string
	reference: string
	reference_highlight: string
	notes: string
	vtt_notes: string
	tags: string[]
	template_picker: TemplatePickerObj
	open: boolean
}

interface SpellContainerSystemData extends SpellContainerSystemSource, AbstractContainerSystemData {}

export type { SpellContainerSource, SpellContainerSystemData, SpellContainerSystemSource }
