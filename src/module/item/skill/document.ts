import { ItemGCS } from "@item/gcs"
import { gid, sheetSettingsFor } from "@module/data"
import { SkillDefault } from "@module/default"
import { TooltipGURPS } from "@module/tooltip"
import { LocalizeGURPS, NewLineRegex, resolveStudyHours, studyHoursProgressText } from "@util"
import { SkillLevel, SkillSource } from "./data"
import { DocumentModificationOptions } from "types/foundry/common/abstract/document.mjs"
import { difficulty, display } from "@util/enum"
import { StringBuilder } from "@util/string_builder"

export class SkillGURPS extends ItemGCS<SkillSource> {
	level: SkillLevel = { level: 0, relative_level: 0, tooltip: new TooltipGURPS() }

	unsatisfied_reason = ""

	// Getters
	get formattedName(): string {
		const name: string = this.name ?? ""
		const specialization = this.specialization
		const TL = this.techLevel
		return `${name}${this.system.tech_level_required ? `/TL${TL ?? ""}` : ""}${specialization ? ` (${specialization})` : ""
			}`
	}

	secondaryText(optionChecker: (option: display.Option) => boolean): string {
		const buffer = new StringBuilder()
		const settings = sheetSettingsFor(this.actor)
		if (optionChecker(settings.modifiers_display)) {
			const text = this.modifierNotes
			if ((text?.trim() ?? "") !== "") buffer.push(text)
		}
		if (optionChecker(settings.notes_display)) {
			buffer.appendToNewLine(this.notes.trim())
			buffer.appendToNewLine(
				studyHoursProgressText(resolveStudyHours(this.system.study), this.system.study_hours_needed, false)
			)
		}
		if (optionChecker(settings.skill_level_adj_display)) {
			if (
				this.level.tooltip.length !== 0 &&
				!this.level.tooltip.includes(LocalizeGURPS.translations.gurps.common.no_additional_modifiers)
			) {
				let levelTooltip = this.level.tooltip.string.trim().replaceAll(NewLineRegex, ", ")
				const msg = LocalizeGURPS.translations.gurps.common.includes_modifiers_from
				if (levelTooltip.startsWith(`${msg},`)) levelTooltip = `${msg}:${levelTooltip.slice(msg.length + 1)}`
				buffer.appendToNewLine(levelTooltip)
			}
		}
		return buffer.toString()
	}

	get modifierNotes(): string {
		if (this.difficulty !== difficulty.Level.Wildcard) {
			const defSkill = this.defaultSkill
			if (defSkill && this.defaultedFrom) {
				return LocalizeGURPS.format(LocalizeGURPS.translations.gurps.item.default, {
					skill: defSkill.formattedName,
					modifier: this.defaultedFrom.modifier.signedString(),
				})
			}
		}
		return ""
	}

	get points(): number {
		// console.log(this)
		return this.system.points
	}

	set points(n: number) {
		this.system.points = n
	}

	get techLevel(): string {
		return this.system.tech_level
	}

	get attribute(): string {
		return this.system.difficulty?.split("/")[0] ?? gid.Dexterity
	}

	get difficulty(): difficulty.Level {
		return difficulty.Level.extractLevel(this.system.difficulty?.split("/")[1])
	}

	get specialization(): string {
		return this.system.specialization
	}

	get defaultSkill(): SkillGURPS | undefined {
		if (!this.actor) return undefined
		// console.log(this)
		return this.actor.baseSkill(this.defaultedFrom, true)
	}

	get defaultedFrom(): SkillDefault | null {
		return this.system.defaulted_from ?? null
	}

	set defaultedFrom(v: SkillDefault | null) {
		this.system.defaulted_from = v
	}

	get defaults(): SkillDefault[] {
		if (this.system.hasOwnProperty("defaults")) {
			const defaults: SkillDefault[] = []
			const list = (this.system as any).defaults
			for (const f of list ?? []) {
				defaults.push(new SkillDefault(f))
			}
			return defaults
		}
		return []
	}

	get encumbrancePenaltyMultiplier(): number {
		return this.system.encumbrance_penalty_multiplier
	}

	get effectiveLevel(): number {
		const actor = this.actor || this.dummyActor
		if (!actor) return -Infinity
		let att = actor.resolveAttributeCurrent(this.attribute)
		let effectiveAtt = actor.resolveAttributeEffective(this.attribute)
		return this.calculateLevel().level - att + effectiveAtt
	}

