import { ItemGCSSource, ItemGCSSystemSource } from "@item/gcs/data.ts"
import { ItemType } from "@item/types.ts"

export type TraitModifierContainerSource = ItemGCSSource<
	ItemType.TraitModifierContainer,
	TraitModifierContainerSystemSource
>

export interface TraitModifierContainerSystemSource extends ItemGCSSystemSource {
	type: ItemType.TraitModifierContainer
	name: string
	reference: string
	reference_highlight: string
	notes: string
	vtt_notes: string
	tags: string[]
}
