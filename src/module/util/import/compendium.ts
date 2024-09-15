import { SYSTEM_NAME } from "@data"
import { ChatMessageGURPS } from "@module/chat-message/document.ts"
import { LocalizeGURPS } from "@util"
import { GCS_FILE_VERSIONS, ImportedItemLibrarySource } from "./data.ts"
import { DialogGURPS } from "@module/apps/dialog.ts"
import { ItemImporter } from "./item.ts"
import { ItemGURPS2 } from "@module/document/item.ts"

class ItemCompendiumImporter {
	static async throwError(text: string): Promise<void> {
		ui.notifications.error(text)

		await ChatMessageGURPS.create({
			content: await renderTemplate(`systems/${SYSTEM_NAME}/templates/chat/character-import-error.hbs`, {
				lines: [text],
			}),
			whisper: [game.user.id],
		})
	}

	static showDialog(): void {
		setTimeout(async () => {
			new DialogGURPS(
				{
					title: LocalizeGURPS.translations.gurps.system.library_import.title_item,
					content: await renderTemplate(`systems/${SYSTEM_NAME}/templates/item-library-import.hbs`, {}),
					buttons: {
						import: {
							icon: '<i class="fas fa-file-import"></i>',
							label: LocalizeGURPS.translations.gurps.system.library_import.import,
							callback: (html: HTMLElement | JQuery<HTMLElement>) => {
								const form = $(html).find("form")[0]
								const files = form.data.files
								if (!files.length)
									ui.notifications?.error(LocalizeGURPS.translations.gurps.error.import.no_file)
								else {
									const file = files[0]
									readTextFromFile(file).then(text =>
										this.importCompendium({
											text: text,
											name: file.name,
											path: file.path,
										}),
									)
								}
							},
						},
						no: {
							icon: '<i class="fas fa-times"></i>',
							label: LocalizeGURPS.translations.gurps.system.library_import.cancel,
						},
					},
					default: "import",
				},
				{
					width: 400,
				},
			).render(true)
		}, 200)
	}

	static async importCompendium(file: { text: string; name: string; path: string }): Promise<void> {
		const data = JSON.parse(file.text) as ImportedItemLibrarySource
		const label = file.name.split(".")[0]
		const name = label.slugify()

		if (!GCS_FILE_VERSIONS.includes(data.version)) {
			if (data.version < Math.min(...GCS_FILE_VERSIONS))
				return this.throwError(LocalizeGURPS.translations.gurps.error.import.format_old)
			else return this.throwError(LocalizeGURPS.translations.gurps.error.import.format_new)
		}

		const items = ItemImporter.importItems(data.rows)

		let pack = game.packs.find(p => p.metadata.name === name)
		if (!pack) {
			pack = await CompendiumCollection.createCompendium({
				type: "Item",
				id: `world.${name}`,
				label,
				name,
				package: "world",
				packageName: SYSTEM_NAME,
				packageType: "world",
				path: `packs/${name}`,
				system: SYSTEM_NAME,
			})
		}

		const counter = items.length
		ui.notifications.info(
			LocalizeGURPS.format(LocalizeGURPS.translations.gurps.system.library_import.start, { pnumber: counter }),
		)
		await ItemGURPS2.createDocuments(items, { pack: pack.collection, keepId: true })
		ui.notifications.info(
			LocalizeGURPS.format(LocalizeGURPS.translations.gurps.system.library_import.finished, { number: counter }),
		)
	}
}

export { ItemCompendiumImporter }