	// Point & Level Manipulation
	calculateLevel(): SkillLevel {
		const none = { level: -Infinity, relative_level: 0, tooltip: new TooltipGURPS() }
		const actor = this.actor || this.dummyActor
		if (!actor) return none
		let relativeLevel = difficulty.Level.baseRelativeLevel(this.difficulty)
		let level = actor.resolveAttributeCurrent(this.attribute)
		const tooltip = new TooltipGURPS()
		let points = this.adjustedPoints(tooltip)
		const def = this.defaultedFrom
		if (level === -Infinity) return none
		if (actor.settings.use_half_stat_defaults) {
			level = Math.trunc(level / 2) + 5
		}
		if (this.difficulty === difficulty.Level.Wildcard) points /= 3
		else if (def && def.points > 0) points += def.points
		points = Math.trunc(points)

		switch (true) {
			case points === 1:
				// relativeLevel is preset to this point value
				break
			case points > 1 && points < 4:
				relativeLevel += 1
				break
			case points >= 4:
				relativeLevel += 1 + Math.floor(points / 4)
				break
			case this.difficulty !== difficulty.Level.Wildcard && def && def.points < 0:
				relativeLevel = def!.adjustedLevel - level
				break
			default:
				level = -Infinity
				relativeLevel = 0
		}

		if (level === -Infinity) return none
		level += relativeLevel
		if (this.difficulty !== difficulty.Level.Wildcard && def && level < def.adjustedLevel) {
			level = def.adjustedLevel
		}
		let bonus = actor.skillBonusFor(this.name!, this.specialization, this.tags, tooltip)
		const encumbrancePenalty = actor.encumbranceLevel(true).penalty * this.encumbrancePenaltyMultiplier
		level += bonus + encumbrancePenalty
		relativeLevel += bonus + encumbrancePenalty
		if (bonus !== 0) {
			tooltip.push("TO DO")
		}
		return {
			level: level,
			relative_level: relativeLevel,
			tooltip: tooltip,
		}
	}

	adjustedPoints(tooltip?: TooltipGURPS): number {
		let points = this.points
		if (this.actor) {
			points += this.actor.skillPointBonusFor(this.name!, this.specialization, this.tags, tooltip)
			// Points += this.actor.bonusFor(`skills.points/${this.name}`, tooltip)
			points = Math.max(points, 0)
		}
		return points
	}

	get skillLevel(): string {
		if (this.effectiveLevel === -Infinity) return "-"
		return this.effectiveLevel.toString()
	}

	get relativeLevel(): string {
		const level = this.calculateLevel()
		if (level.level === -Infinity) return "-"
		return (
			(this.actor?.attributes?.get(this.attribute)?.attribute_def.name ?? "") +
			level.relative_level.signedString()
		)
	}

	updateLevel(): boolean {
		const saved = this.level
		this.defaultedFrom = this.bestDefaultWithPoints()
		this.level = this.calculateLevel()
		return saved.level !== this.level.level
	}

	bestDefaultWithPoints(_excluded?: SkillDefault): SkillDefault | null {
		const actor = this.actor || this.dummyActor
		if (!actor) return null
		const best = this.bestDefault()
		if (best) {
			const baseline =
				actor.resolveAttributeCurrent(this.attribute) + difficulty.Level.baseRelativeLevel(this.difficulty)
			const level = best.level
			best.adjusted_level = level
			if (level === baseline) best.points = 1
			else if (level === baseline + 1) best.points = 2
			else if (level > baseline + 1) best.points = 4 * (level - (baseline + 1))
			else best.points = -Math.max(level, 0)
		}
		return best ?? null
	}

	bestDefault(excluded?: SkillDefault): SkillDefault | undefined {
		const actor = this.actor || this.dummyActor
		if (!actor || !this.defaults) return
		const excludes = new Map()
		excludes.set(this.name!, true)
		let bestDef = new SkillDefault()
		let best = -Infinity
		for (const def of this.resolveToSpecificDefaults()) {
			if (def.equivalent(excluded) || this.inDefaultChain(def, new Map())) continue
			let level = this.calcSkillDefaultLevel(def, excludes)
			if (best < level) {
				best = level
				bestDef = def.noLevelOrPoints
				bestDef.level = level
			}
		}
		return bestDef
	}

