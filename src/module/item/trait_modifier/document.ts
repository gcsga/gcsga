import { ActorGURPS } from "@actor/base.ts"
import { ItemGCS } from "@item/gcs/document.ts"
import { TraitModifierSource, TraitModifierSystemSource } from "./data.ts"
import { display } from "@util/enum/display.ts"
import { sheetSettingsFor } from "@module/data/sheet_settings.ts"
import { tmcost } from "@util/enum/tmcost.ts"
import { affects } from "@util/enum/affects.ts"
import { StringBuilder } from "@util/string_builder.ts"
import { CharacterGURPS } from "@actor"

export interface TraitModifierGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGCS<TParent> {
	readonly _source: TraitModifierSource
	system: TraitModifierSystemSource
}

export class TraitModifierGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGCS<TParent> {
	override prepareBaseData(): void {
		super.prepareBaseData()
		// HACK: find a way to avoid this
		if (typeof this.system.levels === "string") this.system.levels = parseInt(this.system.levels)
	}

	// Getters
	override get levels(): number {
		return this.system.levels
	}

	override secondaryText(optionChecker: (option: display.Option) => boolean): string {
		if (optionChecker(sheetSettingsFor(this.actor as CharacterGURPS).notes_display)) return this.localNotes
		return ""
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

	override get enabled(): boolean {
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
		if (sheetSettingsFor(this.actor as CharacterGURPS).show_trait_modifier_adj)
			buffer.push(` [${this.costDescription}]`)
		return buffer.toString()
	}

	override get isLeveled(): boolean {
		return this.costType === tmcost.Type.Percentage && this.levels > 0
	}
}
