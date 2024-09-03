import { ItemDataModel } from "../abstract.ts"
import { ItemType } from "../constants.ts"
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { ContainerTemplate, ContainerTemplateSchema } from "./templates/container.ts"
import { FeatureTemplate, FeatureTemplateSchema } from "./templates/features.ts"
import { PrereqTemplate, PrereqTemplateSchema } from "./templates/prereqs.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"
import { EquipmentFieldsTemplate, EquipmentFieldsTemplateSchema } from "./templates/equipment-fields.ts"

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
}

type EquipmentSchema = BasicInformationTemplateSchema &
	PrereqTemplateSchema &
	ContainerTemplateSchema &
	FeatureTemplateSchema &
	ReplacementTemplateSchema &
	EquipmentFieldsTemplateSchema

export { EquipmentData, type EquipmentSchema }
