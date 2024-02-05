import { ItemGCS } from "@item/gcs/document.ts"
import { TraitContainerSource, TraitContainerSystemSource } from "./data.ts"
import { selfctrl } from "@util/enum/selfctrl.ts"
import { TraitGURPS } from "@item/trait/document.ts"
import { TraitModifierGURPS } from "@item/trait_modifier/document.ts"
import { TraitModifierContainerGURPS } from "@item"
import { ActorGURPS } from "@actor"
import { container } from "@util/enum/container.ts"
import { ItemType } from "@data"

export interface TraitContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGCS<TParent> {
	readonly _source: TraitContainerSource
	system: TraitContainerSystemSource

	type: ItemType.TraitContainer
}

export class TraitContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGCS<TParent> {
	// Getters
	override get enabled(): boolean {
		if (this.system.disabled) return false
		let enabled = !this.system.disabled
		if (this.container instanceof TraitContainerGURPS) enabled = enabled && this.container.enabled
		return enabled
	}

	override set enabled(enabled: boolean) {
		this.system.disabled = !enabled
	}

	get containerType(): container.Type {
		return this.system.container_type
	}

	override get isLeveled(): boolean {
		return false
	}

	override get levels(): number {
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
	override get children(): Collection<TraitGURPS | TraitContainerGURPS> {
		return super.children as Collection<TraitGURPS | TraitContainerGURPS>
	}

	override get modifiers(): Collection<TraitModifierGURPS | TraitModifierContainerGURPS> {
		return new Collection(
			this.items
				.filter(item => item instanceof TraitModifierGURPS)
				.map(item => {
					return [item.id!, item]
				}),
		) as Collection<TraitModifierGURPS | TraitModifierContainerGURPS>
	}

	get deepModifiers(): Collection<TraitModifierGURPS> {
		const deepModifiers: TraitModifierGURPS[] = []
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
			}),
		)
	}

	adjustedPoints(): number {
		if (!this.enabled) return 0
		let points = 0
		if (this.containerType === container.Type.AlternativeAbilities) {
			const values: number[] = []
			for (const child of this.children) {
				values.push(child.adjustedPoints())
				if (values[values.length - 1] > points) points = values[values.length - 1]
			}
			const max = points
			let found = false
			for (const v of values) {
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
			case container.Type.Group:
				for (const child of this.children) {
					const [a, d, r, q] = child.calculatePoints()
					ad += a
					disad += d
					race += r
					quirk += q
				}
				return [ad, disad, race, quirk]
			case container.Type.Ancestry: {
				return [0, 0, this.adjustedPoints(), 0]
			}
		}
		const pts = this.adjustedPoints()
		if (pts === -1) quirk += pts
		else if (pts > 0) ad += pts
		else if (pts < 0) disad += pts
		return [ad, disad, race, quirk]
	}

	toggleState(): void {
		this.enabled = !this.enabled
	}
}
