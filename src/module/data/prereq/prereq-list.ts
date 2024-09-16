import { ActorType, NumericCompareType } from "@module/data/constants.ts"
import fields = foundry.data.fields
import { NumericCriteria, NumericCriteriaSchema } from "@module/util/index.ts"
import { LocalizeGURPS, TooltipGURPS, extractTechLevel } from "@util"
import { prereq } from "@util/enum/prereq.ts"
import { BasePrereq } from "./index.ts"
import { PrereqTemplate } from "@module/data/item/templates/prereqs.ts"
import { ActorInst } from "../actor/helpers.ts"
import { BasePrereqSchema } from "./base-prereq.ts"
import { Prereq } from "./types.ts"

// const ValidPrereqParentTypes = Object.freeze([
// 	ItemType.Trait,
// 	ItemType.TraitContainer,
// 	ItemType.Skill,
// 	ItemType.Technique,
// 	ItemType.Spell,
// 	ItemType.RitualMagicSpell,
// 	ItemType.Equipment,
// 	ItemType.EquipmentContainer,
// ])

class PrereqList extends BasePrereq<PrereqListSchema> {
	static override TYPE = prereq.Type.List

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
		for (const id of this.prereqs) {
			const child = (this.parent as unknown as PrereqTemplate).prereqs.find(e => e.id === id)
			if (child) children.push(child)
		}
		return children
	}

	get deepPrereqs(): string[] {
		const prereqs = this.prereqs
		for (const child of this.children) {
			if (child.isOfType(prereq.Type.List)) prereqs.push(...child.deepPrereqs)
		}
		return prereqs
	}

	satisfied(
		actor: ActorInst<ActorType.Character>,
		exclude: unknown,
		tooltip: TooltipGURPS | null,
		hasEquipmentPenalty: { value: boolean } = { value: false },
	): boolean {
		if (this.when_tl.compare !== NumericCompareType.AnyNumber) {
			let tl = extractTechLevel(actor.system.profile.tech_level)
			if (tl < 0) tl = 0
			if (!this.when_tl.matches(tl)) return true
		}
		let count = 0
		let local: TooltipGURPS | null = null
		if (tooltip !== null) local = new TooltipGURPS()
		let eqpPenalty = false
		for (const one of this.children) {
			if (one.satisfied(actor, exclude, local, hasEquipmentPenalty)) count += 1
		}
		const satisfied = count === this.prereqs.length || (!this.all && count > 0)
		if (!satisfied) {
			if (eqpPenalty) hasEquipmentPenalty.value = eqpPenalty
			if (tooltip !== null && local !== null) {
				tooltip.push(LocalizeGURPS.translations.GURPS.Tooltip.Prefix)
				if (this.all) tooltip.push(LocalizeGURPS.translations.GURPS.Prereq.List.All)
				else tooltip.push(LocalizeGURPS.translations.GURPS.Prereq.List.NotAll)
				tooltip.push(local)
			}
		}
		return satisfied
	}

	fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void {
		for (const prereq of this.children) {
			prereq.fillWithNameableKeys(m, existing)
		}
	}
}

interface PrereqList extends BasePrereq<PrereqListSchema>, ModelPropsFromSchema<PrereqListSchema> {}

export type PrereqListSchema = BasePrereqSchema & {
	all: fields.BooleanField<boolean, boolean, true, false, true>
	when_tl: fields.SchemaField<NumericCriteriaSchema, SourceFromSchema<NumericCriteriaSchema>, NumericCriteria, false>
	prereqs: fields.ArrayField<fields.StringField<string, string, true, false, true>>
}

export { PrereqList }
