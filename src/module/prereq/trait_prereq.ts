import { CharacterResolver, LocalizeGURPS, NumericCompareType, NumericCriteria, StringCompareType, StringCriteria } from "@util"
import { BasePrereq, BasePrereqObj } from "./base"
import { prereq } from "@util/enum"
import { TooltipGURPS } from "@module/tooltip"

export interface TraitPrereqObj extends BasePrereqObj {
	name: StringCriteria
	level: NumericCriteria
	notes: StringCriteria
}

export class TraitPrereq extends BasePrereq {
	type = prereq.Type.Trait

	name: StringCriteria

	level: NumericCriteria

	notes: StringCriteria

	constructor() {
		super(prereq.Type.Trait)
		this.name = new StringCriteria(StringCompareType.IsString)
		this.notes = new StringCriteria(StringCompareType.AnyString)
		this.level = new NumericCriteria(NumericCompareType.AtLeastNumber)
	}

	static fromObject(data: TraitPrereqObj): TraitPrereq {
		const prereq = new TraitPrereq()
		prereq.has = data.has
		if (data.name)
			prereq.name = new StringCriteria(data.name.compare, data.name.qualifier)
		if (data.level)
			prereq.level = new NumericCriteria(data.level.compare, data.level.qualifier)
		if (data.notes)
			prereq.notes = new StringCriteria(data.notes.compare, data.notes.qualifier)
		return prereq
	}

	satisfied(
		character: CharacterResolver,
		exclude: any,
		tooltip: TooltipGURPS
	): boolean {
		let satisfied = false
		for (const t of character.traits) {
			if (exclude === t || !this.name.matches(t.name ?? "")) continue
			let notes = t.system.notes
			if (t.modifierNotes !== "") notes += `\n${t.modifierNotes}`
			if (!this.notes.matches(notes)) continue
			let levels = 0
			if (t.isLeveled)
				levels = Math.max(t.levels, 0)
			satisfied = this.level.matches(levels)
		}
		if (!this.has) satisfied = !satisfied
		if (!satisfied) {
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.prefix)
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.has[this.has ? "true" : "false"])
			tooltip.push(
				LocalizeGURPS.format(
					LocalizeGURPS.translations.gurps.prereq.trait.name, { content: this.name.describe() }
				))
			if (this.notes.compare !== StringCompareType.AnyString) {
				tooltip.push(
					LocalizeGURPS.format(
						LocalizeGURPS.translations.gurps.prereq.trait.notes, { content: this.notes.describe() }
					))
			}
			tooltip.push(
				LocalizeGURPS.format(
					LocalizeGURPS.translations.gurps.prereq.trait.level, { content: this.level.describe() }
				))
		}
		return satisfied
	}
}
