import { BasePrereq, BasePrereqSchema } from "./base-prereq.ts"
import { LocalizeGURPS, NumericComparison, StringComparison, TooltipGURPS, prereq } from "@util"
import { ActorType } from "@module/data/constants.ts"
import { ActorInst } from "../actor/helpers.ts"
import { NumericCriteriaField } from "../item/fields/numeric-criteria-field.ts"
import { StringCriteriaField } from "../item/fields/string-criteria-field.ts"
import { Nameable } from "@module/util/nameable.ts"
import { BooleanSelectField } from "../item/fields/boolean-select-field.ts"

class TraitPrereq extends BasePrereq<TraitPrereqSchema> {
	static override TYPE = prereq.Type.Trait

	static override defineSchema(): TraitPrereqSchema {
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
				choices: StringComparison.CustomOptionsChoices("GURPS.Item.Prereqs.FIELDS.Trait.Name"),
				initial: {
					compare: StringComparison.Option.IsString,
					qualifier: "",
				},
			}),
			level: new NumericCriteriaField({
				required: true,
				nullable: false,
				choices: NumericComparison.CustomOptionsChoices("GURPS.Item.Prereqs.FIELDS.Trait.Level"),
				initial: {
					compare: NumericComparison.Option.AtLeastNumber,
					qualifier: 0,
				},
			}),
			notes: new StringCriteriaField({
				required: true,
				nullable: false,
				choices: StringComparison.CustomOptionsChoices("GURPS.Item.Prereqs.FIELDS.Trait.Notes"),
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
		for (const t of actor.itemCollections.traits) {
			if (exclude === t || this.name.matches(replacements, t.system.nameWithReplacements)) continue
			let notes = t.system.processedNotes
			const modNotes = t.system.modifierNotes
			if (modNotes !== "") notes += "\n" + modNotes
			if (!this.notes.matches(replacements, notes)) continue
			let levels = 0
			if (t.system.isLeveled) levels = Math.max(t.system.levels, 0)
			satisfied = this.level.matches(levels)
			if (satisfied) break
		}
		if (!this.has) satisfied = !satisfied

		if (!satisfied && tooltip !== null) {
			tooltip.push(LocalizeGURPS.translations.GURPS.Tooltip.Prefix)
			const notes =
				this.notes.compare === StringComparison.Option.AnyString
					? ""
					: LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Prereq.Trait.Notes, {
							value: this.notes.toString(replacements),
						})
			tooltip.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Prereq.Trait.Base, {
					has: this.hasText,
					name: this.name.toString(replacements),
					notes,
					level: this.level.toString(),
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
		rowElement1.classList.add("form-fields")
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
		rowElement2.classList.add("form-fields")
		rowElement2.append(
			this.schema.fields.notes.fields.compare.toInput({
				name: `${prefix}.notes.compare`,
				value: this.notes.compare,
				localize: true,
			}) as HTMLElement,
		)
		rowElement2.append(
			this.schema.fields.notes.fields.qualifier.toInput({
				name: `${prefix}.notes.qualifier`,
				value: this.notes.qualifier,
			}) as HTMLElement,
		)
		element.append(rowElement2)

		// Level
		const rowElement3 = document.createElement("div")
		rowElement3.classList.add("form-fields")
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
		Nameable.extract(this.notes.qualifier, m, existing)
	}
}

interface TraitPrereq extends BasePrereq<TraitPrereqSchema>, ModelPropsFromSchema<TraitPrereqSchema> {}

type TraitPrereqSchema = BasePrereqSchema & {
	has: BooleanSelectField<boolean, boolean, true, false, true>
	name: StringCriteriaField<true, false, true>
	level: NumericCriteriaField<true, false, true>
	notes: StringCriteriaField<true, false, true>
}

export { TraitPrereq, type TraitPrereqSchema }
