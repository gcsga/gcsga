import { ItemType } from "@module/data/constants.ts"
import { SheetSettings } from "@module/data/sheet-settings.ts"
import { MaybePromise } from "@module/data/types.ts"
import { StringBuilder, Weight, align, cell, display } from "@util"
import { ItemDataModel } from "../abstract.ts"
import { CellData, CellDataOptions } from "../components/cell-data.ts"
import {
	ItemInst,
	extendedWeightAdjustedForModifiers,
	valueAdjustedForModifiers,
	weightAdjustedForModifiers,
} from "../helpers.ts"
import { ItemTemplateType } from "../types.ts"
import fields = foundry.data.fields
import { WeightField } from "../fields/weight-field.ts"
import { ToggleableBooleanField, ToggleableNumberField, ToggleableStringField } from "@module/data/fields/index.ts"
import { AttackMelee } from "@module/data/action/attack-melee.ts"
import { AttackRanged } from "@module/data/action/attack-ranged.ts"

class EquipmentFieldsTemplate extends ItemDataModel<EquipmentFieldsTemplateSchema> {
	static override defineSchema(): EquipmentFieldsTemplateSchema {
		const fields = foundry.data.fields

		return {
			tech_level: new ToggleableStringField({
				required: true,
				nullable: false,
				initial: "",
				label: "GURPS.Item.Equipment.FIELDS.TechLevel.Name",
			}),
			legality_class: new ToggleableStringField({
				required: true,
				nullable: false,
				initial: "",
				label: "GURPS.Item.Equipment.FIELDS.LegalityClass.Name",
			}),
			rated_strength: new ToggleableNumberField({
				required: true,
				nullable: false,
				integer: true,
				min: 0,
				initial: 0,
				label: "GURPS.Item.Equipment.FIELDS.RatedStrength.Name",
			}),
			quantity: new ToggleableNumberField({
				required: true,
				nullable: false,
				integer: true,
				min: 0,
				initial: 1,
				label: "GURPS.Item.Equipment.FIELDS.Quantity.Name",
			}),
			level: new ToggleableNumberField({
				required: true,
				nullable: false,
				integer: true,
				min: 0,
				initial: 0,
				label: "GURPS.Item.Equipment.FIELDS.Level.Name",
			}),
			value: new ToggleableNumberField({
				required: true,
				nullable: false,
				min: 0,
				initial: 0,
				label: "GURPS.Item.Equipment.FIELDS.Value.Name",
			}),
			weight: new WeightField({
				required: true,
				nullable: false,
				initial: "0 lb",
				allowPercent: false,
				label: "GURPS.Item.Equipment.FIELDS.Weight.Name",
				hint: "oogly boogly",
			}),
			max_uses: new ToggleableNumberField({
				required: true,
				nullable: false,
				integer: true,
				min: 0,
				initial: 0,
				label: "GURPS.Item.Equipment.FIELDS.MaxUses.Name",
			}),
			uses: new ToggleableNumberField({
				required: true,
				nullable: true,
				integer: true,
				min: 0,
				initial: null,
				label: "GURPS.Item.Equipment.FIELDS.Uses.Name",
			}),
			equipped: new ToggleableBooleanField({
				required: true,
				nullable: false,
				initial: true,
				label: "GURPS.Item.Equipment.FIELDS.Equipped.Name",
			}),
			ignore_weight_for_skills: new ToggleableBooleanField({
				required: true,
				nullable: false,
				initial: false,
				label: "GURPS.Item.Equipment.FIELDS.IgnoreWeightForSkills.Name",
			}),
			other: new fields.BooleanField({ required: true, nullable: false, initial: false }),
		}
	}

	// Returns the formatted name for display
	get processedName(): string {
		const buffer = new StringBuilder()
		if (this.hasTemplate(ItemTemplateType.BasicInformation)) {
			buffer.push(this.nameWithReplacements)
		}
		if (this.isLeveled) {
			buffer.push(` ${this.level.toString()}`)
		}
		return buffer.toString()
	}

	get isLeveled(): boolean {
		return this.level > 0
	}

