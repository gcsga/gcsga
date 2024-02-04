import { ActorGURPS } from "@actor/base.ts"
import { ItemGCS } from "@item/gcs/document.ts"
import { TraitModifierGURPS } from "@item/trait_modifier/document.ts"
import { TraitModifierContainerSource, TraitModifierContainerSystemSource } from "./data.ts"

export interface TraitModifierContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
	extends ItemGCS<TParent> {
	readonly _source: TraitModifierContainerSource
	system: TraitModifierContainerSystemSource
}

export class TraitModifierContainerGURPS<
	TParent extends ActorGURPS | null = ActorGURPS | null,
> extends ItemGCS<TParent> {
	// Embedded Items
	override get children(): Collection<TraitModifierGURPS | TraitModifierContainerGURPS> {
		return super.children as Collection<TraitModifierGURPS | TraitModifierContainerGURPS>
	}

	override get enabled(): boolean {
		return true
	}
}
