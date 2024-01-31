import { ItemGCSSource, ItemGCSSystemSource } from "@item/gcs/data.ts"
import { ItemType } from "@item/types.ts"

export type TraitModifierContainerSource = ItemGCSSource<
	ItemType.TraitModifierContainer,
	TraitModifierContainerSystemSource
>

export interface TraitModifierContainerData
	extends Omit<TraitModifierContainerSource, "effects" | "items">,
		TraitModifierContainerSystemSource {
	readonly type: TraitModifierContainerSource["type"]
	readonly _source: TraitModifierContainerSource
}

export type TraitModifierContainerSystemSource = ItemGCSSystemSource
