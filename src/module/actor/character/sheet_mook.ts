import { SYSTEM_NAME } from "@module/data"
import { CharacterSheetGURPS } from "./sheet"

export class MookSheetGURPS extends CharacterSheetGURPS {
	override get template(): string {
		// if (!game.user.isGM && this.actor.limited)
		// 	return `/systems/${SYSTEM_NAME}/templates/actor/character/sheet-limited.hbs`
		return `/systems/${SYSTEM_NAME}/templates/actor/mook/sheet.hbs`
	}

	static override get defaultOptions(): ActorSheet.Options {
		let classes = super.defaultOptions.classes
		classes.splice(super.defaultOptions.classes.indexOf("character", 1))
		return mergeObject(super.defaultOptions, {
			height: 600,
			width: 700,
			classes: classes.concat(["mook"]),
			scrollY: ["#main"],
		})
	}
}
