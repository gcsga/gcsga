import { StringBuilder, affects, align, cell, display, tmcost } from "@util"
import { ItemDataModel } from "../abstract.ts"
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { FeatureTemplate, FeatureTemplateSchema } from "./templates/features.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"
import fields = foundry.data.fields
import { ItemGURPS2 } from "@module/document/item.ts"
import { TraitData } from "./trait.ts"
import { Nameable } from "@module/util/nameable.ts"
import { CellData } from "./fields/cell-data.ts"
import { SheetSettings } from "../sheet-settings.ts"

class TraitModifierData extends ItemDataModel.mixin(BasicInformationTemplate, FeatureTemplate, ReplacementTemplate) {
	/** Allows dynamic setting of containing trait for arbitrary value calculation */
	private _trait: ItemGURPS2 | null = null

	static override defineSchema(): TraitModifierSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			...super.defineSchema(),
			cost: new fields.NumberField(),
			levels: new fields.NumberField(),
			cost_type: new fields.StringField<tmcost.Type>(),
			use_level_from_trait: new fields.BooleanField<boolean>({ required: true, nullable: false, initial: true }),
			affects: new fields.StringField<affects.Option>(),
			disabled: new fields.BooleanField({ initial: false }),
		}) as TraitModifierSchema
	}

	override get cellData(): Record<string, CellData> {
		return {
			enabled: new CellData({
				type: cell.Type.Toggle,
				checked: this.enabled,
				align: align.Option.Middle,
			}),
			name: new CellData({
				type: cell.Type.Text,
				primary: this.nameWithReplacements,
				secondary: this.secondaryText(display.Option.isInline),
				tooltip: this.secondaryText(display.Option.isTooltip),
			}),
			cost: new CellData({
				type: cell.Type.Text,
				primary: this.costDescription,
			}),
			tags: new CellData({
				type: cell.Type.Tags,
				primary: this.combinedTags,
			}),
			reference: new CellData({
				type: cell.Type.PageRef,
				primary: this.reference,
				secondary: this.reference_highlight === "" ? this.nameWithReplacements : this.reference_highlight,
			}),
		}
	}

	get enabled(): boolean {
		return !this.disabled
	}

	get trait(): (ItemGURPS2 & { system: TraitData }) | null {
		// @ts-expect-error type definition error
		return (this._trait as ItemGURPS2 & { system: TraitData }) ?? null
	}

	set trait(trait: ItemGURPS2 | null) {
		this._trait = trait
	}

	get costModifier(): number {
		return this.cost * this.costMultiplier
	}

	get isLeveled(): boolean {
		if (this.use_level_from_trait) {
			if (this.trait === null) return false
			return this.trait.system.can_level
		}
		return this.levels > 0
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
			if (this.trait !== null && this.trait.system.can_level) {
				multiplier = this.trait.system.currentLevel
			}
		} else {
			multiplier = this.levels
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

	// Returns the formatted cost for display
	get costDescription(): string {
		let base = ""
		switch (this.cost_type) {
			case tmcost.Type.Percentage:
				base = this.costModifier.signedString() + tmcost.Type.toString(tmcost.Type.Percentage)
				break
			case tmcost.Type.Points:
				base = this.costModifier.signedString()
				break
			case tmcost.Type.Multiplier:
				base = tmcost.Type.toString(tmcost.Type.Multiplier) + this.costModifier.signedString()
				break
			default:
				console.error(`unknown cost type: "${this.cost_type}"`)
				base = this.costModifier.signedString() + tmcost.Type.toString(tmcost.Type.Percentage)
		}
		const desc = affects.Option.altString(this.affects)
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

	/** Nameables */
	fillWithNameableKeys(m: Map<string, string>, existing?: Map<string, string>): void {
		if (this.disabled) return
		if (!existing) existing = this.nameableReplacements

		Nameable.extract(this.name, m, existing)
		Nameable.extract(this.notes, m, existing)
		for (const feature of this.features) {
			feature.fillWithNameableKeys(m, existing)
		}
	}
}

interface TraitModifierData extends ModelPropsFromSchema<TraitModifierSchema> {}

type TraitModifierSchema = BasicInformationTemplateSchema &
	FeatureTemplateSchema &
	ReplacementTemplateSchema & {
		cost: fields.NumberField<number, number, true, false, true>
		levels: fields.NumberField<number, number, true, false, true>
		cost_type: fields.StringField<tmcost.Type>
		use_level_from_trait: fields.BooleanField<boolean, boolean, true, false, true>
		affects: fields.StringField<affects.Option>
		disabled: fields.BooleanField<boolean>
	}

export { TraitModifierData, type TraitModifierSchema }
