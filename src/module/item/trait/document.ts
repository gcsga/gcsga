import { ActorGURPS } from "@actor/base.ts"
import { ItemGCS } from "@item/gcs/document.ts"
import { TraitSource, TraitSystemSource } from "./data.ts"
import { display } from "@util/enum/display.ts"
import { StringBuilder } from "@util/string_builder.ts"
import { sheetSettingsFor } from "@module/data/sheet_settings.ts"
import { resolveStudyHours, studyHoursProgressText } from "@util/study.ts"
import { selfctrl } from "@util/enum/selfctrl.ts"
import { TraitModifierGURPS } from "@item/trait_modifier/document.ts"
import { TraitModifierContainerGURPS } from "@item/trait_modifier_container/document.ts"
import { ItemType } from "@item/types.ts"
import { CharacterGURPS } from "@actor"
import { CharacterResolver } from "@util"
import { study } from "@util/enum/study.ts"

export interface TraitGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGCS<TParent> {
	readonly _source: TraitSource
	system: TraitSystemSource
}

export class TraitGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGCS<TParent> {
	// unsatisfied_reason = ""

	// Getters
	override get formattedName(): string {
		const name: string = this.name ?? ""
		const levels = this.levels
		return `${name}${levels ? ` ${levels}` : ""}`
	}

	override secondaryText(optionChecker: (option: display.Option) => boolean): string {
		const buffer = new StringBuilder()
		const settings = sheetSettingsFor(this.actor as CharacterGURPS)
		if (this.system.userdesc !== "" && optionChecker(settings.user_description_display)) {
			buffer.push(this.system.userdesc)
		}
		if (optionChecker(settings.modifiers_display)) buffer.appendToNewLine(this.modifierNotes)
		if (optionChecker(settings.notes_display)) {
			buffer.appendToNewLine(this.notes.trim())
			buffer.appendToNewLine(
				studyHoursProgressText(resolveStudyHours(this.system.study), this.system.study_hours_needed, false),
			)
		}
		return buffer.toString()
	}

	override get enabled(): boolean {
		if (this.system.disabled) return false
		let enabled = !this.system.disabled
		if (this.container instanceof ItemGCS && this.container.type === ItemType.TraitContainer)
			enabled = enabled && this.container.enabled
		return enabled
	}

	override set enabled(enabled: boolean) {
		this.system.disabled = !enabled
	}

	override get isLeveled(): boolean {
		return this.system.can_level
	}

	override get levels(): number {
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
		const baseEnh = 0
		const levelEnh = 0
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
							break
						case "base_only":
							baseLim += modifier
							break
						case "levels_only":
							levelLim += modifier
							break
					}
					break
				case "points":
					if (mod.affects === "levels_only") pointsPerLevel += modifier
					else basePoints += modifier
					continue
				case "multiplier":
					multiplier *= modifier
			}
		}
		let modifiedBasePoints = basePoints
		const leveledPoints = pointsPerLevel * this.levels
		if (baseEnh !== 0 || baseLim !== 0 || levelEnh !== 0 || levelLim !== 0) {
			if ((this.actor as unknown as CharacterResolver).settings.use_multiplicative_modifiers) {
				if (baseEnh === levelEnh && baseLim === levelLim) {
					modifiedBasePoints = TraitGURPS.modifyPoints(
						TraitGURPS.modifyPoints(modifiedBasePoints + leveledPoints, baseEnh),
						Math.max(-80, baseLim),
					)
				} else {
					modifiedBasePoints =
						TraitGURPS.modifyPoints(
							TraitGURPS.modifyPoints(modifiedBasePoints, baseEnh),
							Math.max(-80, baseLim),
						) +
						TraitGURPS.modifyPoints(
							TraitGURPS.modifyPoints(leveledPoints, levelEnh),
							Math.max(-80, levelLim),
						)
				}
			} else {
				const baseMod = Math.max(-80, baseEnh + baseLim)
				const levelMod = Math.max(-80, levelEnh + levelLim)
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
	override get modifiers(): Collection<TraitModifierGURPS | TraitModifierContainerGURPS> {
		return new Collection(
			this.items
				.filter(item => item instanceof TraitModifierGURPS || item instanceof TraitModifierContainerGURPS)
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

	calculatePoints(): [number, number, number, number] {
		if (!this.enabled) return [0, 0, 0, 0]
		// eslint-disable-next-line prefer-const
		let [ad, disad, race, quirk] = [0, 0, 0, 0]
		const pts = this.adjustedPoints()
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

	get studyHours(): number {
		return resolveStudyHours(this.system.study ?? [])
	}

	get studyHoursNeeded(): string {
		const system = this.system
		if (system.study_hours_needed === "") return study.Level.Standard
		return system.study_hours_needed
	}
}
