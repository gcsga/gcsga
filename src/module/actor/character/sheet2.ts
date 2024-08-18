import { ActorGURPS } from "@actor/base/document.ts"
import { SYSTEM_NAME } from "@module/data/constants.ts"
import { HandlebarsApplicationDocumentSheet } from "types/foundry/client-esm/applications/api/handlebars-application.js"

const { api, sheets } = foundry.applications

class CharacterSheetGURPSv2 extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2<ActorGURPS>) {
	static PARTS = {
		header: {
			template: `systems/${SYSTEM_NAME}/templates/actor/header.hbs`,
		},
	}

	protected override _configureRenderOptions(options: DocumentSheetRenderOptions): void {
		console.log(options)
		super._configureRenderOptions(options)
	}

	protected override async _prepareContext(options: DocumentSheetRenderOptions): Promise<ApplicationRenderContext> {
		const context = await super._prepareContext(options)
		return {
			...context,
			actor: this.actor,
			system: this.actor.system,
		}
	}
}

interface CharacterSheetGURPSv2
	extends HandlebarsApplicationDocumentSheet<ActorGURPS>,
		Omit<foundry.applications.sheets.ActorSheetV2<ActorGURPS>, "_renderHTML"> {}

export { CharacterSheetGURPSv2 }
