import { ActorGURPS } from "@actor"
import { ActorType, ItemType, NumericCompareType } from "@module/data/constants.ts"
import { NumericCriteria } from "@module/util/index.ts"
import { LocalizeGURPS, TooltipGURPS, extractTechLevel } from "@util"
import { prereq } from "@util/enum/prereq.ts"
import { BasePrereq, Prereq, PrereqConstructionOptions, PrereqListSchema } from "./index.ts"

class PrereqList extends BasePrereq<PrereqListSchema> {
	constructor(data: DeepPartial<SourceFromSchema<PrereqListSchema>>, options?: PrereqConstructionOptions) {
		super(data, options)

		this.when_tl = new NumericCriteria(data.when_tl)
	}

	static override defineSchema(): PrereqListSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField({ required: true, nullable: false, blank: false, initial: prereq.Type.List }),
			all: new fields.BooleanField({ initial: true }),
			when_tl: new fields.SchemaField(NumericCriteria.defineSchema()),
			// prereqs: new fields.ArrayField(new fields.TypedSchemaField(BasePrereq.TYPES)),
			prereqs: new fields.ArrayField(new fields.StringField({ required: true, nullable: false })),
		}
	}

	get children(): Prereq[] {
		const children: Prereq[] = []
		if (!this.item.isOfType(ItemType.Trait)) return children
		for (const id of this.prereqs) {
			const child = this.item.system.prereqs.find(e => e.id === id)
			if (child) children.push(child)
		}
		return children
	}

	get deepPrereqs(): string[] {
		const prereqs = this.prereqs
		for (const child of this.children) {
			if (child.type === prereq.Type.List) prereqs.push(...child.deepPrereqs)
		}
		return prereqs
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
		for (const one of this.children) {
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
		for (const prereq of this.children) {
			prereq.fillWithNameableKeys(m, existing)
		}
	}
}

interface PrereqList extends BasePrereq<PrereqListSchema>, Omit<ModelPropsFromSchema<PrereqListSchema>, "when_tl"> {
	when_tl: NumericCriteria
}

// interface PrereqList
// 	extends BasePrereq<PrereqListSchema>,
// 		Omit<ModelPropsFromSchema<PrereqListSchema>, "when_tl" | "prereqs"> {
// 	when_tl: NumericCriteria
// 	prereqs: Prereq[]
// }
export { PrereqList }
