import { NumericCompareType, NumericCriteria, StringCompareType, StringCriteria } from "@util"
import { BasePrereq, BasePrereqObj } from "./base"
import { prereq } from "@util/enum"
import { CharacterGURPS } from "@actor"
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
		if (data.name)
			prereq.name = new StringCriteria(data.name.compare, data.name.qualifier)
		if (data.level)
			prereq.level = new NumericCriteria(data.level.compare, data.level.qualifier)
		if (data.notes)
			prereq.notes = new StringCriteria(data.notes.compare, data.notes.qualifier)
		return prereq
	}

	satisfied(
		character: CharacterGURPS,
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
			// TODO: satisfied notes
		}
		return satisfied
	}


	// satisfied(actor: ActorGURPS, exclude: any, tooltip: TooltipGURPS): [boolean, boolean] {
	// 	let satisfied = false
	// 	if (!actor.traits) return [true, false]
	// 	actor.traits.forEach((t: any) => {
	// 		if (exclude === t || !stringCompare(t.name, this.name)) return // [false, false]
	// 		let notes = t.notes
	// 		const mod_notes = t.modifierNotes
	// 		if (mod_notes) notes += `\n${mod_notes}`
	// 		if (!stringCompare(notes, this.notes)) return // [false, false]
	// 		satisfied = numberCompare(Math.max(0, t.levels), this.level)
	// 	})
	// 	if (!this.has) satisfied = !satisfied
	// 	if (!satisfied) {
	// 		tooltip.push(LocalizeGURPS.translations.gurps.prereqs.has[this.has ? "true" : "false"])
	// 		tooltip.push(LocalizeGURPS.translations.gurps.prereqs.trait.name)
	// 		tooltip.push(LocalizeGURPS.translations.gurps.prereqs.criteria[this.name!.compare])
	// 		if (this.name && this.name.compare !== StringComparisonType.AnyString)
	// 			tooltip.push(`"${this.name!.qualifier}"`)
	// 		if (this.notes!.compare !== StringComparisonType.AnyString) {
	// 			tooltip.push(LocalizeGURPS.translations.gurps.prereqs.trait.notes)
	// 			tooltip.push(LocalizeGURPS.translations.gurps.prereqs.criteria[this.notes!.compare])
	// 			tooltip.push(`"${this.notes!.qualifier}"`)
	// 		}

	// 		tooltip.push(LocalizeGURPS.translations.gurps.prereqs.trait.level)
	// 		tooltip.push(LocalizeGURPS.translations.gurps.prereqs.criteria[this.level!.compare])
	// 		if (this.level!.compare !== NumericComparisonType.AnyNumber)
	// 			tooltip.push(((this.level ? this.level.qualifier : 0) ?? 0).toString())
	// 	}
	// 	return [satisfied, false]
	// }
}
