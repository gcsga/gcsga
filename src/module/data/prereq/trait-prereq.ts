import { BasePrereq, BasePrereqSchema } from "./base-prereq.ts"
import fields = foundry.data.fields
import { LocalizeGURPS, TooltipGURPS, prereq } from "@util"
import { ActorType, NumericCompareType, StringCompareType } from "@module/data/constants.ts"
import { NumericCriteria } from "@module/util/numeric-criteria.ts"
import { Nameable, StringCriteria } from "@module/util/index.ts"
import { ActorInst } from "../actor/helpers.ts"

class TraitPrereq extends BasePrereq<TraitPrereqSchema> {
	static override TYPE = prereq.Type.Trait

	static override defineSchema(): TraitPrereqSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({ required: true, nullable: false, blank: false, initial: prereq.Type.Trait }),
			has: new fields.BooleanField({ initial: true }),
			name: new fields.EmbeddedDataField(StringCriteria, {
				required: true,
				nullable: false,
				initial: {
					compare: StringCompareType.IsString,
					qualifier: "",
				},
			}),
			level: new fields.EmbeddedDataField(NumericCriteria, {
				required: true,
				nullable: false,
				initial: {
					compare: NumericCompareType.AtLeastNumber,
					qualifier: 0,
				},
			}),
			notes: new fields.EmbeddedDataField(StringCriteria, {
				required: true,
				nullable: false,
				initial: {
					compare: StringCompareType.AnyString,
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
				this.notes.compare === StringCompareType.AnyString
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
	has: fields.BooleanField
	name: fields.EmbeddedDataField<StringCriteria, true, false, true>
	level: fields.EmbeddedDataField<NumericCriteria, true, false, true>
	notes: fields.EmbeddedDataField<StringCriteria, true, false, true>
}

export { TraitPrereq, type TraitPrereqSchema }
