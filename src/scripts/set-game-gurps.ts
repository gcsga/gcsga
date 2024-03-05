import { EffectPanel } from "@item/abstract-effect/panel.ts"
import { CompendiumBrowser } from "@module/apps/compendium-browser/index.ts"
import { ModifierBucket } from "@module/apps/modifier-bucket/button.ts"
import { ModifierList } from "@module/apps/modifier-list/document.ts"

export const SetGameGURPS = {
	onInit: (): void => {
		const initSafe: Partial<(typeof game)["gurps"]> = {
			effectPanel: new EffectPanel(),
			modifierList: new ModifierList(),
			modifierBucket: new ModifierBucket(),
		}
		game.gurps = fu.mergeObject(game.gurps ?? {}, initSafe)
	},

	onReady: (): void => {
		game.gurps.compendiumBrowser = new CompendiumBrowser()
	},
}
