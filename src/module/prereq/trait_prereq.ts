import { ActorGURPS } from "@module/config"
import { TooltipGURPS } from "@module/tooltip"
import { LocalizeGURPS, StringCompareType, StringCriteria, numberCompare } from "@util"
import { BasePrereq, PrereqConstructionContext } from "./base"
import { NumericComparisonType, NumericCriteria, PrereqType, } from "@module/data"

export class TraitPrereq extends BasePrereq {
	type = PrereqType.Trait

	name?: StringCriteria

	level?: NumericCriteria

	notes?: StringCriteria

	// constructor(data: TraitPrereq | any, context: PrereqConstructionContext = {}) {
	// 	data = mergeObject(TraitPrereq.defaults, data)
	// 	super(data, context)
	// }

	constructor() {
		super()
		this.name = new StringCriteria(StringCompareType.IsString)
		this.notes = new StringCriteria(StringCompareType.AnyString)
		this.level = new StringCriteria(StringCompareType.IsString)
	}

	// static get defaults(): Record<string, any> {
	// 	return mergeObject(super.defaults, {
	// 		type: PrereqType.Trait,
	// 		name: { compare: StringComparisonType.IsString, qualifier: "" },
	// 		notes: { compare: StringComparisonType.AnyString, qualifier: "" },
	// 		level: { compare: NumericComparisonType.AnyNumber, qualifier: 0 },
	// 	})
	// }

	satisfied(actor: ActorGURPS, exclude: any, tooltip: TooltipGURPS): [boolean, boolean] {
		let satisfied = false
		if (!actor.traits) return [true, false]
		actor.traits.forEach((t: any) => {
			if (exclude === t || !stringCompare(t.name, this.name)) return // [false, false]
			let notes = t.notes
			const mod_notes = t.modifierNotes
			if (mod_notes) notes += `\n${mod_notes}`
			if (!stringCompare(notes, this.notes)) return // [false, false]
			satisfied = numberCompare(Math.max(0, t.levels), this.level)
		})
		if (!this.has) satisfied = !satisfied
		if (!satisfied) {
			tooltip.push(LocalizeGURPS.translations.gurps.prereqs.has[this.has ? "true" : "false"])
			tooltip.push(LocalizeGURPS.translations.gurps.prereqs.trait.name)
			tooltip.push(LocalizeGURPS.translations.gurps.prereqs.criteria[this.name!.compare])
			if (this.name && this.name.compare !== StringComparisonType.AnyString)
				tooltip.push(`"${this.name!.qualifier}"`)
			if (this.notes!.compare !== StringComparisonType.AnyString) {
				tooltip.push(LocalizeGURPS.translations.gurps.prereqs.trait.notes)
				tooltip.push(LocalizeGURPS.translations.gurps.prereqs.criteria[this.notes!.compare])
				tooltip.push(`"${this.notes!.qualifier}"`)
			}

			tooltip.push(LocalizeGURPS.translations.gurps.prereqs.trait.level)
			tooltip.push(LocalizeGURPS.translations.gurps.prereqs.criteria[this.level!.compare])
			if (this.level!.compare !== NumericComparisonType.AnyNumber)
				tooltip.push(((this.level ? this.level.qualifier : 0) ?? 0).toString())
		}
		return [satisfied, false]
	}
}
