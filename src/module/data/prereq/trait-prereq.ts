import { BasePrereq, BasePrereqSchema, PrereqConstructionOptions } from "./base-prereq.ts"
import fields = foundry.data.fields
import { LocalizeGURPS, TooltipGURPS, prereq } from "@util"
import { ActorType, ItemType, NumericCompareType, StringCompareType } from "@module/data/constants.ts"
import { NumericCriteria, NumericCriteriaSchema } from "@module/util/numeric-criteria.ts"
import { StringCriteria, StringCriteriaSchema } from "@module/util/index.ts"
import { Nameable } from "@module/util/nameable.ts"
import { ActorInst } from "../actor/helpers.ts"

class TraitPrereq extends BasePrereq<TraitPrereqSchema> {
	static override TYPE = prereq.Type.Trait

	static override defineSchema(): TraitPrereqSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({ required: true, nullable: false, blank: false, initial: prereq.Type.Trait }),
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
			notes: new fields.SchemaField(StringCriteria.defineSchema(), {
				initial: {
					compare: StringCompareType.AnyString,
					qualifier: "",
				},
			}),
		}
	}

	satisfied(actor: ActorInst<ActorType.Character>, exclude: unknown, tooltip: TooltipGURPS): boolean {
		if (actor.isOfType(ActorType.Loot)) return true
		let satisfied = false
		for (const t of actor.itemTypes[ItemType.Trait]) {
			if (exclude === t || !this.name.matches(t.name ?? "")) continue
			let notes = t.system.notes
			if (t.modifierNotes !== "") notes += `\n${t.modifierNotes}`
			if (!this.notes.matches(notes)) continue
			let levels = 0
			if (t.isLeveled) levels = Math.max(t.levels, 0)
			satisfied = this.level.matches(levels)
		}
		if (!this.has) satisfied = !satisfied
		if (!satisfied) {
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.prefix)
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.has[this.has ? "true" : "false"])
			tooltip.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.trait.name, {
					content: this.name.describe(),
				}),
			)
			if (this.notes.compare !== StringCompareType.AnyString) {
				tooltip.push(
					LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.trait.notes, {
						content: this.notes.describe(),
					}),
				)
			}
			tooltip.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.trait.level, {
					content: this.level.describe(),
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
	name: fields.SchemaField<StringCriteriaSchema, SourceFromSchema<StringCriteriaSchema>, StringCriteria>
	level: fields.SchemaField<NumericCriteriaSchema, SourceFromSchema<NumericCriteriaSchema>, NumericCriteria>
	notes: fields.SchemaField<StringCriteriaSchema, SourceFromSchema<StringCriteriaSchema>, StringCriteria>
}

export { TraitPrereq, type TraitPrereqSchema }
