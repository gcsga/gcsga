import { ItemType } from "@module/data/constants.ts"
import { FeatureSet } from "@module/data/feature/types.ts"
import { SheetSettings } from "@module/data/sheet-settings.ts"
import { MaybePromise } from "@module/data/types.ts"
import { ItemGURPS2 } from "@module/document/item.ts"
import { Nameable } from "@module/util/nameable.ts"
import { LocalizeGURPS, StringBuilder, Weight, align, cell, display } from "@util"
import { ItemDataModel } from "../abstract.ts"
import { CellData } from "../components/cell-data.ts"
import {
	ItemInst,
	extendedWeightAdjustedForModifiers,
	valueAdjustedForModifiers,
	weightAdjustedForModifiers,
} from "../helpers.ts"
import { ItemTemplateType } from "../types.ts"
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./basic-information.ts"
import { ContainerTemplate, ContainerTemplateSchema } from "./container.ts"
import { FeatureTemplate, FeatureTemplateSchema } from "./features.ts"
import { PrereqTemplate, PrereqTemplateSchema } from "./prereqs.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./replacements.ts"
import fields = foundry.data.fields

class EquipmentFieldsTemplate extends ItemDataModel.mixin(
	BasicInformationTemplate,
	PrereqTemplate,
	FeatureTemplate,
	ContainerTemplate,
	ReplacementTemplate,
) {
	static override defineSchema(): EquipmentFieldsTemplateSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			tech_level: new fields.StringField({
				required: true,
				nullable: false,
				initial: "",
				label: "GURPS.Item.Equipment.FIELDS.TechLevel.Name",
			}),
			legality_class: new fields.StringField({
				required: true,
				nullable: false,
				initial: "",
				label: "GURPS.Item.Equipment.FIELDS.LegalityClass.Name",
			}),
			rated_strength: new fields.NumberField({
				required: true,
				nullable: false,
				integer: true,
				min: 0,
				initial: 0,
				label: "GURPS.Item.Equipment.FIELDS.RatedStrength.Name",
			}),
			quantity: new fields.NumberField({
				required: true,
				nullable: false,
				integer: true,
				min: 0,
				initial: 0,
				label: "GURPS.Item.Equipment.FIELDS.Quantity.Name",
			}),
			level: new fields.NumberField({
				required: true,
				nullable: false,
				integer: true,
				min: 0,
				initial: 0,
				label: "GURPS.Item.Equipment.FIELDS.Level.Name",
			}),
			value: new fields.NumberField({
				required: true,
				nullable: false,
				min: 0,
				initial: 0,
				label: "GURPS.Item.Equipment.FIELDS.Value.Name",
			}),
			weight: new fields.StringField({
				required: true,
				nullable: false,
				initial: "0 lb",
				label: "GURPS.Item.Equipment.FIELDS.Weight.Name",
			}),
			max_uses: new fields.NumberField({
				required: true,
				nullable: false,
				integer: true,
				min: 0,
				initial: 0,
				label: "GURPS.Item.Equipment.FIELDS.MaxUses.Name",
			}),
			uses: new fields.NumberField({
				required: true,
				nullable: true,
				integer: true,
				min: 0,
				initial: null,
				label: "GURPS.Item.Equipment.FIELDS.Uses.Name",
			}),
			equipped: new fields.BooleanField({
				required: true,
				nullable: false,
				initial: true,
				label: "GURPS.Item.Equipment.FIELDS.Equipped.Name",
			}),
			ignore_weight_for_skills: new fields.BooleanField({
				required: true,
				nullable: false,
				initial: false,
				label: "GURPS.Item.Equipment.FIELDS.IgnoreWeightForSkills.Name",
			}),
			other: new fields.BooleanField({ required: true, nullable: false, initial: false }),
		}) as EquipmentFieldsTemplateSchema
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

	override get cellData(): Record<string, CellData> {
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
			name: new CellData({
				type: cell.Type.Text,
				primary: this.processedName,
				secondary: this.secondaryText(display.Option.isInline),
				alignment: align.Option.Start,
				dim,
				classList: ["item-name"],
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
				primary: this.adjustedValue().toLocaleString(),
				alignment: align.Option.End,
				dim,
				classList: ["item-cost"],
			}),
			extendedCost: new CellData({
				type: cell.Type.Text,
				primary: this.extendedValue().toLocaleString(),
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

	adjustedValue(): MaybePromise<number> {
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

	extendedValue(): MaybePromise<number> {
		return this.adjustedValue()
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

	override get allModifiers(): MaybePromise<Collection<ItemInst<ItemType.EquipmentModifier>>> {
		if (!this.parent) return new Collection()
		if (this.parent.pack) return this._allModifiers()

		const allModifiers = new Collection<ItemInst<ItemType.EquipmentModifier>>()

		for (const item of <Collection<ItemGURPS2>>(this as any).contents) {
			if (item.type === ItemType.EquipmentModifier)
				allModifiers.set(item.id, <ItemInst<ItemType.EquipmentModifier>>item)

			if (item.hasTemplate(ItemTemplateType.Container))
				for (const contents of <Collection<ItemGURPS2>>item.system.allContents) {
					if (contents.type === ItemType.EquipmentModifier)
						allModifiers.set(contents.id, <ItemInst<ItemType.EquipmentModifier>>contents)
				}
		}
		return allModifiers
	}

	private async _allModifiers(): Promise<Collection<ItemInst<ItemType.EquipmentModifier>>> {
		const allModifiers = new Collection<ItemInst<ItemType.EquipmentModifier>>()

		for (const item of <Collection<ItemGURPS2>>(this as any).contents) {
			if (item.type === ItemType.EquipmentModifier)
				allModifiers.set(item.id, <ItemInst<ItemType.EquipmentModifier>>item)

			if (item.hasTemplate(ItemTemplateType.Container))
				for (const contents of await item.system.allContents) {
					if (contents.type === ItemType.EquipmentModifier)
						allModifiers.set(contents.id, <ItemInst<ItemType.EquipmentModifier>>contents)
				}
		}
		return allModifiers
	}

	/** Features */
	override addFeaturesToSet(featureSet: FeatureSet): void {
		if (!this.equipped) return

		for (const f of this.features) {
			this._addFeatureToSet(f, featureSet, 0)
		}
	}

	/** Nameables */
	override fillWithNameableKeys(
		m: Map<string, string>,
		existing: Map<string, string> = this.nameableReplacements,
	): void {
		super.fillWithNameableKeys(m, existing)

		Nameable.extract(this.notes, m, existing)

		this._fillWithNameableKeysFromPrereqs(m, existing)
		this._fillWithNameableKeysFromFeatures(m, existing)
		this._fillWithNameableKeysFromEmbeds(m, existing)
	}

	protected async _fillWithNameableKeysFromEmbeds(
		m: Map<string, string>,
		existing: Map<string, string>,
	): Promise<void> {
		const modifiers = await this.allModifiers
		const weapons = await this.weapons

		for (const modifier of modifiers) {
			modifier.system.fillWithNameableKeys(m, modifier.system.nameableReplacements)
		}
		for (const weapon of weapons) {
			weapon.system.fillWithNameableKeys(m, existing)
		}
	}
}

interface EquipmentFieldsTemplate extends ModelPropsFromSchema<EquipmentFieldsTemplateSchema> {
	get modifiers(): MaybePromise<
		Collection<ItemInst<ItemType.EquipmentModifier | ItemType.EquipmentModifierContainer>>
	>
	get weapons(): MaybePromise<Collection<ItemInst<ItemType.WeaponMelee | ItemType.WeaponRanged>>>
}

type EquipmentFieldsTemplateSchema = ContainerTemplateSchema &
	ReplacementTemplateSchema &
	BasicInformationTemplateSchema &
	PrereqTemplateSchema &
	FeatureTemplateSchema & {
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
		other: fields.BooleanField<boolean, boolean, true, false, true>
	}
export { EquipmentFieldsTemplate, type EquipmentFieldsTemplateSchema }
