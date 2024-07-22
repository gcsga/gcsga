import { prereq } from "@util/enum/prereq.ts"
import { NumericCriteria } from "@util/numeric-criteria.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { TooltipGURPS, extractTechLevel } from "@util"
import { ActorGURPS } from "@actor"
import { BasePrereq, Prereq, PrereqClasses, PrereqListSchema } from "./index.ts"
import { ActorType, NumericCompareType } from "@module/data/constants.ts"

class PrereqList extends BasePrereq<PrereqListSchema> {


	constructor(data: DeepPartial<SourceFromSchema<PrereqListSchema>>) {
		super(data)

		this.when_tl = new NumericCriteria(data.when_tl)
		const prereqs: Prereq[] = []
		if (data.prereqs)
			for (const source of data.prereqs) {
				if (!source || !source.type) continue
				const PrereqClass = PrereqClasses[source.type]
				prereqs.push(new PrereqClass(source))
			}
		this.prereqs = prereqs
	}

	static override defineSchema(): PrereqListSchema {
		const fields = foundry.data.fields

		return {
			type: new fields.StringField({ initial: prereq.Type.List }),
			all: new fields.BooleanField({ initial: true }),
			when_tl: new fields.SchemaField(NumericCriteria.defineSchema()),
			prereqs: new fields.ArrayField(new fields.SchemaField(BasePrereq.defineSchema()))
		}
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

}

interface PrereqList extends BasePrereq<PrereqListSchema>, Omit<ModelPropsFromSchema<PrereqListSchema>, "when_tl" | "prereqs"> {
	when_tl: NumericCriteria
	prereqs: Prereq[]
}

export { PrereqList }
