import { ItemGCS } from "@item/gcs"
import { RitualMagicSpellGURPS } from "@item/ritual_magic_spell"
import { SpellGURPS } from "@item/spell"
import { SpellContainerSource } from "./data"

export class SpellContainerGURPS extends ItemGCS<SpellContainerSource> {
	// Embedded Items
	get children(): Collection<SpellGURPS | RitualMagicSpellGURPS | SpellContainerGURPS> {
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

	protected _getCalcValues(): this["system"]["calc"] {
		return {
			...super._getCalcValues(),
			points: this.adjustedPoints(),
		}
	}
}
