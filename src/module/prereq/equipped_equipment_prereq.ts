import { CharacterResolver, LocalizeGURPS, LootResolver, StringCompareType, StringCriteria } from "@util"
import { BasePrereq, BasePrereqObj } from "./base"
import { prereq } from "@util/enum"
import { TooltipGURPS } from "@module/tooltip"

export interface EquippedEquipmentPrereqObj extends BasePrereqObj {
	name: StringCriteria
}

export class EquippedEquipmentPrereq extends BasePrereq {
	name: StringCriteria

	constructor() {
		super(prereq.Type.EquippedEquipment)
		this.name = new StringCriteria(StringCompareType.IsString)
	}

	static fromObject(data: EquippedEquipmentPrereqObj): EquippedEquipmentPrereq {
		const prereq = new EquippedEquipmentPrereq()
		prereq.has = data.has
		if (data.name) prereq.name = new StringCriteria(data.name.compare, data.name.qualifier)
		return prereq
	}

	satisfied(
		actor: CharacterResolver | LootResolver,
		_exclude: any,
		tooltip: TooltipGURPS,
		hasEquipmentPenalty: { value: boolean }
	): boolean {
		let satisfied = actor.equipment.some(
			eqp => eqp.equipped && this.name.matches(eqp.name ?? "") && eqp.quantity > 0
		)
		if (!this.has) satisfied = !satisfied
		if (!satisfied) {
			hasEquipmentPenalty.value = true
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.prefix)
			tooltip.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.equipped_equipment, {
					content: this.name.describe(),
				})
			)
		}
		return satisfied
	}
}
