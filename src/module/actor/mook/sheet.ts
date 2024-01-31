import { CharacterSheetGURPS } from "@actor/sheet.ts"
import { SYSTEM_NAME } from "@module/data/misc.ts"

class MookSheetGURPS extends CharacterSheetGURPS {
	override get template(): string {
		return `/systems/${SYSTEM_NAME}/templates/actor/mook/sheet.hbs`
	}

	static override get defaultOptions(): ActorSheetOptions {
		const classes = super.defaultOptions.classes
		classes.splice(super.defaultOptions.classes.indexOf("character", 1))
		return fu.mergeObject(super.defaultOptions, {
			height: 600,
			width: 700,
			classes: classes.concat(["mook"]),
			scrollY: ["#main"],
		})
	}
}

export { MookSheetGURPS }
