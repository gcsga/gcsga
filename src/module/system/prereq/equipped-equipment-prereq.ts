import { StringCompareType, StringCriteria } from "@util/string-criteria.ts"
import { BasePrereq } from "./base.ts"
import { prereq } from "@util/enum/prereq.ts"
import { EquippedEquipmentPrereqObj } from "./data.ts"
import { EquipmentContainerGURPS, EquipmentGURPS } from "@item"
import { LocalizeGURPS, PrereqResolver, TooltipGURPS } from "@util"

export class EquippedEquipmentPrereq extends BasePrereq {
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
		actor: PrereqResolver,
		_exclude: EquipmentGURPS | EquipmentContainerGURPS,
		tooltip: TooltipGURPS,
		hasEquipmentPenalty: { value: boolean },
	): boolean {
		let satisfied = actor.equipment.some(
			// @ts-expect-error awaiting implementation
			eqp => eqp.equipped && this.name.matches(eqp.name ?? "") && eqp.quantity > 0,
		)
		if (!this.has) satisfied = !satisfied
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
}
