import { SYSTEM_NAME } from "@module/data/index.ts"

export const TokenUtil = {
	askWhichToken: async function (tokens: Token[], callback: (token: Token | undefined) => void): Promise<void> {
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
							callback(target)
						},
					},
				},
				default: "apply",
				// close: () => {
				// 	return
				// },
			},
			{ width: 300 },
		)
		await dialog.render(true)
	},
}
