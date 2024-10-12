import { ItemType } from "@module/data/constants.ts"
import { EquipmentFieldsTemplate } from "./templates/equipment-fields.ts"

class EquipmentData extends EquipmentFieldsTemplate {
	static override modifierTypes = new Set([ItemType.EquipmentModifier, ItemType.EquipmentModifierContainer])
	static override weaponTypes = new Set([ItemType.WeaponMelee, ItemType.WeaponRanged])

	override async getSheetData(context: Record<string, unknown>): Promise<void> {
		context.detailsParts = ["gurps.details-equipment", "gurps.details-prereqs", "gurps.details-features"]
		context.embedsParts = [
			"gurps.embeds-equipment-modifiers",
			"gurps.embeds-weapons-melee",
			"gurps.embeds-weapons-ranged",
		]
	}
}

export { EquipmentData }
