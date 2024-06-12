import {
	AbstractContainerSource,
	AbstractContainerSystemData,
	AbstractContainerSystemSource,
} from "@item/abstract-container/data.ts"
import { ItemType } from "@module/data/constants.ts"
import { TemplatePickerObj } from "@system"

type SkillContainerSource = AbstractContainerSource<ItemType.SkillContainer, SkillContainerSystemSource>

interface SkillContainerSystemSource extends AbstractContainerSystemSource {
	type: ItemType.SkillContainer
	name: string
	reference: string
	reference_highlight: string
	notes: string
	vtt_notes: string
	tags: string[]
	template_picker: TemplatePickerObj
	open: boolean
}

interface SkillContainerSystemData extends SkillContainerSystemSource, AbstractContainerSystemData {}

export type { SkillContainerSource, SkillContainerSystemData, SkillContainerSystemSource }
