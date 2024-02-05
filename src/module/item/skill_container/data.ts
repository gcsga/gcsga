import { ItemGCSSource, ItemGCSSystemSource } from "@item/gcs/data.ts"
import { ItemType } from "@item/types.ts"

export type SkillContainerSource = ItemGCSSource<ItemType.SkillContainer, SkillContainerSystemSource>

export interface SkillContainerSystemSource extends ItemGCSSystemSource {
	type: ItemType.SkillContainer
	name: string
	reference: string
	reference_highlight: string
	notes: string
	vtt_notes: string
	tags: string[]
	template_picker: TemplatePickerObj
}
