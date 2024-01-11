import { ItemGCS } from "@item/gcs"
import { TraitModifierSource } from "./data"
import { affects, tmcost } from "@util/enum"

export class TraitModifierGURPS extends ItemGCS<TraitModifierSource> {
	prepareBaseData() {
		super.prepareBaseData()
		// HACK: find a way to avoid this
		if (typeof this.system.levels === "string") this.system.levels = parseInt(this.system.levels)
	}

	// Getters
	get levels(): number {
		return this.system.levels
	}

	get secondaryText(): string {
		return this.system.notes
	}

	get costDescription(): string {
		let base = ""
		if (this.costType === "percentage") {
			if (this.isLeveled) {
				base = (this.cost * this.levels).signedString()
			} else {
				base = this.cost.signedString()
			}
			base += "%"
		} else if (this.costType === "points") base = this.cost.signedString()
		else if (this.costType === "multiplier") return `×${this.cost}`
		return base
	}

	get enabled(): boolean {
		return !this.system.disabled
	}

	get costType(): tmcost.Type {
		return this.system.cost_type
	}

	get affects(): affects.Option {
		return this.system.affects
	}

	get cost(): number {
		return this.system.cost
	}

	get costModifier(): number {
		if (this.levels > 0) return this.cost * this.levels
		return this.cost
	}

	get fullDescription(): string {
		let d = ""
		d += this.name
		if (this.secondaryText) d += ` (${this.secondaryText})`
		if (this.actor && this.actor.settings.show_trait_modifier_adj) d += ` [${this.costDescription}]`
		return d
	}

	get isLeveled(): boolean {
		return this.costType === "percentage" && this.levels > 0
	}
}