	override get ratedStrength(): number {
		return this.rated_strength
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
					game.i18n.format("GURPS.RatedStrength", {
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
	get modifierNotes(): MaybePromise<string> {
		if (this.parent.pack) return this._modifierNotes()
		const buffer = new StringBuilder()

		;(this.allModifiers as Collection<ItemInst<ItemType.EquipmentModifier>>).forEach(mod => {
			if (mod.system.disabled) return
			if (buffer.length !== 0) buffer.push("; ")
			buffer.push(mod.system.fullDescription)
		})
		return buffer.toString()
	}

	private async _modifierNotes(): Promise<string> {
		const buffer = new StringBuilder()
		const modifiers = await this.allModifiers

		modifiers.forEach(mod => {
			if (mod.system.disabled) return
			if (buffer.length !== 0) buffer.push("; ")
			buffer.push(mod.system.fullDescription)
		})
		return buffer.toString()
	}

	override cellData(options: CellDataOptions = {}): Record<string, CellData> {
		const { level } = options
		let dim = this.quantity === 0
		const weightUnits = SheetSettings.for(this.actor).default_weight_units

		return {
			equipped: new CellData({
				type: cell.Type.Toggle,
				checked: this.equipped,
				alignment: align.Option.Middle,
				dim,
				classList: ["item-equipped"],
				condition: this.parent.isOwned,
			}),
			quantity: new CellData({
				type: cell.Type.Text,
				primary: this.quantity.toLocaleString(),
				alignment: align.Option.End,
				dim,
				classList: ["item-quantity"],
			}),
			dropdown: new CellData({
				type: this.isOfType(ItemType.EquipmentContainer) ? cell.Type.Dropdown : cell.Type.Text,
				open: this.open,
				classList: ["item-dropdown"],
			}),
			name: new CellData({
				type: cell.Type.Text,
				primary: this.processedName,
				secondary: this.secondaryText(display.Option.isInline),
				alignment: align.Option.Start,
				dim,
				classList: ["item-name"],
				indentLevel: level,
			}),
			uses: new CellData({
				type: cell.Type.Text,
				primary: this.max_uses > 0 ? this.uses?.toString() : "",
				alignment: align.Option.End,
				dim,
				classList: ["item-uses"],
			}),
			TL: new CellData({
				type: cell.Type.Text,
				primary: this.tech_level,
				alignment: align.Option.End,
				dim,
				classList: ["item-tech-level"],
			}),
			LC: new CellData({
				type: cell.Type.Text,
				primary: this.legality_class,
				alignment: align.Option.End,
				dim,
				classList: ["item-legality-class"],
			}),
			cost: new CellData({
				type: cell.Type.Text,
				primary: this.adjustedValue.toLocaleString(),
				alignment: align.Option.End,
				dim,
				classList: ["item-cost"],
			}),
			extendedCost: new CellData({
				type: cell.Type.Text,
				primary: this.extendedValue.toLocaleString(),
				alignment: align.Option.End,
				dim,
				classList: ["item-cost-extended"],
			}),
			weight: new CellData({
				type: cell.Type.Text,
				primary: this.adjustedWeight(false, weightUnits).toLocaleString(),
				alignment: align.Option.End,
				dim,
				classList: ["item-weight"],
			}),
			extendedWeight: new CellData({
				type: cell.Type.Text,
				primary: this.extendedWeight(false, weightUnits).toLocaleString(),
				alignment: align.Option.End,
				dim,
				classList: ["item-weight-extended"],
			}),
		}
	}

	get adjustedValue(): MaybePromise<number> {
		if (this.parent?.pack) return this.#adjustedValue()

		return valueAdjustedForModifiers(
			this.parent as ItemInst<ItemType.Equipment | ItemType.EquipmentContainer>,
			this.value,
			this.allModifiers as Collection<ItemInst<ItemType.EquipmentModifier>>,
		)
	}

	async #adjustedValue(): Promise<number> {
		return valueAdjustedForModifiers(
			this.parent as ItemInst<ItemType.Equipment | ItemType.EquipmentContainer>,
			this.value,
			await this.allModifiers,
		)
	}

	get extendedValue(): MaybePromise<number> {
		return this.adjustedValue
	}

	adjustedWeight(forSkills: boolean, units: Weight.Unit): MaybePromise<number> {
		if (forSkills && this.ignore_weight_for_skills && this.equipped) {
			return 0
		}
		return weightAdjustedForModifiers(
			this.parent as ItemInst<ItemType.Equipment | ItemType.EquipmentContainer>,
			this.weight,
			this.allModifiers,
			units,
		)
	}

	extendedWeight(forSkills: boolean, units: Weight.Unit): MaybePromise<number> {
		const features = this.hasTemplate(ItemTemplateType.Feature) ? this.features : []
		let children: ItemInst<ItemType.Equipment | ItemType.EquipmentContainer>[] = []
		if (this.hasTemplate(ItemTemplateType.Container)) {
			if (this.children instanceof Promise) {
				;(async () => {
					children = Array.from(await this.children) as ItemInst<
						ItemType.Equipment | ItemType.EquipmentContainer
					>[]
				})()
			} else {
				children = Array.from(this.children) as ItemInst<ItemType.Equipment | ItemType.EquipmentContainer>[]
			}
		}
		return extendedWeightAdjustedForModifiers(
			this.parent as ItemInst<ItemType.Equipment | ItemType.EquipmentContainer>,
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

	protected _fillWithNameableKeysFromEmbeds(m: Map<string, string>, existing: Map<string, string>): void {
		const modifiers = this.allModifiers
		const attacks = this.attacks

		if (!(modifiers instanceof Promise))
			for (const modifier of modifiers) {
				modifier.system.fillWithNameableKeys(m, modifier.system.replacements)
			}

		for (const attack of attacks) {
			attack.fillWithNameableKeys(m, existing)
		}
	}
}

interface EquipmentFieldsTemplate extends ModelPropsFromSchema<EquipmentFieldsTemplateSchema> {
	get processedNotes(): string
	get modifiers(): MaybePromise<
		Collection<ItemInst<ItemType.EquipmentModifier | ItemType.EquipmentModifierContainer>>
	>
	get attacks(): (AttackMelee | AttackRanged)[]
	get meleeAttacks(): AttackMelee[]
	get rangedAttacks(): AttackRanged[]
	get allModifiers(): MaybePromise<Collection<ItemInst<ItemType.EquipmentModifier>>>

	open: boolean | null
}

type EquipmentFieldsTemplateSchema = {
	tech_level: ToggleableStringField<string, string, true, false, true>
	legality_class: ToggleableStringField<string, string, true, false, true>
	rated_strength: ToggleableNumberField<number, number, true, false, true>
	quantity: ToggleableNumberField<number, number, true, false, true>
	level: ToggleableNumberField<number, number, true, false, true>
	value: ToggleableNumberField<number, number, true, false, true>
	weight: WeightField<string, string, true, false, true>
	max_uses: ToggleableNumberField<number, number, true, false, true>
	uses: ToggleableNumberField<number, number, true, true, true>
	equipped: ToggleableBooleanField<boolean, boolean, true, false, true>
	ignore_weight_for_skills: ToggleableBooleanField<boolean, boolean, true, false, true>
	other: fields.BooleanField<boolean, boolean, true, false, true>
}
export { EquipmentFieldsTemplate, type EquipmentFieldsTemplateSchema }
