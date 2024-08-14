import { ActorGURPS } from "@actor"
import { ActorType, gid } from "@data"
import { Nameable } from "@module/util/nameable.ts"
import { SkillDefaultSchema, SkillDefaultType } from "./data.ts"
import { ItemGURPS } from "@item"

const SKILL_BASED_DEFAULT_TYPES: Set<string> = new Set([gid.Skill, gid.Parry, gid.Block])

class SkillDefault<TItem extends ItemGURPS = ItemGURPS> extends foundry.abstract.DataModel<TItem, SkillDefaultSchema> {
	constructor(
		data: DeepPartial<SourceFromSchema<SkillDefaultSchema>>,
		options?: DataModelConstructionOptions<TItem>,
	) {
		super(data, options)
	}

	static override defineSchema(): SkillDefaultSchema {
		const fields = foundry.data.fields

		return {
			type: new fields.StringField<SkillDefaultType, SkillDefaultType, true>({ initial: gid.Dexterity }),
			name: new fields.StringField({ required: true, nullable: true, initial: null }),
			specialization: new fields.StringField({ required: true, nullable: true, initial: null }),
			modifier: new fields.NumberField({ integer: true, required: true, nullable: false, initial: 0 }),
			level: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
			adjusted_level: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
			points: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
		}
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

	skillLevel(actor: ActorGURPS, require_points: boolean, excludes: Set<string>, rule_of_20: boolean): number {
		if (!actor.isOfType(ActorType.Character)) return 0
		let best = Number.MIN_SAFE_INTEGER
		switch (this.type) {
			case gid.Parry:
				best = this.best(actor, require_points, excludes)
				if (best !== Number.MIN_SAFE_INTEGER) best = best / 2 + 3 + actor.parryBonus
				return this.finalLevel(best)
			case gid.Block:
				best = this.best(actor, require_points, excludes)
				if (best !== Number.MIN_SAFE_INTEGER) best = best / 2 + 3 + actor.blockBonus
				return this.finalLevel(best)
			case gid.Skill:
				return this.finalLevel(this.best(actor, require_points, excludes))
			default:
				return this.skillLevelFast(actor, require_points, excludes, rule_of_20)
		}
	}

	best(actor: ActorGURPS, require_points: boolean, excludes: Set<string>): number {
		let best = Number.MIN_SAFE_INTEGER
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
		excludes: Set<string> | null = new Set(),
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
				if (best !== Number.MIN_SAFE_INTEGER) best = Math.floor(best / 2) + 3 + actor.parryBonus
				return this.finalLevel(best)
			case gid.Block:
				best = this.bestFast(actor, require_points, excludes)
				if (best !== Number.MIN_SAFE_INTEGER) best = Math.floor(best / 2) + 3 + actor.blockBonus
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

	bestFast(actor: ActorGURPS, require_points: boolean, excludes: Set<string> | null): number {
		let best = Number.MIN_SAFE_INTEGER
		if (!actor.isOfType(ActorType.Character)) return best
		for (const sk of actor.skillNamed(this.name!, this.specialization || "", require_points, excludes)) {
			if (!sk.level) sk.updateLevel()
			if (best < sk.level.level) best = sk.level.level
		}
		return best
	}

	finalLevel(level: number): number {
		if (level !== Number.MIN_SAFE_INTEGER) level += this.modifier
		return level
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

	/**  Replacements */
	nameWithReplacements(replacements: Map<string, string>): string {
		return Nameable.apply(this.name ?? "", replacements)
	}

	specializationWithReplacements(replacements: Map<string, string>): string {
		return Nameable.apply(this.specialization ?? "", replacements)
	}

	/** Nameables */
	fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void {
		Nameable.extract(this.name ?? "", m, existing)
		Nameable.extract(this.specialization ?? "", m, existing)
	}
}

interface SkillDefault<TItem extends ItemGURPS>
	extends foundry.abstract.DataModel<TItem, SkillDefaultSchema>,
		ModelPropsFromSchema<SkillDefaultSchema> {}

export { SkillDefault }
