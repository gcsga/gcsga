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
		_exclude: unknown,
		tooltip: TooltipGURPS,
		hasEquipmentPenalty: { value: boolean },
	): boolean {
		const satisfied = actor.itemCollections.equipment.some(
			eqp => eqp.system.equipped && this.name.matches(eqp.name ?? "") && eqp.system.quantity > 0,
		)
		if (!satisfied) {
			hasEquipmentPenalty.value = true
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.prefix)
			tooltip.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.equipped_equipment, {
					content: this.name.describe(),
				}),
			)
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
