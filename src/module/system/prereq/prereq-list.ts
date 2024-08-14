import { prereq } from "@util/enum/prereq.ts"
import { LocalizeGURPS, TooltipGURPS, extractTechLevel } from "@util"
import { ActorGURPS } from "@actor"
import { BasePrereq, Prereq, PrereqConstructionOptions, PrereqListSchema } from "./index.ts"
import { ActorType, NumericCompareType } from "@module/data/constants.ts"
import { NumericCriteria } from "@module/util/index.ts"

function validatePrereqDepth(value: unknown, currentDepth: number, maxDepth: number): boolean {
	const p = value as Prereq

	if (currentDepth >= maxDepth) {
		throw new Error("max depth reached")
	}

	if (p.type === prereq.Type.List) {
		for (const child of p.prereqs) {
			validatePrereqDepth(child, currentDepth + 1, maxDepth)
		}
	}
	return true
}

class PrereqList extends BasePrereq<PrereqListSchema> {
	constructor(data: DeepPartial<SourceFromSchema<PrereqListSchema>>, options?: PrereqConstructionOptions) {
		super(data, options)

		this.when_tl = new NumericCriteria(data.when_tl)
		const prereqs: Prereq[] = []
		if (data.prereqs)
			for (const source of data.prereqs) {
				if (!source || !source.type) continue
				const PrereqClass = CONFIG.GURPS.Prereq.classes[source.type]
				// @ts-expect-error is ok
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
			prereqs: new fields.ArrayField(
				new fields.ObjectField<Prereq, Prereq>({
					validate: (value: unknown) => {
						return validatePrereqDepth(value, 0, 5)
					},
				}),
			),
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

	fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void {
		for (const prereq of this.prereqs) {
			prereq.fillWithNameableKeys(m, existing)
		}
	}
}

interface PrereqList
	extends BasePrereq<PrereqListSchema>,
		Omit<ModelPropsFromSchema<PrereqListSchema>, "when_tl" | "prereqs"> {
	when_tl: NumericCriteria
	prereqs: Prereq[]
}

export { PrereqList }
