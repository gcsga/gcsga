// import { ActorGURPS } from "@actor"
// import { AbstractSkillGURPS } from "@item"
// import { SkillLevel, SkillSource, SkillSystemData } from "./data.ts"
// import { LocalizeGURPS, NewLineRegex, StringBuilder, TooltipGURPS, difficulty, display } from "@util"
// import { SheetSettings, SkillDefault } from "@system"
// import { ActorType, ItemType } from "@module/data/constants.ts"
// import { Nameable } from "@module/util/nameable.ts"
// class SkillGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractSkillGURPS<TParent> {
// 	// declare level: SkillLevel
// 	// declare default: SkillDefault | null
// 	//
// 	// override secondaryText(optionChecker: (option: display.Option) => boolean): string {
// 	// 	const buffer = new StringBuilder()
// 	// 	const settings = SheetSettings.for(this.actor)
// 	// 	if (optionChecker(settings.modifiers_display)) {
// 	// 		const text = this.modifierNotes
// 	// 		if ((text?.trim() ?? "") !== "") buffer.push(text)
// 	// 	}
// 	// 	if (optionChecker(settings.notes_display)) {
// 	// 		buffer.appendToNewLine(this.notes.trim())
// 	// 		buffer.appendToNewLine(
// 	// 			Study.progressText(Study.resolveHours(this.system.study), this.system.study_hours_needed, false),
// 	// 		)
// 	// 	}
// 	// 	if (optionChecker(settings.skill_level_adj_display)) {
// 	// 		if (
// 	// 			this.level.tooltip.length !== 0 &&
// 	// 			!this.level.tooltip.includes(LocalizeGURPS.translations.gurps.common.no_additional_modifiers)
// 	// 		) {
// 	// 			let levelTooltip = this.level.tooltip.string.trim().replaceAll(NewLineRegex, ", ")
// 	// 			const msg = LocalizeGURPS.translations.gurps.common.includes_modifiers_from
// 	// 			if (levelTooltip.startsWith(`${msg},`)) levelTooltip = `${msg}:${levelTooltip.slice(msg.length + 1)}`
// 	// 			buffer.appendToNewLine(levelTooltip)
// 	// 		}
// 	// 	}
// 	// 	return buffer.toString()
// 	// }
// 	//
// 	// get modifierNotes(): string {
// 	// 	if (this.difficulty !== difficulty.Level.Wildcard) {
// 	// 		const defSkill = this.defaultSkill
// 	// 		if (defSkill && this.default) {
// 	// 			return LocalizeGURPS.format(LocalizeGURPS.translations.gurps.item.default, {
// 	// 				skill: defSkill.formattedName,
// 	// 				modifier: this.default.modifier.signedString(),
// 	// 			})
// 	// 		}
// 	// 	}
// 	// 	return ""
// 	// }
// 	//
// 	// get defaultSkill(): SkillGURPS | null {
// 	// 	if (this.actor?.isOfType(ActorType.Character)) {
// 	// 		return this.actor.baseSkill(this.default, true)
// 	// 	}
// 	// 	return null
// 	// }
// 	//
// 	// get defaults(): SkillDefault[] {
// 	// 	if (this.system.defaults) {
// 	// 		const defaults: SkillDefault[] = []
// 	// 		const list = this.system.defaults
// 	// 		for (const f of list ?? []) {
// 	// 			defaults.push(new SkillDefault(f))
// 	// 		}
// 	// 		return defaults
// 	// 	}
// 	// 	return []
// 	// }
// 	//
// 	// get encumbrancePenaltyMultiplier(): number {
// 	// 	return this.system.encumbrance_penalty_multiplier
// 	// }
// 	//
// 	// // Point & Level Manipulation
// 	// calculateLevel(): SkillLevel {
// 	// 	const none = { level: Number.MIN_SAFE_INTEGER, relativeLevel: 0, tooltip: new TooltipGURPS() }
// 	// 	const actor = this.dummyActor || this.actor
// 	// 	if (!actor) return none
// 	// 	if (actor instanceof ActorGURPS && actor.isOfType(ActorType.Character)) {
// 	// 		let relativeLevel = difficulty.Level.baseRelativeLevel(this.difficulty)
// 	// 		let level = actor.resolveAttributeCurrent(this.attribute)
// 	// 		const tooltip = new TooltipGURPS()
// 	// 		let points = this.adjustedPoints()
// 	// 		const def = this.default
// 	// 		const diff = this.difficulty
// 	// 		if (level === Number.MIN_SAFE_INTEGER) return none
// 	// 		if (SheetSettings.for(actor).use_half_stat_defaults) {
// 	// 			level = Math.trunc(level / 2) + 5
// 	// 		}
// 	// 		if (diff === difficulty.Level.Wildcard) points /= 3
// 	// 		else if (def && def.points > 0) points += def.points
// 	// 		points = Math.trunc(points)
// 	//
// 	// 		switch (true) {
// 	// 			case points === 1:
// 	// 				// relativeLevel is preset to this point value
// 	// 				break
// 	// 			case points > 1 && points < 4:
// 	// 				relativeLevel += 1
// 	// 				break
// 	// 			case points >= 4:
// 	// 				relativeLevel += 1 + Math.floor(points / 4)
// 	// 				break
// 	// 			case diff !== difficulty.Level.Wildcard && def && def.points < 0:
// 	// 				relativeLevel = def!.adjusted_level - level
// 	// 				break
// 	// 			default:
// 	// 				level = Number.MIN_SAFE_INTEGER
// 	// 				relativeLevel = 0
// 	// 		}
// 	//
// 	// 		if (level === Number.MIN_SAFE_INTEGER) return none
// 	// 		level += relativeLevel
// 	// 		if (diff !== difficulty.Level.Wildcard && def && level < def.adjusted_level) {
// 	// 			level = def.adjusted_level
// 	// 		}
// 	// 		let bonus = actor.skillBonusFor(this.name!, this.specialization, this.tags, tooltip)
// 	// 		level += bonus
// 	// 		relativeLevel += bonus
// 	// 		bonus = actor.encumbrance.forSkills.penalty * this.encumbrancePenaltyMultiplier
// 	// 		level += bonus
// 	// 		if (bonus !== 0) {
// 	// 			tooltip.push(
// 	// 				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.item.encumbrance, {
// 	// 					amount: bonus.signedString(),
// 	// 				}),
// 	// 			)
// 	// 		}
// 	// 		return {
// 	// 			level,
// 	// 			relativeLevel,
// 	// 			tooltip,
// 	// 		}
// 	// 	}
// 	// 	return none
// 	// }
// 	//
// 	// adjustedPoints(tooltip?: TooltipGURPS): number {
// 	// 	let points = this.points
// 	// 	if (this.actor?.isOfType(ActorType.Character)) {
// 	// 		points += this.actor.skillPointBonusFor(this.name!, this.specialization, this.tags, tooltip)
// 	// 		points = Math.max(points, 0)
// 	// 	}
// 	// 	return points
// 	// }
//
// 	bestDefaultWithPoints(_excluded?: SkillDefault): SkillDefault | null {
// 		const actor = this.dummyActor || this.actor
// 		if (!actor) return null
// 		if (actor instanceof ActorGURPS && actor.isOfType(ActorType.Character)) {
// 			const best = this.bestDefault()
// 			if (best) {
// 				const baseline =
// 					actor.resolveAttributeCurrent(this.attribute) + difficulty.Level.baseRelativeLevel(this.difficulty)
// 				const level = best.level
// 				best.adjusted_level = level
// 				if (level === baseline) best.points = 1
// 				else if (level === baseline + 1) best.points = 2
// 				else if (level > baseline + 1) best.points = 4 * (level - (baseline + 1))
// 				else best.points = -Math.max(level, 0)
// 			}
// 			return best ?? null
// 		}
// 		return null
// 	}
//
// 	bestDefault(excluded?: SkillDefault): SkillDefault | null {
// 		const actor = this.dummyActor || this.actor
// 		if (!actor) return null
// 		if (actor instanceof ActorGURPS && actor.isOfType(ActorType.Character)) {
// 			const excludes: Set<string> = new Set()
// 			excludes.add(this.name!)
// 			let bestDef = new SkillDefault({})
// 			let best = Number.MIN_SAFE_INTEGER
// 			for (const def of this.resolveToSpecificDefaults()) {
// 				if (def.equivalent(excluded) || this.inDefaultChain(def, new Map())) continue
// 				const level = this.calcSkillDefaultLevel(def, excludes)
// 				if (best < level) {
// 					best = level
// 					bestDef = def.noLevelOrPoints
// 					bestDef.level = level
// 				}
// 			}
// 			return bestDef
// 		}
// 		return null
// 	}
//
// 	calcSkillDefaultLevel(def: SkillDefault, excludes: Set<string>): number {
// 		const actor = this.dummyActor || this.actor
// 		if (!actor) return 0
// 		if (actor instanceof ActorGURPS && actor.isOfType(ActorType.Character)) {
// 			let level = def.skillLevel(actor, true, excludes, this.type.startsWith("skill"))
// 			if (def.skillBased) {
// 				const other = actor.bestSkillNamed(def.name!, def.specialization!, true, excludes)
// 				if (other) {
// 					level -= actor.skillBonusFor(def.name!, def.specialization!, this.tags, undefined)
// 				}
// 			}
// 			return level
// 		}
// 		return 0
// 	}
//
// 	resolveToSpecificDefaults(): SkillDefault[] {
// 		if (!this.actor?.isOfType(ActorType.Character)) return []
// 		const result: SkillDefault[] = []
// 		for (const def of this.defaults) {
// 			if (!this.actor || !def || !def.skillBased) {
// 				result.push(def)
// 			} else {
// 				const m: Set<string> = new Set()
// 				m.add(this.formattedName)
// 				for (const s of this.actor.skillNamed(def.name!, def.specialization!, true, m)) {
// 					const local = new SkillDefault(fu.duplicate(def))
// 					local.specialization = s.specialization
// 					result.push(local)
// 				}
// 			}
// 		}
// 		return result
// 	}
//
// 	equivalent(def: SkillDefault, other: SkillDefault | null): boolean {
// 		return (
// 			other !== null &&
// 			def.type === other.type &&
// 			def.modifier === other.modifier &&
// 			def.name === other.name &&
// 			def.specialization === other.specialization
// 		)
// 	}
//
// 	inDefaultChain(def: SkillDefault | null, lookedAt: Map<string, boolean>): boolean {
// 		if (!def || !def.name) return false
// 		if (!this.actor || !this.actor.isOfType(ActorType.Character)) return false
// 		let hadOne = false
// 		for (const one of this.actor.itemTypes[ItemType.Skill].filter(
// 			s => s.name === def.name && s.specialization === def.specialization,
// 		)) {
// 			if (one.id === this.id) return true
// 			if (typeof one.id === "string" && lookedAt.get(one.id)) {
// 				lookedAt.set(one.id, true)
// 				if (this.inDefaultChain(one.default, lookedAt)) return true
// 			}
// 			hadOne = true
// 		}
// 		return !hadOne
// 	}
//
// 	/**  Replacements */
// 	// get notesWithReplacements(): string {
// 	// 	return Nameable.apply(this.system.notes, this.nameableReplacements)
// 	// }
// 	//
// 	// /** Nameables */
// 	// fillWithNameableKeys(m: Map<string, string>, existing?: Map<string, string>): void {
// 	// 	if (!existing) existing = this.nameableReplacements
// 	//
// 	// 	Nameable.extract(this.system.name, m, existing)
// 	// 	Nameable.extract(this.system.notes, m, existing)
// 	// 	Nameable.extract(this.system.specialization, m, existing)
// 	//
// 	// 	if (this.prereqs) {
// 	// 		this.prereqs.fillWithNameableKeys(m, existing)
// 	// 	}
// 	// 	for (const def of this.defaults) {
// 	// 		def.fillWithNameableKeys(m, existing)
// 	// 	}
// 	// 	for (const feature of this.features) {
// 	// 		feature.fillWithNameableKeys(m, existing)
// 	// 	}
// 	// 	for (const weapon of this.itemCollections.weapons) {
// 	// 		weapon.fillWithNameableKeys(m, existing)
// 	// 	}
// 	// }
// }
//
// interface SkillGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractSkillGURPS<TParent> {
// 	readonly _source: SkillSource
// 	system: SkillSystemData
// }
//
// export { SkillGURPS }
