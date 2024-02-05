import { ItemSheetGCS } from "@item/gcs/sheet.ts"
import { SpellGURPS } from "./document.ts"
import { ItemSheetOptions } from "@item/base/sheet.ts"

export class SpellSheet<IType extends SpellGURPS = SpellGURPS> extends ItemSheetGCS<IType> {
	static override get defaultOptions(): ItemSheetOptions {
		const options = super.defaultOptions
		fu.mergeObject(options, {
			classes: options.classes.concat(["spell"]),
		})
		return options
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
