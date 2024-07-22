import { StringCriteria } from "@util/string-criteria.ts"
import { BasePrereq } from "./base.ts"
import { prereq } from "@util/enum/prereq.ts"
import { NumericCriteria } from "@util/numeric-criteria.ts"
import { SkillPrereqSchema } from "./data.ts"
import { ActorType, ItemType, NumericCompareType, StringCompareType } from "@module/data/constants.ts"
import { ActorGURPS } from "@actor"
import { LocalizeGURPS, TooltipGURPS } from "@util"
import { ItemGURPS } from "@item"

class SkillPrereq extends BasePrereq<SkillPrereqSchema> {

	constructor(data: DeepPartial<SourceFromSchema<SkillPrereqSchema>>) {
		super(data)
		this.name = new StringCriteria(data.name ?? undefined)
		this.level = new NumericCriteria(data.level ?? undefined)
		this.specialization = new StringCriteria(data.specialization ?? undefined)
	}

	static override defineSchema(): SkillPrereqSchema {
		const fields = foundry.data.fields

		return {
			type: new fields.StringField({ initial: prereq.Type.Skill }),
			has: new fields.BooleanField({ initial: true }),
			name: new fields.SchemaField(StringCriteria.defineSchema(), {
				initial: {
					compare: StringCompareType.IsString,
					qualifier: ""
				}
			}),
			level: new fields.SchemaField(NumericCriteria.defineSchema(), {
				initial: {
					compare: NumericCompareType.AtLeastNumber,
					qualifier: 0
				}
			}),
			specialization: new fields.SchemaField(StringCriteria.defineSchema(), {
				initial: {
					compare: StringCompareType.AnyString,
					qualifier: ""
				}
			}),
		}
	}

	satisfied(actor: ActorGURPS, exclude: unknown, tooltip: TooltipGURPS): boolean {
		if (actor.isOfType(ActorType.Loot)) return true
		let satisfied = false
		let techLevel = ""
		if (exclude instanceof ItemGURPS && exclude.isOfType(ItemType.Skill, ItemType.Technique)) {
			techLevel = exclude.techLevel
		}
		for (const sk of actor.itemCollections.skills) {
			if (sk.isOfType(ItemType.SkillContainer)) continue

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

interface SkillPrereq extends BasePrereq<SkillPrereqSchema>, Omit<ModelPropsFromSchema<SkillPrereqSchema>, "name" | "level" | "specialization"> {
	name: StringCriteria
	level: NumericCriteria
	specialization: StringCriteria
}

export { SkillPrereq }
