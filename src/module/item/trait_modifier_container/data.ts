import { ItemType } from "@data"
import { BaseContainerSource } from "@item/container/data.ts"
import { ItemGCSSystemSource } from "@item/gcs/data.ts"

export type TraitModifierContainerSource = BaseContainerSource<
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
