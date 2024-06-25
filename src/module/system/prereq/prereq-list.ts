import { prereq } from "@util/enum/prereq.ts"
import { NumericCompareType, NumericCriteria, NumericCriteriaSchema } from "@util/numeric-criteria.ts"
import { PrereqListObj, PrereqObj } from "./data.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { TooltipGURPS, extractTechLevel } from "@util"
import { ActorGURPS } from "@actor"
import { Prereq } from "./index.ts"
import { ActorType } from "@module/data/constants.ts"
import { PrereqResolver } from "@module/util/index.ts"

import fields = foundry.data.fields

export type PrereqListSchema = {
	type: fields.StringField<prereq.Type, prereq.Type, true, false, true>
	all: fields.BooleanField<boolean, boolean, true, false, true>
	when_tl: fields.SchemaField<NumericCriteriaSchema>
	prereqs: fields.ArrayField<foundry.data.fields.ObjectField<PrereqObj>>
}

export class PrereqList {
	type: prereq.Type

	all: boolean

	when_tl: NumericCriteria

	prereqs: Prereq[]

	static defineSchema(): PrereqListSchema {
		return {
			type: new fields.StringField({ required: true, initial: prereq.Type.List }),
			all: new fields.BooleanField({ required: true }),
			when_tl: new fields.SchemaField(NumericCriteria.defineSchema()),
			prereqs: new fields.ArrayField(new fields.ObjectField<PrereqObj>()),
		}
	}

	constructor() {
		this.type = prereq.Type.List
		this.all = true
		this.when_tl = new NumericCriteria({ compare: NumericCompareType.AnyNumber })
		this.prereqs = []
	}

	static fromObject(data: PrereqListObj, actor: PrereqResolver | null): PrereqList {
		const prereq = new PrereqList()
		prereq.all = data.all
		if (data.when_tl) prereq.when_tl = new NumericCriteria(data.when_tl)
		if (data.prereqs?.length)
			prereq.prereqs = (data.prereqs ?? [])
				.filter(e => !!CONFIG.GURPS.Prereq.classes[e.type])
				.map(e => {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					return CONFIG.GURPS.Prereq.classes[e.type].fromObject(e as any, actor)
				})
		return prereq
	}

	satisfied(
		actor: ActorGURPS,
		exclude: unknown,
		tooltip: TooltipGURPS,
		hasEquipmentPenalty: { value: boolean } = { value: false },
	): boolean {
		let actorTechLevel = "0"
		if (actor.isOfType(ActorType.Character)) {
			actorTechLevel = actor.techLevel
		}
		if (this.when_tl.compare !== NumericCompareType.AnyNumber) {
			let tl = extractTechLevel(actorTechLevel)
			if (tl < 0) tl = 0
			if (!this.when_tl.matches(tl)) return true
		}
		let count = 0
		const local = new TooltipGURPS()
		const eqpPenalty = { value: false }
		for (const one of this.prereqs) {
			if (one.satisfied(actor, exclude, local, eqpPenalty)) count += 1
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

	toObject(): PrereqListObj {
		return {
			type: prereq.Type.List,
			all: this.all,
			when_tl: this.when_tl.toObject(),
			prereqs: this.prereqs.map(item => item.toObject()),
		}
	}
}
