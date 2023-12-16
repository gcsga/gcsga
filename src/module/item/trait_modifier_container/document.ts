import { ItemGCS } from "@item/gcs"
import { TraitModifierGURPS } from "@item/trait_modifier"
import { TraitModifierContainerSource } from "./data"

export class TraitModifierContainerGURPS extends ItemGCS<TraitModifierContainerSource> {
	// Embedded Items
	get children(): Collection<TraitModifierGURPS | TraitModifierContainerGURPS> {
		return super.children as Collection<TraitModifierGURPS | TraitModifierContainerGURPS>
	}

	get enabled(): boolean {
		return true
	}
}
