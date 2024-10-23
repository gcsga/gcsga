import { StringBuilder, affects, align, cell, display, tmcost } from "@util"
import { ItemDataModel } from "./abstract.ts"
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { FeatureTemplate, FeatureTemplateSchema } from "./templates/features.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"
import fields = foundry.data.fields
import { ItemGURPS2 } from "@module/document/item.ts"
import { CellData, CellDataOptions } from "./components/cell-data.ts"
import { SheetSettings } from "../sheet-settings.ts"
import { Nameable } from "@module/util/index.ts"
import { ItemInst } from "./helpers.ts"
import { ItemType } from "../constants.ts"
import { FeatureSet } from "../feature/types.ts"

class TraitModifierData extends ItemDataModel.mixin(BasicInformationTemplate, FeatureTemplate, ReplacementTemplate) {
	override async getSheetData(context: Record<string, unknown>): Promise<void> {
		context.detailsParts = ["gurps.details-trait-modifier"]
	}

	/** Allows dynamic setting of containing trait for arbitrary value calculation */
	private declare _trait: ItemGURPS2 | null
	static override defineSchema(): TraitModifierSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			...super.defineSchema(),
			cost: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 0,
				label: "GURPS.Item.TraitModifier.FIELDS.Cost.Name",
			}),
			levels: new fields.NumberField({
				required: true,
				nullable: true,
				initial: null,
				label: "GURPS.Item.TraitModifier.FIELDS.Cost.Name",
			}),
			cost_type: new fields.StringField({
				required: true,
				nullable: false,
				choices: tmcost.TypesChoices,
				initial: tmcost.Type.Percentage,
			}),
			use_level_from_trait: new fields.BooleanField({
				required: true,
				nullable: false,
				initial: true,
				label: "GURPS.Item.TraitModifier.FIELDS.UseLevelFromTrait.Name",
			}),
			affects: new fields.StringField({
				required: true,
				nullable: false,
				blank: false,
				choices: affects.OptionsChoices,
				initial: affects.Option.Total,
			}),
			disabled: new fields.BooleanField({
				required: true,
				nullable: false,
				initial: false,
				label: "GURPS.Item.TraitModifier.FIELDS.Enabled.Name",
			}),
		}) as TraitModifierSchema
	}

	static override cleanData(
		source?: Partial<SourceFromSchema<TraitModifierSchema>> & Record<string, unknown>,
		options?: Record<string, unknown>,
	): SourceFromSchema<TraitModifierSchema> {
		if (source) {
			source.levels = source.use_level_from_trait ? null : (source.levels ?? 0)
		}

		return super.cleanData(source, options) as SourceFromSchema<TraitModifierSchema>
	}

	override cellData(_options: { hash: CellDataOptions } = { hash: {} }): Record<string, CellData> {
		return {
			enabled: new CellData({
				type: cell.Type.Toggle,
				checked: this.enabled,
				alignment: align.Option.Middle,
				classList: ["item-toggle"],
			}),
			dropdown: new CellData({
				type: cell.Type.Text,
				classList: ["item-dropdown"],
			}),
			name: new CellData({
				type: cell.Type.Text,
				primary: this.nameWithReplacements,
				secondary: this.secondaryText(display.Option.isInline),
				tooltip: this.secondaryText(display.Option.isTooltip),
				classList: ["item-name"],
			}),
			cost: new CellData({
				type: cell.Type.Text,
				primary: this.costDescription,
				classList: ["item-cost-adjustment"],
			}),
		}
	}

	get enabled(): boolean {
		return !this.disabled
	}

	get trait(): ItemInst<ItemType.Trait | ItemType.TraitContainer> | null {
		return (this._trait = this._getTrait())
	}

	set trait(trait: ItemInst<ItemType.Trait | ItemType.TraitContainer> | null) {
		this._trait = trait
	}

	private _getTrait(): ItemInst<ItemType.Trait | ItemType.TraitContainer> | null {
		let container = this.parent.container
		// TODO: get rid of when we figure out Promise handling
		if (container instanceof Promise) return null
		if (container === null) return null
		let i = 0
		while (!container.isOfType(ItemType.Trait, ItemType.TraitContainer) && i < ItemDataModel.MAX_DEPTH) {
			container = container.container
			if (container instanceof Promise) return null
			if (container === null) return null
			if (container.isOfType(ItemType.Trait, ItemType.TraitContainer)) break
		}
		return container as ItemInst<ItemType.Trait | ItemType.TraitContainer>
	}

	get costModifier(): number {
		return this.cost * this.costMultiplier
	}

	get isLeveled(): boolean {
		if (this.use_level_from_trait) {
			if (this.trait === null) return false
			return this.trait.system.isLeveled
		}
		return (this.levels ?? 0) > 0
	}

	get currentLevel(): number {
		if (!this.disabled && this.isLeveled) {
			return this.costMultiplier
		}
		return 0
	}

	get costMultiplier(): number {
		if (!this.isLeveled) return 1
		let multiplier = 0
		if (this.use_level_from_trait) {
			if (this.trait !== null && this.trait.system.isLeveled) {
				multiplier = this.trait.system.currentLevel
			}
		} else {
			multiplier = this.levels ?? 0
		}
		if (multiplier <= 0) multiplier = 1
		return multiplier
	}

	// Returns the formatted name for display
	get processedName(): string {
		const buffer = new StringBuilder()
		buffer.push(this.nameWithReplacements)
		if (this.isLeveled) {
			buffer.push(` ${this.currentLevel.toString()}`)
		}
		return buffer.toString()
	}

	secondaryText(optionChecker: (option: display.Option) => boolean): string {
		if (optionChecker(SheetSettings.for(this.parent.actor).notes_display)) return this.notesWithReplacements
		return ""
	}

	get costWithType(): string {
		switch (this.cost_type) {
			case tmcost.Type.Percentage:
				return (
					this.costModifier.signedString() + game.i18n.localize(tmcost.Type.toString(tmcost.Type.Percentage))
				)
			case tmcost.Type.Points:
				return this.costModifier.signedString()
			case tmcost.Type.Multiplier:
				return game.i18n.localize(tmcost.Type.toString(tmcost.Type.Multiplier)) + this.costModifier.toString()
		}
	}

	// Returns the formatted cost for display
	get costDescription(): string {
		let base = this.costWithType
		const desc = game.i18n.localize(affects.Option.altString(this.affects))
		if (desc !== "") base += ` ${desc}`
		return base
	}

	get fullDescription(): string {
		const buffer = new StringBuilder()
		buffer.push(this.processedName)
		if (this.notes !== "") buffer.push(` (${this.notesWithReplacements})`)
		if (SheetSettings.for(this.parent.actor).show_trait_modifier_adj) buffer.push(` [${this.costDescription}]`)
		return buffer.toString()
	}

	/** Features */
	override addFeaturesToSet(featureSet: FeatureSet): void {
		if (!this.enabled) return
		if (!this.trait || !this.trait.system.enabled) return

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

interface TraitModifierData extends ModelPropsFromSchema<TraitModifierSchema> {}

type TraitModifierSchema = BasicInformationTemplateSchema &
	FeatureTemplateSchema &
	ReplacementTemplateSchema & {
		cost: fields.NumberField<number, number, true, false, true>
		levels: fields.NumberField<number, number, true, true, true>
		cost_type: fields.StringField<tmcost.Type>
		use_level_from_trait: fields.BooleanField<boolean, boolean, true, false, true>
		affects: fields.StringField<affects.Option>
		disabled: fields.BooleanField<boolean>
	}

export { TraitModifierData, type TraitModifierSchema }
