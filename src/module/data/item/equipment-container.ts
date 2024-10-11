import { ItemDataModel } from "./abstract.ts"
import { ItemType } from "../constants.ts"
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { ContainerTemplate, ContainerTemplateSchema } from "./templates/container.ts"
import { FeatureTemplate, FeatureTemplateSchema } from "./templates/features.ts"
import { PrereqTemplate, PrereqTemplateSchema } from "./templates/prereqs.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"
import { EquipmentFieldsTemplate, EquipmentFieldsTemplateSchema } from "./templates/equipment-fields.ts"
import { FeatureSet } from "../feature/types.ts"

class EquipmentContainerData extends ItemDataModel.mixin(
	BasicInformationTemplate,
	PrereqTemplate,
	ContainerTemplate,
	FeatureTemplate,
	ReplacementTemplate,
	EquipmentFieldsTemplate,
) {
	static override childTypes = new Set([ItemType.Equipment, ItemType.EquipmentContainer])
	static override modifierTypes = new Set([ItemType.EquipmentModifier, ItemType.EquipmentModifierContainer])
	static override weaponTypes = new Set([ItemType.WeaponMelee, ItemType.WeaponRanged])

	override async getSheetData(context: Record<string, unknown>): Promise<void> {
		context.detailsParts = ["gurps.details-equipment", "gurps.details-prereqs", "gurps.details-features"]
		context.embedsParts = [
			"gurps.embeds-equipment-children",
			"gurps.embeds-equipment-modifiers",
			"gurps.embeds-weapons",
		]
	}

	/** Features */
	override addFeaturesToSet(featureSet: FeatureSet): void {
		if (!this.equipped) return

		for (const f of this.features) {
			this._addFeatureToSet(f, featureSet, 0)
		}
	}
}

type EquipmentContainerSchema = BasicInformationTemplateSchema &
	PrereqTemplateSchema &
	ContainerTemplateSchema &
	FeatureTemplateSchema &
	ReplacementTemplateSchema &
	EquipmentFieldsTemplateSchema

export { EquipmentContainerData, type EquipmentContainerSchema }
