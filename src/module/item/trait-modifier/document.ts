import { ActorGURPS } from "@actor"
import { ItemGURPS } from "@item"
import { TraitModifierSource, TraitModifierSystemData } from "./data.ts"
import { StringBuilder, affects, display, tmcost } from "@util"
import { sheetSettingsFor } from "@module/data/sheet-settings.ts"

class TraitModifierGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGURPS<TParent> {
	override secondaryText(optionChecker: (option: display.Option) => boolean): string {
		if (optionChecker(sheetSettingsFor(this.actor).notes_display)) return this.localNotes
		return ""
	}

	get levels(): number {
		return this.system.levels
	}

	get costDescription(): string {
		let base = ""
		if (this.costType === tmcost.Type.Percentage) {
			if (this.isLeveled) {
				base = (this.cost * this.levels).signedString()
			} else {
				base = this.cost.signedString()
			}
			base += "%"
		} else if (this.costType === tmcost.Type.Points) base = this.cost.signedString()
		else if (this.costType === tmcost.Type.Multiplier) return `×${this.cost}`
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
		const buffer = new StringBuilder()
		buffer.push(this.formattedName)
		if (this.localNotes !== "") buffer.push(` (${this.localNotes})`)
		if (sheetSettingsFor(this.actor).show_trait_modifier_adj) buffer.push(` [${this.costDescription}]`)
		return buffer.toString()
	}

	get isLeveled(): boolean {
		return this.costType === tmcost.Type.Percentage && this.levels > 0
	}
}

interface TraitModifierGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGURPS<TParent> {
	readonly _source: TraitModifierSource
	system: TraitModifierSystemData
}

export { TraitModifierGURPS }
