import { StringCompareType, StringCriteria } from "@util/string-criteria.ts"
import { BasePrereq } from "./base.ts"
import { prereq } from "@util/enum/prereq.ts"
import { EquippedEquipmentPrereqObj } from "./data.ts"
import { LocalizeGURPS, TooltipGURPS } from "@util"

export class EquippedEquipmentPrereq extends BasePrereq<prereq.Type.EquippedEquipment> {
	name: StringCriteria

	constructor() {
		super(prereq.Type.EquippedEquipment)
		this.name = new StringCriteria({ compare: StringCompareType.IsString })
	}

	static fromObject(data: EquippedEquipmentPrereqObj): EquippedEquipmentPrereq {
		const prereq = new EquippedEquipmentPrereq()
		if (data.name) prereq.name = new StringCriteria(data.name)
		return prereq
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

	override toObject(): EquippedEquipmentPrereqObj {
		return {
			...super.toObject(),
			name: this.name.toObject(),
		}
	}
}
