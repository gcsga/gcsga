import { ItemDataModel } from "../abstract.ts"
import { ItemType } from "../constants.ts"
import {
	BasicInformationTemplate,
	BasicInformationTemplateSchema,
	ContainerTemplate,
	ContainerTemplateSchema,
	EquipmentFieldsTemplate,
	EquipmentFieldsTemplateSchema,
	FeatureTemplate,
	FeatureTemplateSchema,
	PrereqTemplate,
	PrereqTemplateSchema,
	ReplacementTemplate,
	ReplacementTemplateSchema,
} from "./templates/index.ts"

class EquipmentData extends ItemDataModel.mixin(
	BasicInformationTemplate,
	PrereqTemplate,
	ContainerTemplate,
	FeatureTemplate,
	ReplacementTemplate,
	EquipmentFieldsTemplate,
) {
	static override modifierTypes = new Set([ItemType.EquipmentModifier, ItemType.EquipmentModifierContainer])
	static override weaponTypes = new Set([ItemType.WeaponMelee, ItemType.WeaponRanged])

	override async getSheetData(context: Record<string, unknown>): Promise<void> {
		context.detailsParts = ["gurps.details-equipment", "gurps.details-prereqs", "gurps.details-features"]
		context.embedsParts = ["gurps.embeds-equipment-modifiers", "gurps.embeds-weapons"]
	}
}

type EquipmentSchema = BasicInformationTemplateSchema &
	PrereqTemplateSchema &
	ContainerTemplateSchema &
	FeatureTemplateSchema &
	ReplacementTemplateSchema &
	EquipmentFieldsTemplateSchema

export { EquipmentData, type EquipmentSchema }
