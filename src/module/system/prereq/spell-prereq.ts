import { prereq } from "@util/enum/prereq.ts"
import { BasePrereq } from "./base.ts"
import { spellcmp } from "@util/enum/spellcmp.ts"
import { StringCriteria } from "@util/string-criteria.ts"
import { NumericCriteria } from "@util/numeric-criteria.ts"
import { SpellPrereqSchema } from "./data.ts"
import { ItemGURPS } from "@item"
import { ActorType, ItemType, NumericCompareType, StringCompareType } from "@data"
import { LocalizeGURPS, TooltipGURPS } from "@util"
import { ActorGURPS } from "@actor"

class SpellPrereq extends BasePrereq<SpellPrereqSchema> {

	constructor(data: DeepPartial<SourceFromSchema<SpellPrereqSchema>>) {
		super(data)
		this.qualifier = new StringCriteria(data.qualifier ?? undefined)
		this.quantity = new NumericCriteria(data.quantity ?? undefined)
	}

	static override defineSchema(): SpellPrereqSchema {
		const fields = foundry.data.fields

		return {
			type: new fields.StringField({ initial: prereq.Type.Spell }),
			has: new fields.BooleanField({ initial: true }),
			sub_type: new fields.StringField({ choices: spellcmp.Types, initial: spellcmp.Type.Name }),
			qualifier: new fields.SchemaField(StringCriteria.defineSchema(), {
				initial: {
					compare: StringCompareType.IsString,
					qualifier: ""
				}
			}),
			quantity: new fields.SchemaField(NumericCriteria.defineSchema(), {
				initial: {
					compare: NumericCompareType.AtLeastNumber,
					qualifier: 0
				}
			}),
		}
	}

	satisfied(actor: ActorGURPS, exclude: unknown, tooltip: TooltipGURPS): boolean {
		if (actor.isOfType(ActorType.Loot)) return true
		let count = 0
		const colleges: Set<string> = new Set()
		let techLevel = ""
		if (exclude instanceof ItemGURPS && exclude.isOfType(ItemType.Spell, ItemType.RitualMagicSpell)) {
			techLevel = exclude.techLevel
		}
		for (const sp of actor.itemCollections.spells) {
			if (sp.isOfType(ItemType.SpellContainer)) continue
			if (exclude === sp || sp.points === 0) continue
			if (techLevel !== "" && sp.techLevel !== "" && techLevel !== sp.techLevel) continue
			switch (this.sub_type) {
				case spellcmp.Type.Name:
					if (this.qualifier.matches(sp.name ?? "")) count += 1
					break
				case spellcmp.Type.Tag:
					for (const one of sp.tags) {
						if (this.qualifier.matches(one ?? "")) {
							count += 1
							break
						}
					}
					break
				case spellcmp.Type.College:
					for (const one of sp.college) {
						if (this.qualifier.matches(one ?? "")) {
							count += 1
							break
						}
					}
					break
				case spellcmp.Type.CollegeCount:
					for (const one of sp.college) colleges.add(one)
					break
				case spellcmp.Type.Any:
					count += 1
			}
			if (this.sub_type === spellcmp.Type.CollegeCount) count = colleges.size
		}
		let satisfied = this.quantity.matches(count)
		if (!this.has) satisfied = !satisfied
		if (!satisfied) {
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.prefix)
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.has[this.has ? "true" : "false"])
			if (this.sub_type === spellcmp.Type.CollegeCount) {
				tooltip.push(
					LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.spell[this.sub_type], {
						content: this.quantity.describe(),
					}),
				)
			} else {
				tooltip.push(this.quantity.describe())
				if (this.quantity.qualifier === 1)
					tooltip.push(
						LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.spell.singular[this.sub_type], {
							content: this.qualifier.describe(),
						}),
					)
				tooltip.push(
					LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.spell.multiple[this.sub_type], {
						content: this.qualifier.describe(),
					}),
				)
			}
		}
		return satisfied
	}


}

interface SpellPrereq extends BasePrereq<SpellPrereqSchema>, Omit<ModelPropsFromSchema<SpellPrereqSchema>, "quantity" | "qualifier"> {
	quantity: NumericCriteria
	qualifier: StringCriteria
}

export { SpellPrereq }
