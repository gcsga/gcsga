import { BasePrereq, BasePrereqSchema } from "./base-prereq.ts"
import { prereq } from "@util/enum/prereq.ts"
import { ActorType, ItemType } from "@module/data/constants.ts"
import { LocalizeGURPS, NumericComparison, StringComparison, TooltipGURPS } from "@util"
import { ItemGURPS2 } from "@module/documents/item.ts"
import { ActorInst } from "../actor/helpers.ts"
import { Nameable } from "@module/util/index.ts"
import { NumericCriteriaField } from "../item/fields/numeric-criteria-field.ts"
import { StringCriteriaField } from "../item/fields/string-criteria-field.ts"
import { BooleanSelectField } from "../item/fields/boolean-select-field.ts"

class SkillPrereq extends BasePrereq<SkillPrereqSchema> {
	static override TYPE = prereq.Type.Skill

	static override defineSchema(): SkillPrereqSchema {
		return {
			...super.defineSchema(),
			has: new BooleanSelectField({
				required: true,
				nullable: false,
				choices: {
					true: "GURPS.Item.Prereqs.FIELDS.Has.Choices.true",
					false: "GURPS.Item.Prereqs.FIELDS.Has.Choices.false",
				},
				initial: true,
			}),
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
		let techLevel: string | null = null
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

	override toFormElement(): HTMLElement {
		const prefix = `system.prereqs.${this.index}`

		// Root element
		const element = super.toFormElement()

		// Name
		const rowElement1 = document.createElement("div")
		rowElement1.classList.add("form-fields", "secondary")
		rowElement1.append(
			this.schema.fields.name.fields.compare.toInput({
				name: `${prefix}.name.compare`,
				value: this.name.compare,
				localize: true,
			}) as HTMLElement,
		)
		rowElement1.append(
			this.schema.fields.name.fields.qualifier.toInput({
				name: `${prefix}.name.qualifier`,
				value: this.name.qualifier,
			}) as HTMLElement,
		)
		element.append(rowElement1)

		// Notes
		const rowElement2 = document.createElement("div")
		rowElement2.classList.add("form-fields", "secondary")
		rowElement2.append(
			this.schema.fields.specialization.fields.compare.toInput({
				name: `${prefix}.specialization.compare`,
				value: this.specialization.compare,
				localize: true,
			}) as HTMLElement,
		)
		rowElement2.append(
			this.schema.fields.specialization.fields.qualifier.toInput({
				name: `${prefix}.specialization.qualifier`,
				value: this.specialization.qualifier,
			}) as HTMLElement,
		)
		element.append(rowElement2)

		// Level
		const rowElement3 = document.createElement("div")
		rowElement3.classList.add("form-fields", "secondary")
		rowElement3.append(
			this.schema.fields.level.fields.compare.toInput({
				name: `${prefix}.level.compare`,
				value: this.level.compare,
				localize: true,
			}) as HTMLElement,
		)
		rowElement3.append(
			this.schema.fields.level.fields.qualifier.toInput({
				name: `${prefix}.level.qualifier`,
				value: this.level.qualifier.toString(),
			}) as HTMLElement,
		)
		element.append(rowElement3)

		return element
	}

	fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void {
		Nameable.extract(this.name.qualifier, m, existing)
		Nameable.extract(this.specialization.qualifier, m, existing)
	}
}

interface SkillPrereq extends BasePrereq<SkillPrereqSchema>, ModelPropsFromSchema<SkillPrereqSchema> {}

type SkillPrereqSchema = BasePrereqSchema & {
	has: BooleanSelectField<boolean, boolean, true, false, true>
	name: StringCriteriaField<true, false, true>
	level: NumericCriteriaField<true, false, true>
	specialization: StringCriteriaField<true, false, true>
}

export { SkillPrereq, type SkillPrereqSchema }
