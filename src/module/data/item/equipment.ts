import { WeightString } from "@util"
import { ItemDataModel } from "../abstract.ts"
import { ItemType } from "../constants.ts"
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { ContainerTemplate, ContainerTemplateSchema } from "./templates/container.ts"
import { FeatureTemplate, FeatureTemplateSchema } from "./templates/features.ts"
import { PrereqTemplate, PrereqTemplateSchema } from "./templates/prereqs.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"
import fields = foundry.data.fields

class EquipmentData extends ItemDataModel.mixin(
	BasicInformationTemplate,
	PrereqTemplate,
	ContainerTemplate,
	FeatureTemplate,
	ReplacementTemplate,
) {
	static override modifierTypes = new Set([ItemType.EquipmentModifier, ItemType.EquipmentModifierContainer])
	static override weaponTypes = new Set([ItemType.WeaponMelee, ItemType.WeaponRanged])

	static override defineSchema(): EquipmentSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			tech_level: new fields.StringField(),
			legality_class: new fields.StringField(),
			rated_strength: new fields.NumberField({ integer: true, min: 0, nullable: true }),
			quantity: new fields.NumberField({ integer: true, min: 0 }),
			value: new fields.NumberField({ min: 0, nullable: false }),
			weight: new fields.StringField<WeightString>(),
			max_uses: new fields.NumberField({ integer: true, min: 0 }),
			uses: new fields.NumberField({ integer: true, min: 0 }),
			equipped: new fields.BooleanField({ initial: true }),
			ignore_weight_for_skills: new fields.BooleanField({ initial: false }),
		}) as EquipmentSchema
	}
}

type EquipmentSchema = BasicInformationTemplateSchema &
	PrereqTemplateSchema &
	ContainerTemplateSchema &
	FeatureTemplateSchema &
	ReplacementTemplateSchema & {
		tech_level: fields.StringField
		legality_class: fields.StringField
		rated_strength: fields.NumberField
		quantity: fields.NumberField<number, number, true, false, true>
		value: fields.NumberField<number, number, true, false, true>
		weight: fields.StringField<WeightString>
		max_uses: fields.NumberField<number, number>
		uses: fields.NumberField<number, number>
		equipped: fields.BooleanField<boolean, boolean>
		ignore_weight_for_skills: fields.BooleanField<boolean, boolean>
	}

export { EquipmentData, type EquipmentSchema }
