import { EffectPanel } from "@item/effect/panel.ts"
import { ModifierBucket } from "@module/apps/mod_bucket/button.ts"
import { ModifierList } from "@module/apps/mod_list/document.ts"

export const SetGameGURPS = {
	onInit: (): void => {
		const initSafe: Partial<(typeof game)["gurps"]> = {
			effectPanel: new EffectPanel(),
			modifierList: new ModifierList(),
			modifierBucket: new ModifierBucket(),
		}
		game.gurps = fu.mergeObject(game.gurps ?? {}, initSafe)
	},
}