	calcSkillDefaultLevel(def: SkillDefault, excludes: Map<string, boolean>): number {
		const actor = this.actor || this.dummyActor
		let level = def.skillLevel(actor!, true, excludes, this.type.startsWith("skill"))
		if (def.skillBased) {
			const other = actor?.bestSkillNamed(def.name!, def.specialization!, true, excludes)
			if (other) {
				level -= actor!.skillBonusFor(def.name!, def.specialization!, this.tags, undefined)
			}
		}
		return level
	}

	resolveToSpecificDefaults(): SkillDefault[] {
		const result: SkillDefault[] = []
		for (const def of this.defaults) {
			if (!this.actor || !def || !def.skillBased) {
				result.push(def)
			} else {
				const m: Map<string, boolean> = new Map()
				m.set(this.formattedName, true)
				for (const s of this.actor.skillNamed(def.name!, def.specialization!, true, m)) {
					const local = new SkillDefault(duplicate(def))
					local.specialization = s.specialization
					result.push(local)
				}
			}
		}
		return result
	}

	equivalent(def: SkillDefault, other: SkillDefault | null): boolean {
		return (
			other !== null &&
			def.type === other.type &&
			def.modifier === other.modifier &&
			def.name === other.name &&
			def.specialization === other.specialization
		)
	}

	inDefaultChain(def: SkillDefault | null, lookedAt: Map<string, boolean>): boolean {
		if (!this.actor || !def || !def.name) return false
		let hadOne = false
		for (const one of (this.actor.skills as Collection<SkillGURPS>).filter(
			s => s.name === def.name && s.specialization === def.specialization
		)) {
			if (one === this) return true
			if (typeof one.id === "string" && lookedAt.get(one.id)) {
				lookedAt.set(one.id, true)
				if (this.inDefaultChain(one.defaultedFrom, lookedAt)) return true
			}
			hadOne = true
		}
		return !hadOne
	}

	setLevel(level: number) {
		return this.update({ "system.points": this.getPointsForLevel(level) })
	}

	getPointsForLevel(level: number): number {
		const basePoints = this.points
		const oldLevel = this.calculateLevel().level
		if (oldLevel > level) {
			for (let points = basePoints; points > 0; points--) {
				this.system.points = points
				if (this.calculateLevel().level === level) {
					return points
				}
			}
			return 0
		} else {
			// HACK: capped at 100 points, probably not a good idea
			for (let points = basePoints; points < 100; points++) {
				this.system.points = points
				if (this.calculateLevel().level === level) {
					return points
				}
			}
			return 100
		}
	}

	incrementSkillLevel(options?: DocumentModificationOptions) {
		const basePoints = this.points + 1
		let maxPoints = basePoints
		if (this.difficulty === difficulty.Level.Wildcard) maxPoints += 12
		else maxPoints += 4

		const oldLevel = this.calculateLevel().level
		for (let points = basePoints; points < maxPoints; points++) {
			this.system.points = points
			if (this.calculateLevel().level > oldLevel) {
				return this.update({ "system.points": points }, options)
			}
		}
	}

	decrementSkillLevel(options?: DocumentModificationOptions) {
		if (this.points <= 0) return
		const basePoints = this.points
		let minPoints = basePoints
		if (this.difficulty === difficulty.Level.Wildcard) minPoints -= 12
		else minPoints -= 4
		minPoints = Math.max(minPoints, 0)

		let oldLevel = this.calculateLevel().level
		for (let points = basePoints; points >= minPoints; points--) {
			this.system.points = points
			if (this.calculateLevel().level < oldLevel) {
				break
			}
		}

		if (this.points > 0) {
			let oldLevel = this.calculateLevel().level
			while (this.points > 0) {
				this.system.points = Math.max(this.points - 1, 0)
				if (this.calculateLevel().level !== oldLevel) {
					this.system.points++
					return this.update({ "system.points": this.points }, options)
				}
			}
		}
	}

	protected _getCalcValues(): this["system"]["calc"] {
		return {
			...super._getCalcValues(),
			level: this.skillLevel ?? 0,
			rsl: this.relativeLevel ?? "",
			points: this.adjustedPoints(),
			tooltip: this.level?.tooltip.toString() ?? "",
			difficulty: `${this.attribute.toUpperCase()}/${this.difficulty.toUpperCase()}`,
		}
	}
}
