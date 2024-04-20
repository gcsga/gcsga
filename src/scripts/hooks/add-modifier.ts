import { HOOKS } from "@module/data/constants.ts"

export const AddModifier = {
	listen: (): void => {
		Hooks.on(HOOKS.AddModifier, () => {
			game.gurps.modifierBucket.refresh()
			game.gurps.effectPanel.refresh()
			if (!canvas.scene) return
		})
	},
}
