import { ItemSheetGCS } from "@item/gcs/sheet.ts"
import { SkillContainerGURPS } from "./document.ts"
import { ItemSheetOptions } from "@item/base/sheet.ts"

export class SkillContainerSheet<IType extends SkillContainerGURPS = SkillContainerGURPS> extends ItemSheetGCS<IType> {
	static override get defaultOptions(): ItemSheetOptions {
		const options = super.defaultOptions
		fu.mergeObject(options, {
			classes: options.classes.concat(["skill_container"]),
		})
		return options
	}
}
