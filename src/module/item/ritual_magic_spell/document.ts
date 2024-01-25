import { ActorGURPS } from "@actor/document.ts"
import { ItemGCS } from "@item/gcs/document.ts"
import { RitualMagicSpellSystemData } from "./data.ts"
import { SkillLevel } from "@item/skill/data.ts"
import { SpellGURPS } from "@item/spell/document.ts"
import { ItemType, gid } from "@module/data/misc.ts"
import { difficulty } from "@util/enum/difficulty.ts"
import { TooltipGURPS } from "@sytem/tooltip/index.ts"
import { SkillDefault } from "@sytem/default/index.ts"

export interface RitualMagicSpellGURPS<TParent extends ActorGURPS> extends ItemGCS<TParent> {
	system: RitualMagicSpellSystemData
	type: ItemType.RitualMagicSpell
}

export class RitualMagicSpellGURPS<TParent extends ActorGURPS = ActorGURPS> extends ItemGCS<TParent> {
	declare level: SkillLevel

	// unsatisfied_reason = ""

	// Getters
	override secondaryText = SpellGURPS.prototype.secondaryText

	get rituals(): string {
		return ""
	}

	get points(): number {
		return this.system.points
	}

	get techLevel(): string {
		return this.system.tech_level
	}

	get attribute(): string {
		return this.system.difficulty?.split("/")[0] ?? gid.Intelligence
	}

	get difficulty(): difficulty.Level {
		return difficulty.Level.extractLevel(this.system.difficulty?.split("/")[1])
	}

	get powerSource(): string {
		return this.system.power_source
	}

	get college(): string[] {
		return this.system.college
	}

	get baseSkill(): string {
		return this.system.base_skill
	}

	get prereqCount(): number {
		return this.system.prereq_count
	}

	get defaultedFrom(): null {
		return null
	}

	adjustedPoints(tooltip?: TooltipGURPS): number {
		let points = this.points
		if (this.actor) {
			points += this.actor.spellPointBonusesFor(this.name!, this.powerSource, this.college, this.tags, tooltip)
			points = Math.max(points, 0)
		}
		return points
	}

	satisfied(tooltip: TooltipGURPS): boolean {
		if (this.college.length === 0) {
			// Tooltip.push(prefix)
			tooltip.push("gurps.ritual_magic_spell.must_assign_college")
			return false
		}
		for (const c of this.college) {
			if (this.actor?.bestSkillNamed(this.baseSkill, c, false, null)) return true
		}
		if (this.actor?.bestSkillNamed(this.baseSkill, "", false, null)) return true
		// Tooltip.push(prefix)
		tooltip.push("gurps.prereqs.ritual_magic.skill.name")
		tooltip.push(this.baseSkill)
		tooltip.push(` (${this.college[0]})`)
		const colleges = this.college
		colleges.shift()
		for (const c of colleges) {
			tooltip.push("gurps.prereqs.ritual_magic.skill.or")
			tooltip.push(this.baseSkill)
			tooltip.push(`(${c})`)
		}
		return false
	}

	get skillLevel(): string {
		if (this.effectiveLevel === -Infinity) return "-"
		return this.effectiveLevel.toString()
	}

	get relativeLevel(): string {
		if (this.level.level === -Infinity) return "-"
		return (
			(this.actor?.attributes?.get(this.attribute)?.attribute_def.name ?? "") +
			this.level.relative_level.signedString()
		)
	}

	// Point & Level Manipulation
	updateLevel(): boolean {
		const saved = this.level
		this.level = this.calculateLevel()
		return saved !== this.level
	}

	get effectiveLevel(): number {
		const actor = this.actor || this.dummyActor
		if (!actor) return -Infinity
		let att = actor.resolveAttributeCurrent(this.attribute)
		let effectiveAtt = actor.resolveAttributeEffective(this.attribute)
		return this.level.level - att + effectiveAtt
	}

