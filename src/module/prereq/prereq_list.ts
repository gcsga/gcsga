import { prereq } from "@util/enum";
import {
	BasePrereq,
	BasePrereqObj
} from "./base";
import {
	CharacterResolver, LocalizeGURPS, NumericCompareType,
	NumericCriteria,
	extractTechLevel
} from "@util";
import { TooltipGURPS } from "@module/tooltip"

export interface PrereqListObj {
	type: prereq.Type
	all: boolean
	when_tl: NumericCriteria
	prereqs: Array<BasePrereqObj | PrereqListObj>
}

export class PrereqList {
	type: prereq.Type

	all: boolean

	when_tl: NumericCriteria

	prereqs: Array<BasePrereq | PrereqList>


	constructor() {
		this.type = prereq.Type.List
		this.all = true
		this.when_tl = new NumericCriteria(NumericCompareType.AnyNumber)
		this.prereqs = []
	}

	static fromObject(data: PrereqListObj): PrereqList {
		const prereq = new PrereqList()
		prereq.all = data.all
		if (data.when_tl)
			prereq.when_tl = new NumericCriteria(data.when_tl.compare,
				data.when_tl.qualifier)
		if (data.prereqs.length)
			prereq.prereqs = data.prereqs.map(e => {
				const prereqConstructor = CONFIG.GURPS.Prereq.classes[e.type]
				if (prereqConstructor) return prereqConstructor.fromObject(e)
			})
		return prereq
	}

	satisfied(
		character: CharacterResolver,
		exclude: any,
		tooltip: TooltipGURPS,
		hasEquipmentPenalty: { value: boolean } = { value: false }
	): boolean {
		if (this.when_tl.compare !== NumericCompareType.AnyNumber) {
			let tl = extractTechLevel(character.profile.tech_level)
			if (tl < 0) tl = 0
			if (!this.when_tl.matches(tl)) return true
		}
		let count = 0
		let local = new TooltipGURPS()
		let eqpPenalty = { value: false }
		for (const one of this.prereqs) {
			if (one.satisfied(character, exclude, local, eqpPenalty)) count++
		}
		if (local.length !== 0) {
			const indented = local.toString().replaceAll("\n", "\n  ")
			local = new TooltipGURPS()
			local.push(indented)
		}
		const satisfied = count === this.prereqs.length || (!this.all && count > 0)
		if (!satisfied) {
			if (eqpPenalty.value) hasEquipmentPenalty.value = true
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.prefix)
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.list[this.all ? "true" : "false"])
			tooltip.push(local)
		}
		return satisfied
	}
}
