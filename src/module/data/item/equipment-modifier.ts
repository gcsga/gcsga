import { emcost, emweight } from "@util"
import { ItemDataModel, ItemDataSchema } from "../abstract.ts"
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { FeatureTemplate, FeatureTemplateSchema } from "./templates/features.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"
import fields = foundry.data.fields
import { EquipmentData } from "./equipment.ts"
import { EquipmentContainerData } from "./equipment-container.ts"
import { EquipmentFieldsTemplate } from "./templates/index.ts"

class EquipmentModifierData extends ItemDataModel.mixin(
	BasicInformationTemplate,
	FeatureTemplate,
	ReplacementTemplate,
) {
	/** Allows dynamic setting of containing trait for arbitrary value calculation */
	private _equipment: { system: EquipmentFieldsTemplate } | null = null

	static override defineSchema(): EquipmentModifierSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			cost_type: new fields.StringField({
				required: true,
				nullable: false,
				choices: emcost.Types,
				initial: emcost.Type.Original,
			}),
			cost_is_per_level: new fields.BooleanField({ required: true, nullable: false, initial: false }),
			weight_type: new fields.StringField({
				required: true,
				nullable: false,
				choices: emweight.Types,
				initial: emweight.Type.Original,
			}),
			weight_is_per_level: new fields.BooleanField({ required: true, nullable: false, initial: false }),
			disabled: new fields.BooleanField({ required: true, nullable: false, initial: false }),
			tech_level: new fields.StringField({ required: true, nullable: false, initial: "" }),
			cost: new fields.StringField({ required: true, nullable: false, initial: "0" }),
			weight: new fields.StringField({ required: true, nullable: false, initial: "0" }),
		}) as EquipmentModifierSchema
	}

	get equipment(): { system: EquipmentFieldsTemplate } | null {
		return (this._equipment as { system: EquipmentData | EquipmentContainerData }) ?? null
	}

	set equipment(trait: { system: EquipmentFieldsTemplate } | null) {
		this._equipment = trait
	}

	get costMultiplier(): number {
		return multiplierForEquipmentModifier(this.equipment, this.cost_is_per_level)
	}

	get weightMultiplier(): number {
		return multiplierForEquipmentModifier(this.equipment, this.weight_is_per_level)
	}
}

function multiplierForEquipmentModifier(
	equipment: { system: EquipmentFieldsTemplate } | null,
	isPerLevel: boolean,
): number {
	let multiplier = 0
	if (isPerLevel && equipment !== null && equipment.system.isLeveled) {
		multiplier = equipment.system.currentLevel
	}
	if (multiplier <= 0) multiplier = 1
	return multiplier
}

interface EquipmentModifierData extends Omit<ModelPropsFromSchema<EquipmentModifierSchema>, "container"> {
	container: string | null
}

type EquipmentModifierSchema = ItemDataSchema &
	BasicInformationTemplateSchema &
	FeatureTemplateSchema &
	ReplacementTemplateSchema & {
		cost_type: fields.StringField<emcost.Type, emcost.Type, true, false, true>
		cost_is_per_level: fields.BooleanField<boolean, boolean, true, false, true>
		weight_type: fields.StringField<emweight.Type, emweight.Type, true, false, true>
		weight_is_per_level: fields.BooleanField<boolean, boolean, true, false, true>
		disabled: fields.BooleanField<boolean, boolean, true, false, true>
		tech_level: fields.StringField<string, string, true, false, true>
		cost: fields.StringField<string, string, true, false, true>
		weight: fields.StringField<string, string, true, false, true>
	}

export { EquipmentModifierData, type EquipmentModifierSchema }
