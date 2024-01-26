import { SYSTEM_NAME } from "@module/data/index.ts"

export const TokenUtil = {
	askWhichToken: async function (tokens: Token[]): Promise<Token | undefined> {
		let token: Token | undefined
		const dialog = new Dialog(
			{
				title: game.i18n.localize("gurps.token.select"),
				content: await renderTemplate(`systems/${SYSTEM_NAME}/templates/token/select_token.hbs`, {
					tokens: tokens,
				}),
				buttons: {
					apply: {
						icon: '<i class="apply-button gcs-checkmark"></i>',
						label: game.i18n.localize("gurps.misc.apply"),
						callback: html => {
							const name = (html as JQuery<HTMLElement>).find("select option:selected").text().trim()
							const target = tokens.find(token => token.name === name)
							token = target
						},
					},
				},
				default: "apply",
				close: () => {
					token = undefined
				},
			},
			{ width: 300 },
		)
		dialog.render(true)
		return token
	},
}
