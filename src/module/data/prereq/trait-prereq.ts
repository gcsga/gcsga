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
			notes: new StringCriteriaField({
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
