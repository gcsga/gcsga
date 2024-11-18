import { ItemDataModel } from "./abstract.ts"
import fields = foundry.data.fields
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { ContainerTemplate, ContainerTemplateSchema } from "./templates/container.ts"
import { ItemType } from "../constants.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"
import { cell, display, StringBuilder } from "@util"
import { CellData, CellDataOptions } from "./components/cell-data.ts"
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

	override cellData(options: CellDataOptions = {}): Record<string, CellData> {
		const { type } = options
		const isSpellContainerSheet = type === ItemType.SpellContainer

		return {
			dropdown: new CellData({
				type: cell.Type.Dropdown,
				open: this.open,
				classList: ["item-dropdown"],
			}),
			name: new CellData({
				type: cell.Type.Text,
				primary: this.processedName,
				secondary: this.secondaryText(display.Option.isInline),
				tooltip: this.secondaryText(display.Option.isTooltip),
			}),
			resist: new CellData({
				condition: isSpellContainerSheet,
			}),
			class: new CellData({
				condition: isSpellContainerSheet,
			}),
			college: new CellData({
				condition: isSpellContainerSheet,
			}),
			castingCost: new CellData({
				condition: isSpellContainerSheet,
			}),
			maintenanceCost: new CellData({
				condition: isSpellContainerSheet,
			}),
			castingTime: new CellData({
				condition: isSpellContainerSheet,
			}),
			duration: new CellData({
				condition: isSpellContainerSheet,
			}),
			difficulty: new CellData({
				condition: isSpellContainerSheet,
			}),
			level: new CellData({
				condition: !isSpellContainerSheet,
			}),
			relativeLevel: new CellData({
				condition: !isSpellContainerSheet,
			}),
			points: new CellData({}),
		}
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
