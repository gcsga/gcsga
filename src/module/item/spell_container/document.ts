import { ActorGURPS } from "@actor/document.ts"
import { SpellContainerSystemSource } from "./data.ts"
import { ItemGCS, RitualMagicSpellGURPS, SpellGURPS } from "@item/index.ts"
import { ItemType } from "@item/types.ts"

export interface SpellContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGCS<TParent> {
	system: SpellContainerSystemSource
	type: ItemType.SpellContainer
}
export class SpellContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGCS<TParent> {
	// Embedded Items
	override get children(): Collection<SpellGURPS | RitualMagicSpellGURPS | SpellContainerGURPS> {
		return super.children as Collection<SpellGURPS | RitualMagicSpellGURPS | SpellContainerGURPS>
	}

	adjustedPoints(): number {
		return this.points
	}

	get points(): number {
		let points = 0
		for (const child of this.children) points += child.adjustedPoints()
		return points
	}
}
