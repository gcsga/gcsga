// import { prepareSelectOptions } from "@module/data/select.ts"

export const I18nInit = {
	listen: (): void => {
		Hooks.once("i18nInit", () => {
			// game.gurps.ConditionManager.initialize()
			// game.gurps.ManeuverManager.initialize()
			// prepareSelectOptions()
		})
	},
}
