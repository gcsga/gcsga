import { StringCriteria, StringCriteriaSchema } from "@module/util/string-criteria.ts"
import fields = foundry.data.fields
import { BasePrereq, BasePrereqSchema, PrereqConstructionOptions } from "./base-prereq.ts"
import { prereq } from "@util/enum/prereq.ts"
import { ActorType, ItemType, NumericCompareType, StringCompareType } from "@module/data/constants.ts"
import { LocalizeGURPS, TooltipGURPS } from "@util"
import { NumericCriteria, NumericCriteriaSchema } from "@module/util/numeric-criteria.ts"
import { Nameable } from "@module/util/nameable.ts"
import { ActorGURPS2 } from "@module/document/actor.ts"
import { ItemGURPS2 } from "@module/document/item.ts"

class SkillPrereq extends BasePrereq<SkillPrereqSchema> {
	static override TYPE = prereq.Type.Skill

	static override defineSchema(): SkillPrereqSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({ required: true, nullable: false, blank: false, initial: prereq.Type.Skill }),
			has: new fields.BooleanField({ initial: true }),
			name: new fields.SchemaField(StringCriteria.defineSchema(), {
				initial: {
					compare: StringCompareType.IsString,
					qualifier: "",
				},
			}),
			level: new fields.SchemaField(NumericCriteria.defineSchema(), {
				initial: {
					compare: NumericCompareType.AtLeastNumber,
					qualifier: 0,
				},
			}),
			specialization: new fields.SchemaField(StringCriteria.defineSchema(), {
				initial: {
					compare: StringCompareType.AnyString,
					qualifier: "",
				},
			}),
		}
	}

	satisfied(actor: ActorGURPS2, exclude: unknown, tooltip: TooltipGURPS): boolean {
		if (!actor.isOfType(ActorType.Character)) return true
		let satisfied = false
		let techLevel = ""
		if (exclude instanceof ItemGURPS2 && exclude.isOfType(ItemType.Skill, ItemType.Technique)) {
			techLevel = exclude.system.tech_level ?? ""
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

	fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void {
		Nameable.extract(this.name.qualifier, m, existing)
		Nameable.extract(this.specialization.qualifier, m, existing)
	}
}

interface SkillPrereq extends BasePrereq<SkillPrereqSchema>, ModelPropsFromSchema<SkillPrereqSchema> {}

type SkillPrereqSchema = BasePrereqSchema & {
	has: fields.BooleanField
	name: fields.SchemaField<StringCriteriaSchema, SourceFromSchema<StringCriteriaSchema>, StringCriteria>
	level: fields.SchemaField<NumericCriteriaSchema, SourceFromSchema<NumericCriteriaSchema>, NumericCriteria>
	specialization: fields.SchemaField<StringCriteriaSchema, SourceFromSchema<StringCriteriaSchema>, StringCriteria>
}

export { SkillPrereq, type SkillPrereqSchema }
