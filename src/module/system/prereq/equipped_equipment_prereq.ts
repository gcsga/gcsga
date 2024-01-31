import { StringCompareType, StringCriteria } from "@util/string_criteria.ts"
import { BasePrereq } from "./base.ts"
import { prereq } from "@util/enum/prereq.ts"
import { EquippedEquipmentPrereqObj } from "./data.ts"
import { CharacterResolver, LocalizeGURPS, LootResolver } from "@util/index.ts"
import { TooltipGURPS } from "@sytem/tooltip/index.ts"
import { EquipmentContainerGURPS, EquipmentGURPS } from "@item"

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
		_exclude: EquipmentGURPS | EquipmentContainerGURPS,
		tooltip: TooltipGURPS,
		hasEquipmentPenalty: { value: boolean },
	): boolean {
		let satisfied = actor.equipment.some(
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
