import { StringCriteria, StringCriteriaSchema } from "@module/util/string-criteria.ts"
import fields = foundry.data.fields
import { BasePrereq, BasePrereqSchema } from "./base-prereq.ts"
import { prereq } from "@util/enum/prereq.ts"
import { LocalizeGURPS, TooltipGURPS } from "@util"
import { ActorType, StringCompareType } from "@module/data/constants.ts"
import { Nameable } from "@module/util/nameable.ts"
import { ActorInst } from "../actor/helpers.ts"

class EquippedEquipmentPrereq extends BasePrereq<EquippedEquipmentPrereqSchema> {
	static override TYPE = prereq.Type.EquippedEquipment

	static override defineSchema(): EquippedEquipmentPrereqSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			name: new fields.SchemaField(StringCriteria.defineSchema(), {
				initial: {
					compare: StringCompareType.IsString,
					qualifier: "",
				},
			}),
			tags: new fields.SchemaField(StringCriteria.defineSchema(), {
				initial: {
					compare: StringCompareType.AnyString,
					qualifier: "",
				},
			}),
		}
	}

	satisfied(
		actor: ActorInst<ActorType.Character>,
		exclude: unknown,
		tooltip: TooltipGURPS | null,
		hasEquipmentPenalty: { value: boolean },
	): boolean {
		let replacements: Map<string, string> = new Map()
		if (Nameable.isAccesser(exclude)) replacements = exclude.nameableReplacements
		let satisfied = false
		for (const eqp of actor.itemCollections.equipment) {
			satisfied =
				exclude !== eqp &&
				eqp.system.equipped &&
				eqp.system.quantity > 0 &&
				this.name.matches(replacements, eqp.system.nameWithReplacements) &&
				this.tags.matchesList(replacements, ...eqp.system.tags)
			if (satisfied) break
		}
		if (!satisfied) {
			hasEquipmentPenalty.value = true
			if (tooltip !== null) {
				tooltip.push(
					LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Prereq.EquippedEquipment.Base, {
						prefix: LocalizeGURPS.translations.GURPS.Tooltip.Prefix,
						name: this.name.toString(replacements),
						tags: this.tags.toStringWithPrefix(
							replacements,
							LocalizeGURPS.translations.GURPS.Prereq.EquippedEquipment.OneTag,
							LocalizeGURPS.translations.GURPS.Prereq.EquippedEquipment.AllTags,
						),
					}),
				)
			}
		}
		return satisfied
	}

	fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void {
		Nameable.extract(this.name.qualifier, m, existing)
		Nameable.extract(this.tags.qualifier, m, existing)
	}
}

interface EquippedEquipmentPrereq
	extends BasePrereq<EquippedEquipmentPrereqSchema>,
		ModelPropsFromSchema<EquippedEquipmentPrereqSchema> {}

type EquippedEquipmentPrereqSchema = BasePrereqSchema & {
	name: fields.SchemaField<StringCriteriaSchema, SourceFromSchema<StringCriteriaSchema>, StringCriteria>
	tags: fields.SchemaField<StringCriteriaSchema, SourceFromSchema<StringCriteriaSchema>, StringCriteria>
}

export { EquippedEquipmentPrereq, type EquippedEquipmentPrereqSchema }
