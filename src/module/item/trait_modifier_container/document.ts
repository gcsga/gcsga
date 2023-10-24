import { ItemGCS } from "@item/gcs"
import { TraitModifierGURPS } from "@item/trait_modifier"
import { TraitModifierContainerData } from "./data"

export class TraitModifierContainerGURPS extends ItemGCS {
	readonly system!: TraitModifierContainerData

	// Embedded Items
	get children(): Collection<TraitModifierGURPS | TraitModifierContainerGURPS> {
		return super.children as Collection<TraitModifierGURPS | TraitModifierContainerGURPS>
	}

	get enabled(): boolean {
		return true
	}
}
