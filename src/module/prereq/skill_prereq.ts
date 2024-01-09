import { LocalizeGURPS, NumericCompareType, NumericCriteria, StringCompareType, StringCriteria } from "@util"
import { BasePrereq, BasePrereqObj } from "./base"
import { prereq } from "@util/enum"
import { CharacterGURPS } from "@actor"
import { TooltipGURPS } from "@module/tooltip"
import { ItemType } from "@module/data"

export interface SkillPrereqObj extends BasePrereqObj {
	name: StringCriteria
	level: NumericCriteria
	specialization: StringCriteria
}

export class SkillPrereq extends BasePrereq {
	type = prereq.Type.Skill

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
		if (data.name)
			prereq.name = new StringCriteria(data.name.compare, data.name.qualifier)
		if (data.level)
			prereq.level = new NumericCriteria(data.level.compare, data.level.qualifier)
		if (data.specialization)
			prereq.specialization = new StringCriteria(data.specialization.compare, data.specialization.qualifier)
		return prereq
	}

	satisfied(
		character: CharacterGURPS,
		exclude: any,
		tooltip: TooltipGURPS
	): boolean {
		let satisfied = false
		let techLevel = ""
		if (
			exclude instanceof Item && (
				exclude.type === ItemType.Skill ||
				exclude.type === ItemType.Technique
			)
		) {
			techLevel = (exclude as any).techLevel
		}
		for (let sk of character.skills as any) {
			if (sk.type === ItemType.SkillContainer) continue

			if (exclude === sk ||
				!this.name.matches(sk.name ?? "") ||
				!this.specialization.matches(sk.specialization ?? "")
			) continue
			satisfied = this.level.matches(sk.level.level)
			if (satisfied && techLevel !== "")
				satisfied = sk.techLevel === "" || techLevel === sk.techLevel
		}
		if (!this.has) satisfied = !satisfied
		if (!satisfied) {
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.prefix)
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.has[this.has ? "true" : "false"])
			tooltip.push(
				LocalizeGURPS.format(
					LocalizeGURPS.translations.gurps.prereq.skill.name, { content: this.name.describe() }
				))
			if (this.specialization.compare !== StringCompareType.AnyString) {
				tooltip.push(LocalizeGURPS.format(
					LocalizeGURPS.translations.gurps.prereq.skill.specialization, { content: this.specialization.describe() }
				))
			}
			if (techLevel === "") {
				tooltip.push(LocalizeGURPS.format(
					LocalizeGURPS.translations.gurps.prereq.skill.level, { content: this.level.describe() }
				))
			} else if (this.specialization.compare === StringCompareType.AnyString)
				tooltip.push(LocalizeGURPS.format(
					LocalizeGURPS.translations.gurps.prereq.skill.level_alt1, { content: this.level.describe() }
				))
			else
				tooltip.push(LocalizeGURPS.format(
					LocalizeGURPS.translations.gurps.prereq.skill.level_alt2, { content: this.level.describe() }
				))
		}
		return satisfied
	}
}
