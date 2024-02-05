import { ItemGCS } from "@item/gcs/document.ts"
import { TechniqueSource, TechniqueSystemSource } from "./data.ts"
import { SkillLevel } from "@item/skill/data.ts"
import { SkillGURPS } from "@item/skill/document.ts"
import { difficulty } from "@util/enum/difficulty.ts"
import { SkillDefault } from "@sytem/default/index.ts"
import { TooltipGURPS } from "@sytem/tooltip/index.ts"
import { ActorGURPS, CharacterGURPS } from "@actor"
import { ItemType, gid } from "@data"

export interface TechniqueGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGCS<TParent> {
	readonly _source: TechniqueSource
	system: TechniqueSystemSource

	type: ItemType.Technique
}
export class TechniqueGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGCS<TParent> {
	declare level: SkillLevel

	unsatisfied_reason = ""

	// private _dummyActor: (typeof CONFIG.GURPS.Actor.documentClasses)[ActorType.Character] | null = null

	// Static get schema(): typeof TechniqueData {
	// 	return TechniqueData;
	// }

	// Getters
	override secondaryText = SkillGURPS.prototype.secondaryText

	// points = SkillGURPS.prototype.points
	get points(): number {
		return this.system.points
	}

	set points(n: number) {
		this.system.points = n
	}

	get techLevel(): string {
		return this.system.tech_level
	}

	get specialization(): string {
		return ""
	}

	get limit(): number {
		return this.system.limit
	}

	get difficulty(): difficulty.Level {
		return this.system.difficulty
	}

	get default(): SkillDefault {
		return new SkillDefault(this.system.default)
	}

	adjustedPoints(tooltip?: TooltipGURPS): number {
		let points = this.points
		if (this.actor instanceof CharacterGURPS) {
			points += this.actor.skillPointBonusFor(this.name!, "", this.tags, tooltip)
			points = Math.max(points, 0)
		}
		return points
	}

	satisfied(tooltip: TooltipGURPS): boolean {
		if (this.default.type !== "skill") return true
		if (!(this.actor instanceof CharacterGURPS)) return true
		const sk = this.actor.bestSkillNamed(this.default.name ?? "", this.default.specialization ?? "", false, null)
		const satisfied = !!sk && (sk instanceof TechniqueGURPS || sk.points > 0)
		if (!satisfied) {
			if (!sk) tooltip.push("gurps.prereqs.technique.skill")
			else tooltip.push("gurps.prereqs.technique.point")
			tooltip.push(this.default.fullName(this.actor!))
		}
		return satisfied
	}

	get skillLevel(): string {
		if (this.effectiveLevel === -Infinity) return "-"
		return this.effectiveLevel.toString()
	}

	get relativeLevel(): string {
		if (this.level.level === -Infinity) return "-"
		return this.level.relative_level.signedString()
	}

	// Point & Level Manipulation
	updateLevel(): boolean {
		const saved = this.level
		this.level = this.calculateLevel()
		return saved !== this.level
	}

	get effectiveLevel(): number {
		return this.level.level
	}

	// // Used for defaults
	// get dummyActor(): (typeof CONFIG.GURPS.Actor.documentClasses)[ActorType.Character] | null {
	// 	return this._dummyActor
	// }

	// set dummyActor(actor: (typeof CONFIG.GURPS.Actor.documentClasses)[ActorType.Character] | null) {
	// 	this._dummyActor = actor
	// }

	calculateLevel(): SkillLevel {
		const actor = this.actor || this.dummyActor
		const tooltip = new TooltipGURPS()
		const points = this.adjustedPoints()

		if (!(actor instanceof CharacterGURPS)) return { level: -Infinity, relative_level: -Infinity, tooltip: tooltip }

		// Level of defaulting skill.
		const default_skill_level = getDefaultSkillLevel(this)

		// Any modifiers to the default skill level based on conditions or other factors.
		const skill_bonus = actor.skillBonusFor(this.name!, this.specialization, this.tags, tooltip)

		// The effective skill level is the base level plus the skill bonus.
		const effective_skill_level = default_skill_level + skill_bonus

		// The base level of the technique (the default skill level plus the technique's modifier).
		const base_technique_level = this.default.modifier + effective_skill_level

		// Bonus to the technique's base level.
		const relative_technique_level = getRelativeTechniqueLevel(this)

		let level = base_technique_level + relative_technique_level
		let relative_level = this.default.modifier + relative_technique_level
		if (this.limit) {
			const max = base_technique_level + this.limit
			if (level > max) {
				relative_level = relative_level - (level - max)
				level = max
			}
		}

		return {
			level: level,
			relative_level: relative_level,
			tooltip: tooltip,
		}

		function getRelativeTechniqueLevel(technique: TechniqueGURPS): number {
			const relative_level = technique.isHardDifficulty() ? points - 1 : points
			return relative_level < 0 ? 0 : relative_level
		}

		function getDefaultSkillLevel(technique: TechniqueGURPS): number {
			if (!(actor instanceof CharacterGURPS)) return 0
			if (technique.default.type === gid.Skill) {
				const sk = actor.baseSkill(technique.default, true)
				return sk ? sk.level.level : 0
			} else if (technique.default) {
				return (
					(technique.default?.skillLevelFast(actor, true, null, false) ?? 0) -
					(technique.default?.modifier ?? 0)
				)
			}
			return 0
		}
	}

	private isHardDifficulty() {
		return this.difficulty === difficulty.Level.Hard
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

		const oldLevel = this.level.level
		for (let points = basePoints; points >= minPoints; points--) {
			this.system.points = points
			if (this.calculateLevel().level < oldLevel) {
				break
			}
		}

		if (this.points > 0) {
			const oldLevel = this.calculateLevel().level
			while (this.points > 0) {
				this.system.points = Math.max(this.points - 1, 0)
				if (this.calculateLevel().level !== oldLevel) {
					this.system.points += 1
					this.update({ "system.points": this.points })
				}
			}
		}
	}

	setLevel(level: number): Promise<this | undefined> {
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
