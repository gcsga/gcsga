import { StringBuilder, emcost, emweight } from "@util"
import { ItemDataModel } from "../abstract.ts"
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { FeatureTemplate, FeatureTemplateSchema } from "./templates/features.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"
import fields = foundry.data.fields
import { SheetSettings } from "@system"
import { ItemType } from "../constants.ts"
import { ItemInst } from "./helpers.ts"

class EquipmentModifierData extends ItemDataModel.mixin(
	BasicInformationTemplate,
	FeatureTemplate,
	ReplacementTemplate,
) {
	/** Allows dynamic setting of containing trait for arbitrary value calculation */
	private _equipment: ItemInst<ItemType.Equipment | ItemType.EquipmentContainer> | null = null

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

	get equipment(): ItemInst<ItemType.Equipment | ItemType.EquipmentContainer> | null {
		return (this._equipment as ItemInst<ItemType.Equipment | ItemType.EquipmentContainer>) ?? null
	}

	set equipment(equipment: ItemInst<ItemType.Equipment | ItemType.EquipmentContainer> | null) {
		this._equipment = equipment
	}

	get costMultiplier(): number {
		return multiplierForEquipmentModifier(this.equipment, this.cost_is_per_level)
	}

	get weightMultiplier(): number {
		return multiplierForEquipmentModifier(this.equipment, this.weight_is_per_level)
	}

	get costDescription(): string {
		if (this.cost_type === emcost.Type.Original && (this.cost === "" || this.cost === "+0")) return ""
		return emcost.Type.format(this.cost_type, this.cost) + " " + this.cost_type.toString()
	}

	get weightDescription(): string {
		if (this.weight_type === emweight.Type.Original && (this.weight === "" || this.weight.startsWith("+0")))
			return ""
		return (
			emweight.Type.format(
				this.weight_type,
				this.weight,
				SheetSettings.for(this.parent.actor).default_weight_units,
			) +
			" " +
			this.cost_type.toString()
		)
	}

	get fullDescription(): string {
		const buffer = new StringBuilder()
		buffer.push(this.nameWithReplacements)
		const localNotes = this.processedNotes
		if (localNotes !== "") {
			buffer.push(` (${localNotes})`)
		}
		if (this.notes !== "") buffer.push(` (${this.notesWithReplacements})`)
		if (SheetSettings.for(this.parent.actor).show_equipment_modifier_adj) {
			const costDesc = this.costDescription
			const weightDesc = this.weightDescription
			if (costDesc !== "" || weightDesc !== "") {
				if (costDesc !== "" && weightDesc !== "") buffer.push(` [${costDesc}; ${weightDesc}]`)
				else if (costDesc !== "") buffer.push(` [${costDesc}]`)
				else buffer.push(` [${weightDesc}]`)
			}
		}
		return buffer.toString()
	}
}

function multiplierForEquipmentModifier(
	equipment: ItemInst<ItemType.Equipment | ItemType.EquipmentContainer> | null,
	isPerLevel: boolean,
): number {
	let multiplier = 0
	if (isPerLevel && equipment !== null && equipment.system.isLeveled) {
		multiplier = equipment.system.level
	}
	if (multiplier <= 0) multiplier = 1
	return multiplier
}

interface EquipmentModifierData extends ModelPropsFromSchema<EquipmentModifierSchema> {}

type EquipmentModifierSchema = BasicInformationTemplateSchema &
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
