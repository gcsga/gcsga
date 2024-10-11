import { ItemDataModel } from "./abstract.ts"
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { ContainerTemplate, ContainerTemplateSchema } from "./templates/container.ts"
import { ItemType } from "../constants.ts"
import { ReplacementTemplate, ReplacementTemplateSchema } from "./templates/replacements.ts"
import { SheetSettings } from "../sheet-settings.ts"
import { cell, display } from "@util"
import { CellData } from "./components/cell-data.ts"

class EquipmentModifierContainerData extends ItemDataModel.mixin(
	BasicInformationTemplate,
	ContainerTemplate,
	ReplacementTemplate,
) {
	static override childTypes = new Set([ItemType.EquipmentModifier, ItemType.EquipmentModifierContainer])

	override async getSheetData(context: Record<string, unknown>): Promise<void> {
		context.detailsParts = ["gurps.details-container"]
		context.embedsParts = ["gurps.embeds-children"]
	}

	static override defineSchema(): EquipmentModifierContainerSchema {
		return this.mergeSchema(super.defineSchema(), {}) as EquipmentModifierContainerSchema
	}

	override get cellData(): Record<string, CellData> {
		return {
			enabled: new CellData(),
			name: new CellData({
				type: cell.Type.Text,
				primary: this.nameWithReplacements,
				secondary: this.secondaryText(display.Option.isInline),
				tooltip: this.secondaryText(display.Option.isTooltip),
			}),
			techLevel: new CellData(),
			cost: new CellData(),
			weight: new CellData(),
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

	secondaryText(optionChecker: (option: display.Option) => boolean): string {
		if (optionChecker(SheetSettings.for(this.parent.actor).notes_display)) return this.notesWithReplacements
		return ""
	}
}

interface EquipmentModifierContainerData extends ModelPropsFromSchema<EquipmentModifierContainerSchema> {}

type EquipmentModifierContainerSchema = BasicInformationTemplateSchema &
	ContainerTemplateSchema &
	ReplacementTemplateSchema & {}

export { EquipmentModifierContainerData, type EquipmentModifierContainerSchema }
