import {
	AbstractContainerSource,
	AbstractContainerSystemData,
	AbstractContainerSystemSource,
} from "@item/abstract-container/data.ts"
import { ItemType } from "@module/data/constants.ts"

type TraitModifierContainerSource = AbstractContainerSource<
	ItemType.TraitModifierContainer,
	TraitModifierContainerSystemSource
>

interface TraitModifierContainerSystemSource extends AbstractContainerSystemSource {
	type: ItemType.TraitModifierContainer
	name: string
	reference: string
	reference_highlight: string
	notes: string
	vtt_notes: string
	tags: string[]
	open: boolean
}

interface TraitModifierContainerSystemData extends TraitModifierContainerSystemSource, AbstractContainerSystemData {}

export type { TraitModifierContainerSource, TraitModifierContainerSystemData, TraitModifierContainerSystemSource }
