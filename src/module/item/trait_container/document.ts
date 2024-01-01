import { ItemGCS } from "@item/gcs"
import { TraitGURPS } from "@item/trait"
import { TraitModifierGURPS } from "@item/trait_modifier"
import { TraitModifierContainerGURPS } from "@item/trait_modifier_container"
import { TraitContainerSource, TraitContainerType } from "./data"
import { selfctrl } from "@util/enum"

export class TraitContainerGURPS extends ItemGCS<TraitContainerSource> {
	unsatisfied_reason = ""

	// Getters
	get enabled(): boolean {
		if (this.system.disabled) return false
		let enabled = !this.system.disabled
		if (this.container instanceof TraitContainerGURPS) enabled = enabled && this.container.enabled
		return enabled
	}

	set enabled(enabled: boolean) {
		this.system.disabled = !enabled
	}

	get containerType(): TraitContainerType {
		return this.system.container_type
	}

	get isLeveled(): boolean {
		return false
	}

	get levels(): number {
		return 0
	}

	get skillLevel(): number {
		return this.CR
	}

	get CR(): selfctrl.Roll {
		return this.system.cr
	}

	get CRAdj(): selfctrl.Adjustment {
		return this.system.cr_adj
	}

	get roundCostDown(): boolean {
		return false
	}

	get modifierNotes(): string {
		let buffer = ""
		if (this.CR !== selfctrl.Roll.NoCR) {
			buffer += selfctrl.Roll.toString(this.CR)
			if (this.CRAdj !== selfctrl.Adjustment.NoCRAdj) {
				buffer += ", "
				buffer += selfctrl.Adjustment.description(this.CRAdj, this.CR)
			}
		}
		this.deepModifiers.forEach(mod => {
			if (!mod.enabled) return
			if (buffer.length !== 0) buffer += "; "
			buffer += mod.fullDescription
		})
		return buffer
	}

	// Embedded Items
	get children(): Collection<TraitGURPS | TraitContainerGURPS> {
		return super.children as Collection<TraitGURPS | TraitContainerGURPS>
	}

	get modifiers(): Collection<TraitModifierGURPS | TraitModifierContainerGURPS> {
		return new Collection(
			this.items
				.filter(item => item instanceof TraitModifierGURPS)
				.map(item => {
					return [item.id!, item]
				})
		) as Collection<TraitModifierGURPS>
	}

	get deepModifiers(): Collection<TraitModifierGURPS> {
		const deepModifiers: Array<TraitModifierGURPS> = []
		for (const mod of this.modifiers) {
			if (mod instanceof TraitModifierGURPS) deepModifiers.push(mod)
			else
				for (const e of mod.deepItems) {
					if (e instanceof TraitModifierGURPS) deepModifiers.push(e)
				}
		}
		return new Collection(
			deepModifiers.map(item => {
				return [item.id!, item]
			})
		)
	}

	adjustedPoints(): number {
		if (!this.enabled) return 0
		let points = 0
		if (this.containerType === TraitContainerType.AlternativeAbilities) {
			let values: number[] = []
			for (const child of this.children) {
				values.push(child.adjustedPoints())
				if (values[values.length - 1] > points) points = values[values.length - 1]
			}
			let max = points
			let found = false
			for (let v of values) {
				if (!found && max === v) found = true
				else if (this.roundCostDown) points += Math.floor(TraitGURPS.calculateModifierPoints(v, 20))
				else points += Math.ceil(TraitGURPS.calculateModifierPoints(v, 20))
			}
		} else {
			for (const child of this.children) {
				points += child.adjustedPoints()
			}
		}
		return points
	}

	calculatePoints(): [number, number, number, number] {
		let [ad, disad, race, quirk] = [0, 0, 0, 0]
		switch (this.containerType) {
			case TraitContainerType.Group:
				for (const child of this.children) {
					const [a, d, r, q] = child.calculatePoints()
					ad += a
					disad += d
					race += r
					quirk += q
				}
				return [ad, disad, race, quirk]
			case TraitContainerType.Ancestry: {
				return [0, 0, this.adjustedPoints(), 0]
			}
		}
		let pts = this.adjustedPoints()
		if (pts === -1) quirk += pts
		else if (pts > 0) ad += pts
		else if (pts < 0) disad += pts
		return [ad, disad, race, quirk]
	}

	toggleState(): void {
		this.enabled = !this.enabled
	}

	protected _getCalcValues(): this["system"]["calc"] {
		return {
			...super._getCalcValues(),
			enabled: this.enabled,
			points: this.adjustedPoints(),
		}
	}
}
