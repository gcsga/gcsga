import { BasePrereq, BasePrereqSchema } from "./base-prereq.ts"
import { prereq } from "@util/enum/prereq.ts"
import { ActorType, ItemType } from "@module/data/constants.ts"
import { NumericComparison, StringComparison, TooltipGURPS } from "@util"
import { ItemGURPS2 } from "@module/documents/item.ts"
import { ActorInst } from "../actor/helpers.ts"
import { Nameable } from "@module/util/index.ts"
import { NumericCriteriaField } from "../item/fields/numeric-criteria-field.ts"
import { createDummyElement } from "@module/applications/helpers.ts"
import { ReplaceableStringCriteriaField } from "../item/fields/replaceable-string-criteria-field.ts"

class SkillPrereq extends BasePrereq<SkillPrereqSchema> {
	static override TYPE = prereq.Type.Skill

	static override defineSchema(): SkillPrereqSchema {
		return {
			...super.defineSchema(),
			name: new ReplaceableStringCriteriaField({
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
			specialization: new ReplaceableStringCriteriaField({
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
			tooltip.push(game.i18n.localize("GURPS.Tooltip.Prefix"))
			const specialization =
				this.specialization.compare === StringComparison.Option.AnyString
					? ""
					: game.i18n.format("GURPS.Prereq.Skill.Specialization", {
							value: this.specialization.toString(replacements),
						})
			const level =
				techLevel === ""
					? game.i18n.format("GURPS.Prereq.Skill.LevelNoTL", {
							value: this.level.toString(),
						})
					: game.i18n.format("GURPS.Prereq.Skill.LevelWithTL", {
							value: this.level.toString(),
						})
			tooltip.push(
				game.i18n.format("GURPS.Prereq.Skill.Base", {
					has: this.hasText,
					name: this.name.toString(replacements),
					specialization,
					level,
				}),
			)
		}
		return satisfied
	}

	override toFormElement(enabled: boolean): HTMLElement {
		const prefix = `system.prereqs.${this.index}`
		const replacements = this.nameableReplacements

		// Root element
		const element = super.toFormElement(enabled)

		if (!enabled) {
			element.append(createDummyElement(`${prefix}.name.compare`, this.name.compare))
			element.append(createDummyElement(`${prefix}.name.qualifier`, this.name.qualifier))
			element.append(createDummyElement(`${prefix}.specialization.compare`, this.specialization.compare))
			element.append(createDummyElement(`${prefix}.specialization.qualifier`, this.specialization.qualifier))
			element.append(createDummyElement(`${prefix}.level.compare`, this.level.compare))
			element.append(createDummyElement(`${prefix}.level.qualifier`, this.level.qualifier))
		}

		// Name
		const rowElement1 = document.createElement("div")
		rowElement1.classList.add("form-fields", "secondary")
		rowElement1.append(
			this.schema.fields.name.fields.compare.toInput({
				name: enabled ? `${prefix}.name.compare` : "",
				value: this.name.compare,
				localize: true,
				disabled: !enabled,
			}) as HTMLElement,
		)
		rowElement1.append(
			this.schema.fields.name.fields.qualifier.toInput({
				name: enabled ? `${prefix}.name.qualifier` : "",
				value: this.name.qualifier,
				disabled: !enabled,
				replacements,
			}) as HTMLElement,
		)
		element.append(rowElement1)

		// Notes
		const rowElement2 = document.createElement("div")
		rowElement2.classList.add("form-fields", "secondary")
		rowElement2.append(
			this.schema.fields.specialization.fields.compare.toInput({
				name: enabled ? `${prefix}.specialization.compare` : "",
				value: this.specialization.compare,
				localize: true,
				disabled: !enabled,
			}) as HTMLElement,
		)
		rowElement2.append(
			this.schema.fields.specialization.fields.qualifier.toInput({
				name: enabled ? `${prefix}.specialization.qualifier` : "",
				value: this.specialization.qualifier,
				disabled: !enabled,
				replacements,
			}) as HTMLElement,
		)
		element.append(rowElement2)

		// Level
		const rowElement3 = document.createElement("div")
		rowElement3.classList.add("form-fields", "secondary")
		rowElement3.append(
			this.schema.fields.level.fields.compare.toInput({
				name: enabled ? `${prefix}.level.compare` : "",
				value: this.level.compare,
				localize: true,
				disabled: !enabled,
			}) as HTMLElement,
		)
		rowElement3.append(
			this.schema.fields.level.fields.qualifier.toInput({
				name: enabled ? `${prefix}.level.qualifier` : "",
				value: this.level.qualifier.toString(),
				disabled: !enabled,
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
	name: ReplaceableStringCriteriaField<true, false, true>
	level: NumericCriteriaField<true, false, true>
	specialization: ReplaceableStringCriteriaField<true, false, true>
}

export { SkillPrereq, type SkillPrereqSchema }