	calculateLevel(): SkillLevel {
		let skillLevel: SkillLevel = {
			level: -Infinity,
			relative_level: 0,
			tooltip: new TooltipGURPS(),
		}
		if (this.college.length === 0) skillLevel = this.determineLevelForCollege("")
		else {
			for (const c of this.college) {
				const possible = this.determineLevelForCollege(c)
				if (skillLevel.level < possible.level) skillLevel = possible
			}
		}
		if (this.actor) {
			const tooltip = new TooltipGURPS()
			tooltip.push(skillLevel.tooltip)
			let levels = Math.trunc(
				this.actor.spellBonusFor(this.name!, this.powerSource, this.college, this.tags, tooltip),
			)
			skillLevel.level += levels
			skillLevel.relative_level += levels
			skillLevel.tooltip = tooltip
		}
		return {
			level: skillLevel.level,
			relative_level: skillLevel.relative_level,
			tooltip: skillLevel.tooltip,
		}
	}

	determineLevelForCollege(college: string): SkillLevel {
		const def = new SkillDefault({
			type: gid.Skill,
			name: this.baseSkill,
			specialization: college,
			modifier: -this.prereqCount,
		})
		if (college === "") def.name = ""
		const limit = 0
		const skillLevel = this.calculateLevelAsTechnique(def, college, limit)
		skillLevel.relative_level += def.modifier
		def.specialization = ""
		def.modifier -= 6
		const fallback = this.calculateLevelAsTechnique(def, college, limit)
		fallback.relative_level += def.modifier
		if (skillLevel.level >= def.modifier) return skillLevel
		return fallback
	}

	calculateLevelAsTechnique(def: SkillDefault, college: string, limit: number): SkillLevel {
		const tooltip = new TooltipGURPS()
		let relative_level = 0
		let points = this.adjustedPoints()
		let level = -Infinity
		if (this.actor) {
			if (def?.type === gid.Skill) {
				const sk = this.actor.baseSkill(def!, true)
				if (sk) level = sk.level.level
			} else if (def) {
				level = (def?.skillLevelFast(this.actor, true, null, false) || 0) - (def?.modifier || 0)
			}
			if (level !== -Infinity) {
				const base_level = level
				level += def!.modifier // ?
				if (this.difficulty === "h") points -= 1
				if (points > 0) relative_level = points
				if (level !== -Infinity) {
					// Relative_level += this.actor.bonusFor(`skill.name/${this.name}`, tooltip)
					relative_level += this.actor.skillBonusFor(this.name!, college, this.tags, tooltip)
					level += relative_level
				}
				if (limit) {
					const max = base_level + limit
					if (level > max) {
						relative_level -= level - max
						level = max
					}
				}
			}
		}
		return {
			level: level,
			relative_level: relative_level,
			tooltip: tooltip,
		}
	}

	incrementSkillLevel(): void {
		const basePoints = this.points + 1
		let maxPoints = basePoints
		if (this.difficulty === difficulty.Level.Wildcard) maxPoints += 12
		else maxPoints += 4

		const oldLevel = this.level.level
		for (let points = basePoints; points < maxPoints; points++) {
			this.system.points = points
			if (this.calculateLevel().level > oldLevel) {
				this.update({ "system.points": points })
			}
		}
	}

	decrementSkillLevel(): void {
		if (this.points <= 0) return
		const basePoints = this.points
		let minPoints = basePoints
		if (this.difficulty === difficulty.Level.Wildcard) minPoints -= 12
		else minPoints -= 4
		minPoints = Math.max(minPoints, 0)

		let oldLevel = this.level.level
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
					this.update({ "system.points": this.points })
				}
			}
		}
	}

	setLevel(level: number) {
		return this.update({ "system.points": this.getPointsForLevel(level) })
	}

	getPointsForLevel(level: number): number {
		const basePoints = this.points
		const oldLevel = this.level.level
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
}
