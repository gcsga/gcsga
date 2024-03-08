import { SYSTEM_NAME } from "@module/data/constants.ts"
import { CharacterGURPS } from "./document.ts"
import { AbstractAttributeDef } from "@system"

class CharacterConfigSheet<TActor extends CharacterGURPS> extends DocumentSheet<TActor> {
	get actor(): TActor {
		return this.object
	}

	static override get defaultOptions(): DocumentSheetOptions {
		return fu.mergeObject(super.defaultOptions, {
			classes: ["character-config", "gurps"],
			template: `systems/${SYSTEM_NAME}/templates/actor/character/config/config.hbs`,
			width: 540,
			// resizable: true,
			// submitOnChange: true,
			// submitOnClose: true,
			// closeOnSubmit: false,
			tabs: [
				{
					navSelector: "nav",
					contentSelector: "section.content",
					initital: "sheet-settings",
				},
			],
			dragDrop: [{ dragSelector: ".item-list .item .controls .drag", dropSelector: null }],
			scrollY: [".content", ".item-list", ".tab"],
		})
	}

	override async getData(options?: ActorSheetOptions): Promise<CharacterConfigSheetData<TActor>> {
		const sheetData = await super.getData(options)

		const actor = this.actor

		const attributes = actor.settings.attributes.sort((a, b) => a.order - b.order)
		const resourceTrackers = actor.settings.resource_trackers.sort((a, b) => a.order - b.order)
		const moveTypes = actor.settings.move_types.sort((a, b) => a.order - b.order)

		return {
			...sheetData,
			actor,
			system: this.actor.system,
			settings: this.actor.flags[SYSTEM_NAME],
			attributes: {
				attributes,
				resourceTrackers,
				moveTypes,
			},

			config: CONFIG.GURPS,
		}
	}
}

interface CharacterConfigSheetData<TActor extends CharacterGURPS = CharacterGURPS> extends DocumentSheetData<TActor> {
	actor: TActor
	system: TActor["system"]
	settings: Record<string, unknown>
	attributes: Record<string, AbstractAttributeDef[]>
	config: ConfigGURPS["GURPS"]
}

export { CharacterConfigSheet }
