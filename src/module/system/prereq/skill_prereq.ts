import { StringCompareType, StringCriteria } from "@util/string_criteria.ts"
import { BasePrereq } from "./base.ts"
import { prereq } from "@util/enum/prereq.ts"
import { NumericCompareType, NumericCriteria } from "@util/numeric_criteria.ts"
import { SkillPrereqObj } from "./data.ts"
import { CharacterResolver, LocalizeGURPS, LootResolver } from "@util/index.ts"
import { TooltipGURPS } from "@sytem/tooltip/index.ts"
import { SkillGURPS, TechniqueGURPS } from "@item"
import { ActorType } from "@actor"
import { ItemType } from "@item/types.ts"

export class SkillPrereq extends BasePrereq {
	override type = prereq.Type.Skill

	name: StringCriteria

	level: NumericCriteria

	specialization: StringCriteria

	constructor() {
		super(prereq.Type.Skill)
		this.name = new StringCriteria(StringCompareType.IsString)
		this.level = new NumericCriteria(NumericCompareType.AtLeastNumber)
		this.specialization = new StringCriteria(StringCompareType.AnyString)
	}

	static fromObject(data: SkillPrereqObj): SkillPrereq {
		const prereq = new SkillPrereq()
		prereq.has = data.has
		if (data.name) prereq.name = new StringCriteria(data.name.compare, data.name.qualifier)
		if (data.level) prereq.level = new NumericCriteria(data.level.compare, data.level.qualifier)
		if (data.specialization)
			prereq.specialization = new StringCriteria(data.specialization.compare, data.specialization.qualifier)
		return prereq
	}

	satisfied(
		actor: CharacterResolver | LootResolver,
		exclude: SkillGURPS | TechniqueGURPS,
		tooltip: TooltipGURPS,
	): boolean {
		if (actor.type === ActorType.Loot) return true
		let satisfied = false
		let techLevel = ""
		if (exclude instanceof Item && (exclude.type === ItemType.Skill || exclude.type === ItemType.Technique)) {
			techLevel = exclude.techLevel
		}
		for (const sk of actor.skills) {
			if (sk.type === ItemType.SkillContainer) continue

			if (
				exclude === sk ||
				!this.name.matches(sk.name ?? "") ||
				!this.specialization.matches(sk.specialization ?? "")
			)
				continue
			satisfied = this.level.matches(sk.level.level)
			if (satisfied && techLevel !== "") satisfied = sk.techLevel === "" || techLevel === sk.techLevel
		}
		if (!this.has) satisfied = !satisfied
		if (!satisfied) {
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.prefix)
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.has[this.has ? "true" : "false"])
			tooltip.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.skill.name, {
					content: this.name.describe(),
				}),
			)
			if (this.specialization.compare !== StringCompareType.AnyString) {
				tooltip.push(
					LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.skill.specialization, {
						content: this.specialization.describe(),
					}),
				)
			}
			if (techLevel === "") {
				tooltip.push(
					LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.skill.level, {
						content: this.level.describe(),
					}),
				)
			} else if (this.specialization.compare === StringCompareType.AnyString)
				tooltip.push(
					LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.skill.level_alt1, {
						content: this.level.describe(),
					}),
				)
			else
				tooltip.push(
					LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.skill.level_alt2, {
						content: this.level.describe(),
					}),
				)
		}
		return satisfied
	}
}
