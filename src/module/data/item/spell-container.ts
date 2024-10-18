import { ItemDataModel } from "./abstract.ts"
import fields = foundry.data.fields
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { ContainerTemplate, ContainerTemplateSchema } from "./templates/container.ts"
import { ItemType } from "../constants.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"
import { cell, display, StringBuilder } from "@util"
import { CellData } from "./components/cell-data.ts"
import { SheetSettings } from "../sheet-settings.ts"
import { TemplatePicker } from "./fields/template-picker.ts"

class SpellContainerData extends ItemDataModel.mixin(BasicInformationTemplate, ContainerTemplate, ReplacementTemplate) {
	static override childTypes = new Set([ItemType.Spell, ItemType.SpellContainer, ItemType.RitualMagicSpell])

	override async getSheetData(context: Record<string, unknown>): Promise<void> {
		context.detailsParts = ["gurps.details-container"]
		context.embedsParts = ["gurps.embeds-spell"]
	}

	static override defineSchema(): SpellContainerSchema {
		const fields = foundry.data.fields
		return this.mergeSchema(super.defineSchema(), {
			template_picker: new fields.EmbeddedDataField(TemplatePicker),
		}) as SpellContainerSchema
	}

	override cellData(options:{hash:CellDataOptions}={hash:{}}): Record<string, CellData> {
		return {
			name: new CellData({
				type: cell.Type.Text,
				primary: this.processedName,
				secondary: this.secondaryText(display.Option.isInline),
				tooltip: this.secondaryText(display.Option.isTooltip),
			}),
			resist: new CellData({}),
			class: new CellData({}),
			college: new CellData({}),
			castingCost: new CellData({}),
			maintenanceCost: new CellData({}),
			castingTime: new CellData({}),
			duration: new CellData({}),
			difficulty: new CellData({}),
			level: new CellData({}),
			relativeLevel: new CellData({}),
			points: new CellData({}),
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

	get processedName(): string {
		return this.nameWithReplacements
	}

	secondaryText(optionChecker: (option: display.Option) => boolean): string {
		const buffer = new StringBuilder()
		const settings = SheetSettings.for(this.parent.actor)
		if (optionChecker(settings.notes_display)) {
			buffer.appendToNewLine(this.processedNotes)
		}
		return buffer.toString()
	}
}

interface SpellContainerData extends ModelPropsFromSchema<SpellContainerSchema> {}

type SpellContainerSchema = BasicInformationTemplateSchema &
	ContainerTemplateSchema &
	ReplacementTemplateSchema & {
		template_picker: fields.EmbeddedDataField<TemplatePicker, true, false, true>
	}

export { SpellContainerData, type SpellContainerSchema }
