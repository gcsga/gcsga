import { ActorGURPS } from "@actor/document.ts"
import { SpellContainerSystemData } from "./data.ts"
import { ItemGCS, RitualMagicSpellGURPS, SpellGURPS } from "@item/index.ts"

export interface SpellContainerGURPS<TParent extends ActorGURPS = ActorGURPS> extends ItemGCS<TParent> {
	system: SpellContainerSystemData
}
export class SpellContainerGURPS<TParent extends ActorGURPS = ActorGURPS> extends ItemGCS<TParent> {
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
