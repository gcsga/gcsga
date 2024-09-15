// import { EffectPanel } from "@item/abstract-effect/panel.ts"
// import { CompendiumBrowser } from "@module/apps/compendium-browser/index.ts"
import { ModifierBucket } from "@module/apps/modifier-bucket/button.ts"
import { ModifierList } from "@module/apps/modifier-list/document.ts"
// import { ManeuverManager } from "@system/maneuver-manager.ts"

export const SetGameGURPS = {
	onInit: (): void => {
		const initSafe: Partial<(typeof game)["gurps"]> = {
			// ConditionManager,
			// ManeuverManager,
			// mook: MookGeneratorSheet,
			// effectPanel: new EffectPanel(),
			modifierBucket: new ModifierBucket(),
			modifierList: new ModifierList(),
		}
		game.gurps = fu.mergeObject(game.gurps ?? {}, initSafe)
	},

	onReady: (): void => {
		// game.gurps.compendiumBrowser = new CompendiumBrowser()
	},
}
