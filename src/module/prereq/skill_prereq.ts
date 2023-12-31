import { CharacterGURPS } from "@actor"
import {
	ItemType,
	NumericCriteria,
	NumericComparisonType,
	PrereqType,
	StringCriteria,
	StringComparisonType,
} from "@module/data"
import { TooltipGURPS } from "@module/tooltip"
import { LocalizeGURPS, numberCompare, stringCompare } from "@util"
import { BasePrereq, PrereqConstructionContext } from "./base"

export class SkillPrereq extends BasePrereq {
	name!: StringCriteria

	specialization!: StringCriteria

	level!: NumericCriteria

	constructor(data: SkillPrereq | any, context: PrereqConstructionContext = {}) {
		data = mergeObject(SkillPrereq.defaults, data)
		super(data, context)
	}

	static get defaults(): Record<string, any> {
		return mergeObject(super.defaults, {
			type: PrereqType.Skill,
			name: { compare: StringComparisonType.IsString, qualifier: "" },
			specialization: { compare: StringComparisonType.AnyString, qualifier: "" },
			level: { compare: NumericComparisonType.AtLeastNumber, qualifier: 0 },
		})
	}

	satisfied(actor: CharacterGURPS, exclude: any, tooltip: TooltipGURPS): [boolean, boolean] {
		let satisfied = false
		let tech_level = ""
		if (exclude.type === ItemType.Skill) tech_level = exclude.techLevel
		actor.skills.forEach(sk => {
			if (sk.type === ItemType.SkillContainer) return
			if (
				exclude === sk ||
				!stringCompare(sk.name, this.name) ||
				!stringCompare((sk as any).specialization, this.specialization)
			)
				return
			satisfied = numberCompare((sk as any).level.level, this.level)
			if (satisfied && tech_level) satisfied = !(sk as any).techLevel || tech_level === (sk as any).techLevel
		})
		// For (let sk of actor.skills) {
		// }
		if (!this.has) satisfied = !satisfied
		if (!satisfied) {
			// Tooltip.push(prefix)
			tooltip.push(LocalizeGURPS.translations.gurps.prereqs.has[this.has ? "true" : "false"])
			tooltip.push(LocalizeGURPS.translations.gurps.prereqs.skill.name)
			tooltip.push(LocalizeGURPS.translations.gurps.prereqs.criteria[this.name?.compare])
			if (this.name?.compare !== StringComparisonType.AnyString) tooltip.push(`"${this.name!.qualifier!}"`)
			if (this.specialization.compare !== "none") {
				tooltip.push(LocalizeGURPS.translations.gurps.prereqs.skill.specialization)
				tooltip.push(LocalizeGURPS.translations.gurps.prereqs.criteria[this.specialization.compare])
				tooltip.push(`"${this.specialization.qualifier!}"`)
			}
			if (!tech_level) {
				tooltip.push(LocalizeGURPS.translations.gurps.prereqs.skill.level)
				tooltip.push(LocalizeGURPS.translations.gurps.prereqs.criteria[this.level.compare])
				if (this.level?.compare !== NumericComparisonType.AnyNumber)
					tooltip.push(((this.level ? this.level.qualifier : 0) ?? 0).toString())
			} else {
				if (this.specialization.compare !== StringComparisonType.AnyString) {
					tooltip.push(",")
				}
				tooltip.push(LocalizeGURPS.translations.gurps.prereqs.skill.level)
				tooltip.push(LocalizeGURPS.translations.gurps.prereqs.criteria[this.level.compare])
				if (this.level?.compare !== NumericComparisonType.AnyNumber)
					tooltip.push(((this.level ? this.level.qualifier : 0) ?? 0).toString())
				tooltip.push(LocalizeGURPS.translations.gurps.prereqs.skill.tech_level)
			}
		}
		return [satisfied, false]
	}
}
