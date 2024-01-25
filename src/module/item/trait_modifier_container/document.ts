import { ActorGURPS } from "@actor/base.ts"
import { ItemGCS } from "@item/gcs/document.ts"
import { TraitModifierGURPS } from "@item/trait_modifier/document.ts"

export class TraitModifierContainerGURPS<TParent extends ActorGURPS = ActorGURPS> extends ItemGCS<TParent> {
	// Embedded Items
	override get children(): Collection<TraitModifierGURPS | TraitModifierContainerGURPS> {
		return super.children as Collection<TraitModifierGURPS | TraitModifierContainerGURPS>
	}

	override get enabled(): boolean {
		return true
	}
}
