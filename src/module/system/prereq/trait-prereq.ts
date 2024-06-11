import { StringCompareType, StringCriteria } from "@util/string-criteria.ts"
import { BasePrereq } from "./base.ts"
import { NumericCompareType, NumericCriteria } from "@util/numeric-criteria.ts"
import { prereq } from "@util/enum/prereq.ts"
import { TraitPrereqObj } from "./data.ts"
import { LocalizeGURPS, TooltipGURPS } from "@util"
import { ActorGURPS } from "@actor"
import { ActorType, ItemType } from "@module/data/constants.ts"

export class TraitPrereq extends BasePrereq<prereq.Type.Trait> {
	name: StringCriteria

	level: NumericCriteria

	notes: StringCriteria

	constructor() {
		super(prereq.Type.Trait)
		this.name = new StringCriteria({ compare: StringCompareType.IsString })
		this.notes = new StringCriteria({ compare: StringCompareType.AnyString })
		this.level = new NumericCriteria({ compare: NumericCompareType.AtLeastNumber })
	}

	static fromObject(data: TraitPrereqObj): TraitPrereq {
		const prereq = new TraitPrereq()
		prereq.has = data.has
		if (data.name) prereq.name = new StringCriteria(data.name)
		if (data.level) prereq.level = new NumericCriteria(data.level)
		if (data.notes) prereq.notes = new StringCriteria(data.notes)
		return prereq
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

	override toObject(): TraitPrereqObj {
		return {
			...super.toObject(),
			has: this.has,
			name: this.name.toObject(),
			notes: this.notes.toObject(),
			level: this.level.toObject(),
		}
	}
}
