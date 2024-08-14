import { StringCriteria } from "@module/util/string-criteria.ts"
import { BasePrereq } from "./base.ts"
import { prereq } from "@util/enum/prereq.ts"
import { EquippedEquipmentPrereqSchema } from "./data.ts"
import { LocalizeGURPS, TooltipGURPS } from "@util"
import { ActorGURPS } from "@actor"
import { StringCompareType } from "@module/data/constants.ts"
import { Nameable } from "@module/util/nameable.ts"

class EquippedEquipmentPrereq extends BasePrereq<EquippedEquipmentPrereqSchema> {
	constructor(data: DeepPartial<SourceFromSchema<EquippedEquipmentPrereqSchema>>) {
		super(data)
		this.name = new StringCriteria(data.name ?? undefined)
		this.tags = new StringCriteria(data.tags ?? undefined)
	}

	static override defineSchema(): EquippedEquipmentPrereqSchema {
		const fields = foundry.data.fields

		return {
			type: new fields.StringField({ initial: prereq.Type.EquippedEquipment }),
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
		actor: ActorGURPS,
		_exclude: unknown,
		tooltip: TooltipGURPS,
		hasEquipmentPenalty: { value: boolean },
	): boolean {
		const satisfied = actor.itemCollections.equipment.some(
			eqp => eqp.equipped && this.name.matches(eqp.name ?? "") && eqp.system.quantity > 0,
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
		Omit<ModelPropsFromSchema<EquippedEquipmentPrereqSchema>, "name" | "tags"> {
	name: StringCriteria
	tags: StringCriteria
}

export { EquippedEquipmentPrereq }
