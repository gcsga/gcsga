import { StringCriteria } from "@util/string-criteria.ts"
import { BasePrereq } from "./base.ts"
import { NumericCriteria } from "@util/numeric-criteria.ts"
import { LocalizeGURPS, TooltipGURPS, prereq } from "@util"
import { ActorGURPS } from "@actor"
import { ActorType, ItemType, NumericCompareType, StringCompareType } from "@module/data/constants.ts"
import { TraitPrereqSchema } from "./data.ts"

class TraitPrereq extends BasePrereq<TraitPrereqSchema> {

	constructor(data: DeepPartial<SourceFromSchema<TraitPrereqSchema>>) {
		super(data)
		this.name = new StringCriteria(data.name ?? undefined)
		this.level = new NumericCriteria(data.level ?? undefined)
		this.notes = new StringCriteria(data.notes ?? undefined)
	}

	static override defineSchema(): TraitPrereqSchema {
		const fields = foundry.data.fields

		return {
			type: new fields.StringField({ initial: prereq.Type.Trait }),
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
			notes: new fields.SchemaField(StringCriteria.defineSchema(), {
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

}

interface TraitPrereq extends BasePrereq<TraitPrereqSchema>, Omit<ModelPropsFromSchema<TraitPrereqSchema>, "name" | "level" | "notes"> {
	name: StringCriteria
	level: NumericCriteria
	notes: StringCriteria
}

export { TraitPrereq }
