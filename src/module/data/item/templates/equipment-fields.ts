import fields = foundry.data.fields
import { ItemDataModel } from "@module/data/abstract.ts"
import { LocalizeGURPS, StringBuilder, Weight, align, cell, display } from "@util"
import { CellData } from "../fields/cell-data.ts"
import { ItemTemplateType } from "../types.ts"
import { SheetSettings } from "@system"
import { ItemType } from "@module/data/constants.ts"
import { EquipmentModifierData } from "../equipment-modifier.ts"
import type { ItemGURPS2 } from "@module/document/item.ts"
import {
	extendedWeightAdjustedForModifiers,
	valueAdjustedForModifiers,
	weightAdjustedForModifiers,
} from "../helpers.ts"

class EquipmentFieldsTemplate extends ItemDataModel<EquipmentFieldsTemplateSchema> {
	static override defineSchema(): EquipmentFieldsTemplateSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			tech_level: new fields.StringField({ required: true, nullable: false, initial: "" }),
			legality_class: new fields.StringField({ required: true, nullable: false, initial: "" }),
			rated_strength: new fields.NumberField({
				required: true,
				nullable: false,
				integer: true,
				min: 0,
				initial: 0,
			}),
			quantity: new fields.NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }),
			level: new fields.NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }),
			value: new fields.NumberField({ required: true, nullable: false, min: 0, initial: 0 }),
			weight: new fields.StringField({ required: true, nullable: false, initial: "0 lb" }),
			max_uses: new fields.NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 0 }),
			uses: new fields.NumberField({ required: true, nullable: true, integer: true, min: 0, initial: null }),
			equipped: new fields.BooleanField({ required: true, nullable: false, initial: true }),
			ignore_weight_for_skills: new fields.BooleanField({ required: true, nullable: false, initial: false }),
		}
	}

	// Returns the formatted name for display
	get processedName(): string {
		const buffer = new StringBuilder()
		buffer.push(this.nameWithReplacements)
		if (this.isLeveled) {
			buffer.push(` ${this.level.toString()}`)
		}
		return buffer.toString()
	}

	get isLeveled(): boolean {
		return this.level > 0
	}

	secondaryText(optionChecker: (option: display.Option) => boolean): string {
		const buffer = new StringBuilder()
		const settings = SheetSettings.for(this.parent.actor)
		if (optionChecker(settings.modifiers_display)) {
			buffer.appendToNewLine(this.modifierNotes)
		}
		if (optionChecker(settings.notes_display)) {
			const localBuffer = new StringBuilder()
			if (this.rated_strength !== 0) {
				localBuffer.push(
					LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.RatedStrength, {
						value: this.rated_strength,
					}),
				)
			}
			const localNotes = this.processedNotes
			if (localNotes !== "") {
				if (localBuffer.size !== 0) localBuffer.push("; ")
				localBuffer.push(localNotes)
			}
			buffer.appendToNewLine(localBuffer.toString())
		}
		return buffer.toString()
	}

	// Returns rendered notes from modifiers
	get modifierNotes(): string {
		const buffer = new StringBuilder()
		this.allModifiers.forEach(mod => {
			if (mod.system.disabled) return
			if (buffer.length !== 0) buffer.push("; ")
			buffer.push(mod.system.fullDescription)
		})
		return buffer.toString()
	}

	override get cellData(): Record<string, CellData> {
		let dim = this.quantity === 0
		let c = this.parent
		while (c.container !== null) {
			c = c.container as ItemGURPS2
			if (!c.hasTemplate(ItemTemplateType.EquipmentFields)) break
			dim = c.system.quantity === 0
		}
		const weightUnits = SheetSettings.for(this.actor).default_weight_units

		return {
			equipped: new CellData({ type: cell.Type.Toggle, checked: this.equipped, alignment: align.Option.Middle }),
			quantity: new CellData({
				type: cell.Type.Text,
				priamry: this.quantity.toLocaleString(),
				alignment: align.Option.End,
			}),
			name: new CellData({
				type: cell.Type.Text,
				primary: this.processedName,
				secondary: this.secondaryText(display.Option.isInline),
				alignment: align.Option.Start,
			}),
			uses: new CellData({
				type: cell.Type.Text,
				primary: this.max_uses > 0 ? this.uses : "",
				alignment: align.Option.End,
			}),
			TL: new CellData({
				type: cell.Type.Text,
				primary: this.tech_level,
				alignment: align.Option.End,
			}),
			LC: new CellData({
				type: cell.Type.Text,
				primary: this.legality_class,
				alignment: align.Option.End,
			}),
			cost: new CellData({
				type: cell.Type.Text,
				primary: this.adjustedValue().toLocaleString(),
				alignment: align.Option.End,
			}),
			extendedCost: new CellData({
				type: cell.Type.Text,
				primary: this.extendedValue().toLocaleString(),
				alignment: align.Option.End,
			}),
			weight: new CellData({
				type: cell.Type.Text,
				primary: this.adjustedWeight(false, weightUnits).toLocaleString(),
				alignment: align.Option.End,
			}),
			extendedWeight: new CellData({
				type: cell.Type.Text,
				primary: this.extendedWeight(false, weightUnits).toLocaleString(),
				alignment: align.Option.End,
			}),
			tags: new CellData({
				type: cell.Type.Text,
				primary: this.hasTemplate(ItemTemplateType.BasicInformation) ? this.combinedTags : "",
				alignment: align.Option.Start,
			}),
			reference: new CellData({
				type: cell.Type.PageRef,
				primary: this.hasTemplate(ItemTemplateType.BasicInformation) ? this.reference : "",
				secondary: this.hasTemplate(ItemTemplateType.BasicInformation)
					? this.reference_highlight === ""
						? this.nameWithReplacements
						: this.reference_highlight
					: "",
			}),
		}
	}

	adjustedValue(): number {
		return valueAdjustedForModifiers(
			this.parent as unknown as { system: EquipmentFieldsTemplate },
			this.value,
			this.allModifiers,
		)
	}

	extendedValue(): number {
		if (this.quantity <= 0) return 0
		let value = this.adjustedValue()
		if (this.isOfType(ItemType.EquipmentContainer)) {
			const children = this.children as Collection<ItemGURPS2>
			for (const child of children) {
				if (child.hasTemplate(ItemTemplateType.EquipmentFields)) value += child.system.extendedValue()
			}
		}
		return value * this.quantity
	}

	adjustedWeight(forSkills: boolean, units: Weight.Unit): number {
		if (forSkills && this.ignore_weight_for_skills && this.equipped) {
			return 0
		}
		return weightAdjustedForModifiers(
			this.parent as unknown as { system: EquipmentFieldsTemplate },
			this.weight,
			this.allModifiers,
			units,
		)
	}

	extendedWeight(forSkills: boolean, units: Weight.Unit): number {
		const features = this.hasTemplate(ItemTemplateType.Feature) ? this.features : []
		let children: { system: EquipmentFieldsTemplate }[] = []
		if (this.hasTemplate(ItemTemplateType.Container)) {
			if (this.children instanceof Promise) {
				;(async () => {
					children = Array.from(await this.children) as unknown as { system: EquipmentFieldsTemplate }[]
				})()
			} else {
				children = Array.from(this.children) as unknown as { system: EquipmentFieldsTemplate }[]
			}
		}
		return extendedWeightAdjustedForModifiers(
			this.parent as unknown as { system: EquipmentFieldsTemplate },
			units,
			this.quantity,
			this.weight,
			this.allModifiers,
			features,
			children,
			forSkills,
			this.ignore_weight_for_skills && this.equipped,
		)
	}

	get allModifiers(): { system: EquipmentModifierData }[] {
		return Object.values(this.modifiers).filter(e => e.isOfType(ItemType.EquipmentModifier))
	}
}

interface EquipmentFieldsTemplate extends ModelPropsFromSchema<EquipmentFieldsTemplateSchema> {
	nameWithReplacements: string
	processedNotes: string
	modifiers: Collection<ItemGURPS2>
}

type EquipmentFieldsTemplateSchema = {
	tech_level: fields.StringField<string, string, true, false, true>
	legality_class: fields.StringField<string, string, true, false, true>
	rated_strength: fields.NumberField<number, number, true, false, true>
	quantity: fields.NumberField<number, number, true, false, true>
	level: fields.NumberField<number, number, true, false, true>
	value: fields.NumberField<number, number, true, false, true>
	weight: fields.StringField<string, string, true, false, true>
	max_uses: fields.NumberField<number, number, true, false, true>
	uses: fields.NumberField<number, number, true, true, true>
	equipped: fields.BooleanField<boolean, boolean, true, false, true>
	ignore_weight_for_skills: fields.BooleanField<boolean, boolean, true, false, true>
}

export { EquipmentFieldsTemplate, type EquipmentFieldsTemplateSchema }
