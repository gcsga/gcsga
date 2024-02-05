import { ItemGCSSource, ItemGCSSystemSource } from "@item/gcs/data.ts"
import { ItemType } from "@item/types.ts"

export type SpellContainerSource = ItemGCSSource<ItemType.SpellContainer, SpellContainerSystemSource>

export interface SpellContainerSystemSource extends ItemGCSSystemSource {
	type: ItemType.SpellContainer
	name: string
	reference: string
	reference_highlight: string
	notes: string
	vtt_notes: string
	tags: string[]
	template_picker: TemplatePickerObj
}
