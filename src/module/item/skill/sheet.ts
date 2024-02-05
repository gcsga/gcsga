import { ItemSheetGCS } from "@item/gcs/sheet.ts"
import { SkillGURPS } from "./document.ts"
import { ItemSheetDataGURPS, ItemSheetOptions } from "@item/base/sheet.ts"

export class SkillSheet<IType extends SkillGURPS = SkillGURPS> extends ItemSheetGCS<IType> {
	static override get defaultOptions(): ItemSheetOptions {
		const options = super.defaultOptions
		fu.mergeObject(options, {
			classes: options.classes.concat(["skill"]),
		})
		return options
	}

	override async getData(options: Partial<ItemSheetOptions> = {}): Promise<ItemSheetDataGURPS<IType>> {
		const data = super.getData(options)
		return fu.mergeObject(data, {
			defaults: this.object.defaults,
		})
	}

	protected override async _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
		const attribute = formData.attribute ?? this.item.attribute
		const difficulty = formData.difficulty ?? this.item.difficulty
		formData["system.difficulty"] = `${attribute}/${difficulty}`
		delete formData.attribute
		delete formData.difficulty
		return super._updateObject(event, formData)
	}
}
