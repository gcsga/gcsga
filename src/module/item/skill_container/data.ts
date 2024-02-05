import { ItemType } from "@data"
import { BaseContainerSource } from "@item/container/data.ts"
import { ItemGCSSystemSource } from "@item/gcs/data.ts"
import { TemplatePickerObj } from "@sytem/template_picker/document.ts"

export type SkillContainerSource = BaseContainerSource<ItemType.SkillContainer, SkillContainerSystemSource>

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
