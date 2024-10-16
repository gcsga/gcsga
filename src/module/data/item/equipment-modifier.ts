import { StringBuilder, align, cell, display, emcost, emweight } from "@util"
import { ItemDataModel } from "./abstract.ts"
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { FeatureTemplate, FeatureTemplateSchema } from "./templates/features.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"
import fields = foundry.data.fields
import { SheetSettings } from "../sheet-settings.ts"
import { ItemType } from "../constants.ts"
import { ItemInst } from "./helpers.ts"
import { FeatureSet } from "../feature/types.ts"
import { Nameable } from "@module/util/nameable.ts"
import { CellData } from "./components/index.ts"

class EquipmentModifierData extends ItemDataModel.mixin(
	BasicInformationTemplate,
	FeatureTemplate,
	ReplacementTemplate,
) {
	/** Allows dynamic setting of containing trait for arbitrary value calculation */
	private declare _equipment: ItemInst<ItemType.Equipment | ItemType.EquipmentContainer> | null

	override async getSheetData(context: Record<string, unknown>): Promise<void> {
		context.detailsParts = ["gurps.details-equipment-modifier"]
	}

	static override defineSchema(): EquipmentModifierSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			cost_type: new fields.StringField({
				required: true,
				nullable: false,
				choices: emcost.TypesChoices,
				initial: emcost.Type.Original,
			}),
			cost_is_per_level: new fields.BooleanField({ required: true, nullable: false, initial: false }),
			weight_type: new fields.StringField({
				required: true,
				nullable: false,
				choices: emweight.TypesChoices,
				initial: emweight.Type.Original,
			}),
			weight_is_per_level: new fields.BooleanField({ required: true, nullable: false, initial: false }),
			disabled: new fields.BooleanField({ required: true, nullable: false, initial: false }),
			tech_level: new fields.StringField({
				required: true,
				nullable: false,
				initial: "",
				label: "GURPS.Item.EquipmentModifier.FIELDS.TechLevel.Name",
			}),
			cost: new fields.StringField({ required: true, nullable: false, initial: "0" }),
			weight: new fields.StringField({ required: true, nullable: false, initial: "0" }),
		}) as EquipmentModifierSchema
	}

	override get cellData(): Record<string, CellData> {
		return {
			enabled: new CellData({
				type: cell.Type.Toggle,
				checked: this.enabled,
				alignment: align.Option.Middle,
				classList: ["item-toggle"],
			}),
			name: new CellData({
				type: cell.Type.Text,
				primary: this.nameWithReplacements,
				secondary: this.secondaryText(display.Option.isInline),
				tooltip: this.secondaryText(display.Option.isTooltip),
				classList: ["item-name"],
			}),
			techLevel: new CellData({
				type: cell.Type.Text,
				primary: this.tech_level,
				classList: ["item-tech-level"],
			}),
			cost: new CellData({
				type: cell.Type.Text,
				primary: this.costDescription,
				classList: ["item-cost-adjustment"],
			}),
			weight: new CellData({
				type: cell.Type.Text,
				primary: this.weightDescription,
				classList: ["item-weight-adjustment"],
			}),
		}
	}

	// Returns the formatted name for display
	get processedName(): string {
		return this.nameWithReplacements
	}

	get enabled(): boolean {
		return !this.disabled
	}

	secondaryText(optionChecker: (option: display.Option) => boolean): string {
		if (optionChecker(SheetSettings.for(this.parent.actor).notes_display)) return this.notesWithReplacements
		return ""
	}

	get equipment(): ItemInst<ItemType.Equipment | ItemType.EquipmentContainer> | null {
		return (this._equipment = this._getEquipment())
	}

	set equipment(equipment: ItemInst<ItemType.Equipment | ItemType.EquipmentContainer> | null) {
		this._equipment = equipment
	}

	private _getEquipment(): ItemInst<ItemType.Equipment | ItemType.EquipmentContainer> | null {
		let container = this.parent.container
		// TODO: get rid of when we figure out Promise handling
		if (container instanceof Promise) return null
		if (container === null) return null
		let i = 0
		while (!container.isOfType(ItemType.Equipment, ItemType.EquipmentContainer) && i < ItemDataModel.MAX_DEPTH) {
			container = container.container
			if (container instanceof Promise) return null
			if (container === null) return null
			if (container.isOfType(ItemType.Equipment, ItemType.EquipmentContainer)) break
		}
		return container as ItemInst<ItemType.Equipment | ItemType.EquipmentContainer>
	}

	get costMultiplier(): number {
		return multiplierForEquipmentModifier(this.equipment, this.cost_is_per_level)
	}

	get weightMultiplier(): number {
		return multiplierForEquipmentModifier(this.equipment, this.weight_is_per_level)
	}

	get costDescription(): string {
		if (this.cost_type === emcost.Type.Original && (this.cost === "" || this.cost === "+0")) return ""
		return (
			emcost.Type.format(this.cost_type, this.cost) +
			" " +
			game.i18n.localize(emcost.Type.toString(this.cost_type))
		)
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
			game.i18n.localize(emweight.Type.toString(this.weight_type))
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

	/** Features */
	override addFeaturesToSet(featureSet: FeatureSet): void {
		if (!this.enabled) return
		if (!this.equipment || !this.equipment.system.equipped) return

		for (const f of this.features) {
			this._addFeatureToSet(f, featureSet, 0)
		}
	}

	/** Nameables */
	override fillWithNameableKeys(
		m: Map<string, string>,
		existing: Map<string, string> = this.nameableReplacements,
	): void {
		if (this.disabled) return

		Nameable.extract(this.notes, m, existing)
		this._fillWithNameableKeysFromFeatures(m, existing)
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
