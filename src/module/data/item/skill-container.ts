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

class SkillContainerData extends ItemDataModel.mixin(BasicInformationTemplate, ContainerTemplate, ReplacementTemplate) {
	static override childTypes = new Set([ItemType.Skill, ItemType.SkillContainer, ItemType.Technique])

	override async getSheetData(context: Record<string, unknown>): Promise<void> {
		context.detailsParts = ["gurps.details-container"]
		context.embedsParts = ["gurps.embeds-skill"]
	}

	static override defineSchema(): SkillContainerSchema {
		const fields = foundry.data.fields
		return this.mergeSchema(super.defineSchema(), {
			template_picker: new fields.EmbeddedDataField(TemplatePicker),
		}) as SkillContainerSchema
	}

	override cellData(options: CellDataOptions = {}): Record<string, CellData> {
		const { type, level } = options
		const isSkillContainerSheet = type === ItemType.SkillContainer

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
				classList: ["item-name"],
				indentLevel: level,
			}),
			difficulty: new CellData({
				classList: ["item-difficulty"],
				condition: isSkillContainerSheet,
			}),
			level: new CellData({
				classList: ["item-skill-level"],
				condition: !isSkillContainerSheet,
			}),
			relativeLevel: new CellData({
				classList: ["item-rsl"],
				condition: !isSkillContainerSheet,
			}),
			points: new CellData({
				classList: ["item-points"],
				condition: !isSkillContainerSheet,
			}),
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

interface SkillContainerData extends ModelPropsFromSchema<SkillContainerSchema> {}

type SkillContainerSchema = BasicInformationTemplateSchema &
	ContainerTemplateSchema &
	ReplacementTemplateSchema & {
		template_picker: fields.EmbeddedDataField<TemplatePicker, true, false, true>
	}

export { SkillContainerData, type SkillContainerSchema }
