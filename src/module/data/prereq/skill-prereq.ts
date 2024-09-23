import fields = foundry.data.fields
import { BasePrereq, BasePrereqSchema } from "./base-prereq.ts"
import { prereq } from "@util/enum/prereq.ts"
import { ActorType, ItemType } from "@module/data/constants.ts"
import { LocalizeGURPS, NumericComparison, StringComparison, TooltipGURPS } from "@util"
import { ItemGURPS2 } from "@module/document/item.ts"
import { ActorInst } from "../actor/helpers.ts"
import { Nameable } from "@module/util/index.ts"
import { NumericCriteriaField } from "../item/fields/numeric-criteria-field.ts"
import { StringCriteriaField } from "../item/fields/string-criteria-field.ts"

class SkillPrereq extends BasePrereq<SkillPrereqSchema> {
	static override TYPE = prereq.Type.Skill

	static override defineSchema(): SkillPrereqSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({ required: true, nullable: false, blank: false, initial: prereq.Type.Skill }),
			has: new fields.BooleanField({ initial: true }),
			name: new StringCriteriaField({
				required: true,
				nullable: false,
				initial: {
					compare: StringComparison.Option.IsString,
					qualifier: "",
				},
			}),
			level: new NumericCriteriaField({
				required: true,
				nullable: false,
				initial: {
					compare: NumericComparison.Option.AtLeastNumber,
					qualifier: 0,
				},
			}),
			specialization: new StringCriteriaField({
				required: true,
				nullable: false,
				initial: {
					compare: StringComparison.Option.AnyString,
					qualifier: "",
				},
			}),
		}
	}

	satisfied(actor: ActorInst<ActorType.Character>, exclude: unknown, tooltip: TooltipGURPS | null): boolean {
		let replacements = new Map<string, string>()
		if (Nameable.isAccesser(exclude)) replacements = exclude.nameableReplacements
		let satisfied = false
		let techLevel = ""
		if (exclude instanceof ItemGURPS2 && exclude.isOfType(ItemType.Skill, ItemType.Technique)) {
			techLevel = exclude.system.tech_level
		}
		for (const sk of actor.itemCollections.skills) {
			if (sk.isOfType(ItemType.SkillContainer)) continue
			if (
				exclude === sk ||
				!this.name.matches(replacements, sk.system.nameWithReplacements) ||
				!this.specialization.matches(replacements, sk.system.specializationWithReplacements)
			)
				continue
			satisfied = this.level.matches(sk.system.level.level)
			if (satisfied && techLevel !== "") {
				satisfied = sk.system.tech_level !== "" || techLevel === sk.system.tech_level
			}
			if (satisfied) break
		}
		if (this.has) satisfied = !satisfied

		if (!satisfied && tooltip !== null) {
			tooltip.push(LocalizeGURPS.translations.GURPS.Tooltip.Prefix)
			const specialization =
				this.specialization.compare === StringComparison.Option.AnyString
					? ""
					: LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Prereq.Skill.Specialization, {
							value: this.specialization.toString(replacements),
						})
			const level =
				techLevel === ""
					? LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Prereq.Skill.LevelNoTL, {
							value: this.level.toString(),
						})
					: LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Prereq.Skill.LevelWithTL, {
							value: this.level.toString(),
						})
			tooltip.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Prereq.Skill.Base, {
					has: this.hasText,
					name: this.name.toString(replacements),
					specialization,
					level,
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
	name: StringCriteriaField<true, false, true>
	level: NumericCriteriaField<true, false, true>
	specialization: StringCriteriaField<true, false, true>
}

export { SkillPrereq, type SkillPrereqSchema }
