import { LocalizeGURPS } from "@util"
import { ItemSourceGURPS } from "./base/data/index.ts"
import { SYSTEM_NAME } from "@module/data/index.ts"
import { DialogGURPS } from "@ui"
import { ImportUtils, ImportedSystemSource } from "@util/import.ts"
import { ItemProxyGURPS } from "./base/document.ts"

interface ItemLibraryData {
	type: ItemLibraryType
	version: number
	rows: ImportedSystemSource[]
}

enum ItemLibraryType {
	TraitLibrary = "trait_list",
	TraitModifierLibrary = "modifier_list",
	SkillLibrary = "skill_list",
	SpellLibrary = "spell_list",
	EquipmentLibrary = "equipment_list",
	EquipmentModifierLibrary = "eqp_modifier_list",
	NoteLibrary = "note_list",
}

export class ItemImporter {
	version: number

	constructor() {
		this.version = 4
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
							callback: (html: HTMLElement | JQuery<HTMLElement>): void => {
								const form = $(html).find("form")[0]
								const files = form.data.files
								if (!files.length)
									ui.notifications?.error(LocalizeGURPS.translations.gurps.error.import.no_file)
								else {
									const file = files[0]
									fu.readTextFromFile(file).then(text =>
										ItemImporter.import({
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

	static import(file: { text: string; name: string; path: string }): void {
		const importer = new ItemImporter()
		importer._import(file)
	}

	private async _import(file: { text: string; name: string; path: string }): Promise<void> {
		const json = file.text
		const label = file.name.split(".")[0]
		const name = label.slugify()
		let r: ItemLibraryData
		const errorMessages: string[] = []
		try {
			r = JSON.parse(json)
		} catch (err) {
			console.error(err)
			errorMessages.push(LocalizeGURPS.translations.gurps.error.import.no_json_detected)
			return this.throwImportError(errorMessages)
		}

		try {
			if (r.version < this.version)
				return this.throwImportError(
					errorMessages.concat(LocalizeGURPS.translations.gurps.error.import.format_old),
				)
			if (r.version > this.version)
				return this.throwImportError(
					errorMessages.concat(LocalizeGURPS.translations.gurps.error.import.format_new),
				)

			const items: ItemSourceGURPS["system"][] = []
			items.push(...ImportUtils.importItems(r.rows))

			let pack = game.packs.find(p => p.metadata.name === name.toLowerCase().replaceAll(" ", "-"))
			if (!pack) {
				pack = await CompendiumCollection.createCompendium({
					type: "Item",
					label: label,
					id: name,
					name: name,
					packageName: name,
					packageType: "world",
					package: "world",
					path: "",
					private: "true",
					system: SYSTEM_NAME,
				})
			}
			ui.notifications?.info(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.system.library_import.start, { name: name }),
			)
			const counter = items.length
			// @ts-expect-error TODO: fix later
			await ItemProxyGURPS.createDocuments(items, {
				pack: pack.collection,
				keepId: true,
			})
			ui.notifications?.info(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.system.library_import.finished, {
					number: counter,
				}),
			)
			const cb = game.gurps.compendiumBrowser
			if (cb.rendered) cb.render(true)
		} catch (err) {
			console.error(err)
			errorMessages.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.error.import.generic, {
					name: name,
					message: (err as Error).message,
				}),
			)
			return this.throwImportError(errorMessages)
		}
	}

	async throwImportError(msg: string[]): Promise<void> {
		ui.notifications?.error(msg.join("<br>"))

		await ChatMessage.create({
			content: await renderTemplate(`systems/${SYSTEM_NAME}/templates/chat/character-import-error.hbs`, {
				lines: msg,
			}),
			user: game.user!.id,
			type: CONST.CHAT_MESSAGE_TYPES.WHISPER,
			whisper: [game.user!.id],
		})
	}
}
