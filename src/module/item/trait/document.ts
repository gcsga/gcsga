import { ItemGCS } from "@item/gcs"
import { TraitModifierGURPS } from "@item/trait_modifier"
import { TraitModifierContainerGURPS } from "@item/trait_modifier_container"
import { resolveStudyHours, studyHoursProgressText } from "@util"
import { TraitSource } from "./data"
import { ItemType, sheetSettingsFor } from "@module/data"
import { display, selfctrl } from "@util/enum"
import { StringBuilder } from "@util/string_builder"

export class TraitGURPS extends ItemGCS<TraitSource> {
	unsatisfied_reason = ""

	// Getters
	get formattedName(): string {
		const name: string = this.name ?? ""
		const levels = this.levels
		return `${name}${levels ? ` ${levels}` : ""}`
	}

	secondaryText(optionChecker: (option: display.Option) => boolean): string {
		const buffer = new StringBuilder()
		const settings = sheetSettingsFor(this.actor)
		if (this.system.userdesc !== "" && optionChecker(settings.user_description_display)) {
			buffer.push(this.system.userdesc)
		}
		if (optionChecker(settings.modifiers_display)) buffer.appendToNewLine(this.modifierNotes)
		if (optionChecker(settings.notes_display)) {
			buffer.appendToNewLine(this.notes.trim())
			buffer.appendToNewLine(
				studyHoursProgressText(resolveStudyHours(this.system.study), this.system.study_hours_needed, false)
			)
		}
		return buffer.toString()
	}

	get enabled(): boolean {
		if (this.system.disabled) return false
		let enabled = !this.system.disabled
		if (this.container && this.container.type === ItemType.TraitContainer)
			enabled = enabled && (this.container as any).enabled
		return enabled
	}

	set enabled(enabled: boolean) {
		this.system.disabled = !enabled
	}

	get isLeveled(): boolean {
		return this.system.can_level
	}

	get levels(): number {
		return this.system.levels ?? 0
	}

	get basePoints(): number {
		return this.system.base_points ?? 0
	}

	get pointsPerLevel(): number {
		return this.system.points_per_level ?? 0
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
		return this.system.round_down
	}

	get modifierNotes(): string {
		const buffer = new StringBuilder()
		if (this.CR !== selfctrl.Roll.NoCR) {
			buffer.push(selfctrl.Roll.toString(this.CR))
			if (this.CRAdj !== selfctrl.Adjustment.NoCRAdj) {
				buffer.push(", ")
				buffer.push(selfctrl.Adjustment.description(this.CRAdj, this.CR))
			}
		}
		this.deepModifiers.forEach(mod => {
			if (!mod.enabled) return
			if (buffer.length !== 0) buffer.push("; ")
			buffer.push(mod.fullDescription)
		})
		return buffer.toString()
	}

	adjustedPoints(): number {
		if (!this.enabled) return 0
		let baseEnh = 0
		let levelEnh = 0
		let baseLim = 0
		let levelLim = 0
		let basePoints = this.basePoints
		let pointsPerLevel = this.pointsPerLevel
		let multiplier = selfctrl.Roll.multiplier(this.CR)
		for (const mod of this.deepModifiers) {
			if (!mod.enabled) continue
			const modifier = mod.costModifier
			switch (mod.costType) {
				case "percentage":
					switch (mod.affects) {
						case "total":
							baseLim += modifier
							levelLim += modifier
							continue
						case "base_only":
							baseLim += modifier
							continue
						case "levels_only":
							levelLim += modifier
							continue
					}
				case "points":
					if (mod.affects === "levels_only") pointsPerLevel += modifier
					else basePoints += modifier
					continue
				case "multiplier":
					multiplier *= modifier
			}
		}
		let modifiedBasePoints = basePoints
		let leveledPoints = pointsPerLevel * this.levels
		if (baseEnh !== 0 || baseLim !== 0 || levelEnh !== 0 || levelLim !== 0) {
			if (this.actor?.settings.use_multiplicative_modifiers) {
				if (baseEnh === levelEnh && baseLim === levelLim) {
					modifiedBasePoints = TraitGURPS.modifyPoints(
						TraitGURPS.modifyPoints(modifiedBasePoints + leveledPoints, baseEnh),
						Math.max(-80, baseLim)
					)
				} else {
					modifiedBasePoints =
						TraitGURPS.modifyPoints(
							TraitGURPS.modifyPoints(modifiedBasePoints, baseEnh),
							Math.max(-80, baseLim)
						) +
						TraitGURPS.modifyPoints(
							TraitGURPS.modifyPoints(leveledPoints, levelEnh),
							Math.max(-80, levelLim)
						)
				}
			} else {
				let baseMod = Math.max(-80, baseEnh + baseLim)
				let levelMod = Math.max(-80, levelEnh + levelLim)
				if (baseMod === levelMod) {
					modifiedBasePoints = TraitGURPS.modifyPoints(modifiedBasePoints + leveledPoints, baseMod)
				} else {
					modifiedBasePoints =
						TraitGURPS.modifyPoints(modifiedBasePoints, baseMod) +
						TraitGURPS.modifyPoints(leveledPoints, levelMod)
				}
			}
		} else {
			modifiedBasePoints += leveledPoints
		}
		if (this.roundCostDown) return Math.floor(modifiedBasePoints * multiplier)
		else return Math.ceil(modifiedBasePoints * multiplier)
	}

	// Embedded Items
	get modifiers(): Collection<TraitModifierGURPS | TraitModifierContainerGURPS> {
		return new Collection(
			this.items
				.filter(item => item instanceof TraitModifierGURPS || item instanceof TraitModifierContainerGURPS)
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

	calculatePoints(): [number, number, number, number] {
		if (!this.enabled) return [0, 0, 0, 0]
		let [ad, disad, race, quirk] = [0, 0, 0, 0]
		let pts = this.adjustedPoints()
		if (pts === -1) quirk += pts
		else if (pts > 0) ad += pts
		else if (pts < 0) disad += pts
		return [ad, disad, race, quirk]
	}

	toggleState(): void {
		this.enabled = !this.enabled
	}

	static modifyPoints(points: number, modifier: number): number {
		return points + TraitGURPS.calculateModifierPoints(points, modifier)
	}

	static calculateModifierPoints(points: number, modifier: number): number {
		return (points * modifier) / 100
	}

}
