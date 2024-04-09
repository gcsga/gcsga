import { ActorGURPS } from "@actor"
import { ActorType, gid } from "@data"

export type SkillDefaultType = gid.Block | gid.Parry | gid.Skill | gid.Ten | string

const SKILL_BASED_DEFAULT_TYPES: Set<string> = new Set([gid.Skill, gid.Parry, gid.Block])

const fields = foundry.data.fields

export interface SkillDefaultObj {
	type: SkillDefaultType
	name?: string
	specialization?: string
	modifier?: number
	level?: number
	adjusted_level?: number
	points?: number
}

type SkillDefaultSchema = {
	type: foundry.data.fields.StringField<SkillDefaultType, SkillDefaultType, true, false, true>
	name?: foundry.data.fields.StringField<string, string, false, false, false>
	specialization?: foundry.data.fields.StringField<string, string, false, false, false>
	modifier?: foundry.data.fields.NumberField<number, number, false, false, false>
	level?: foundry.data.fields.NumberField<number, number, false, false, false>
	adjusted_level?: foundry.data.fields.NumberField<number, number, false, false, false>
	points?: foundry.data.fields.NumberField<number, number, false, false, false>
}

export class SkillDefault {
	type: SkillDefaultType = gid.Skill
	name?: string
	specialization?: string
	modifier = 0
	level = 0
	adjusted_level = 0
	points = 0

	constructor(data?: SkillDefaultObj) {
		if (data) Object.assign(this, data)
	}

	static defineSchema(): SkillDefaultSchema {
		return {
			type: new fields.StringField<SkillDefaultType, SkillDefaultType, true>({ initial: gid.Dexterity }),
			name: new fields.StringField({ required: false }),
			specialization: new fields.StringField({ required: false }),
			modifier: new fields.NumberField({ required: false }),
			level: new fields.NumberField({ required: false }),
			adjusted_level: new fields.NumberField({ required: false }),
			points: new fields.NumberField({ required: false }),
		}
	}

	// For the sake of naming consistency
	get adjustedLevel(): number {
		return this.adjusted_level
	}

	get skillBased(): boolean {
		return SKILL_BASED_DEFAULT_TYPES.has(this.type) ?? false
	}

	equivalent(other?: SkillDefault): boolean {
		return (
			!!other &&
			this.type === other.type &&
			this.modifier === other.modifier &&
			this.name === other.name &&
			this.specialization === other.specialization
		)
	}

	fullName(actor: ActorGURPS): string {
		if (this.skillBased) {
			let buffer = ""
			buffer += this.name
			if (this.specialization) buffer += ` (${this.specialization})`
			if (this.type === gid.Dodge) buffer += " Dodge"
			else if (this.type === gid.Parry) buffer += " Parry"
			else if (this.type === gid.Block) buffer += " Block"
			return buffer
		}
		return actor.resolveAttributeName(this.type)
	}

	skillLevel(
		actor: ActorGURPS,
		require_points: boolean,
		excludes: Map<string, boolean>,
		rule_of_20: boolean,
	): number {
		if (!actor.isOfType(ActorType.Character)) return 0
		let best = -Infinity
		switch (this.type) {
			case gid.Parry:
				best = this.best(actor, require_points, excludes)
				if (best !== -Infinity) best = best / 2 + 3 + actor.parryBonus
				return this.finalLevel(best)
			case gid.Block:
				best = this.best(actor, require_points, excludes)
				if (best !== -Infinity) best = best / 2 + 3 + actor.blockBonus
				return this.finalLevel(best)
			case gid.Skill:
				return this.finalLevel(this.best(actor, require_points, excludes))
			default:
				return this.skillLevelFast(actor, require_points, excludes, rule_of_20)
		}
	}

	best(actor: ActorGURPS, require_points: boolean, excludes: Map<string, boolean>): number {
		let best = -Infinity
		if (!actor.isOfType(ActorType.Character)) return best
		for (const s of actor.skillNamed(this.name!, this.specialization || "", require_points, excludes)) {
			const level = s.calculateLevel().level
			if (best < level) best = level
		}
		return best
	}

	skillLevelFast(
		actor: ActorGURPS,
		require_points: boolean,
		excludes: Map<string, boolean> | null = new Map(),
		rule_of_20 = false,
	): number {
		let level = 0
		let best = 0
		if (!actor.isOfType(ActorType.Character)) return 0
		switch (this.type) {
			case gid.Dodge:
				level = actor.encumbrance.current.dodge.normal
				if (rule_of_20 && level > 20) level = 20
				return this.finalLevel(level)
			case gid.Parry:
				best = this.bestFast(actor, require_points, excludes)
				if (best !== -Infinity) best = Math.floor(best / 2) + 3 + actor.parryBonus
				return this.finalLevel(best)
			case gid.Block:
				best = this.bestFast(actor, require_points, excludes)
				if (best !== -Infinity) best = Math.floor(best / 2) + 3 + actor.blockBonus
				return this.finalLevel(best)
			case gid.Skill:
				return this.finalLevel(this.bestFast(actor, require_points, excludes))
			case gid.Ten:
				return this.finalLevel(10)
			default:
				level = actor.resolveAttributeCurrent(this.type)
				if (rule_of_20) level = Math.min(level, 20)
				return this.finalLevel(level)
		}
	}

	bestFast(actor: ActorGURPS, require_points: boolean, excludes: Map<string, boolean> | null): number {
		let best = -Infinity
		if (!actor.isOfType(ActorType.Character)) return best
		for (const sk of actor.skillNamed(this.name!, this.specialization || "", require_points, excludes)) {
			if (best < sk.level.level) best = sk.level.level
		}
		return best
	}

	finalLevel(level: number): number {
		if (level !== -Infinity) level += this.modifier
		return level
	}

	toObject(): SkillDefaultObj {
		return {
			type: this.type,
			name: this.name,
			specialization: this.specialization,
			modifier: this.modifier,
			level: this.level,
			adjusted_level: this.adjustedLevel,
			points: this.points,
		}
	}

	get noLevelOrPoints(): SkillDefault {
		return new SkillDefault({
			type: this.type,
			name: this.name,
			modifier: this.modifier,
			level: 0,
			adjusted_level: 0,
			points: 0,
		})
	}
}

export interface SkillDefaultDef {
	type: SkillDefaultType
	name?: string
	specialization?: string
	modifier: number
	level?: number
	adjusted_level?: number
	points?: number
}
