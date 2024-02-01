import { ItemType } from "@item/types.ts"
import { SYSTEM_NAME } from "@module/data/index.ts"
import { ContentTabName, TabName } from "../data.ts"
import { CompendiumBrowser } from "../index.ts"
import { CompendiumBrowserTab } from "./base.ts"
import { CompendiumBrowserIndexData, NoteFilters } from "./data.ts"

export class CompendiumBrowserNoteTab extends CompendiumBrowserTab {
	tabName: ContentTabName = TabName.Note
	filterData: NoteFilters
	templatePath = `systems/${SYSTEM_NAME}/templates/compendium-browser/partials/note.hbs`

	constructor(browser: CompendiumBrowser) {
		super(browser)

		// Set the filterData object of this tab
		this.filterData = this.prepareFilterData()
	}

	protected override async loadData(): Promise<void> {
		console.debug("GURPS | Compendium Browser | Started loading notes")

		const notes: CompendiumBrowserIndexData[] = []
		const indexFields = ["img", "formattedName", "resolvedNotes", "system.reference"]
		const tags = new Set<string>()

		for await (const { pack, index } of this.browser.packLoader.loadPacks(
			"Item",
			this.browser.loadedPacks(TabName.Note),
			indexFields,
		)) {
			console.debug(`GURPS | Compendium Browser | ${pack.metadata.label} - Loading`)
			for (const noteData of index) {
				if (noteData.type === ItemType.Note || noteData.type === ItemType.NoteContainer) {
					if (!this.hasAllIndexFields(noteData, indexFields)) {
						console.warn(
							`Note '${noteData.name}' does not have all required data fields. Consider unselecting pack '${pack.metadata.label}' in the compendium browser settings.`,
						)
						continue
					}

					const { system } = noteData
					for (const tag of system.tags) tags.add(tag)

					notes.push({
						type: noteData.type,
						name: noteData.name,
						img: noteData.img,
						uuid: `Compendium.${pack.collection}.${noteData._id}`,
						formattedName: noteData.formattedName,
						resolvedNotes: noteData.resolvedNotes,
						points: noteData.adjustedPoints,
						reference: noteData.reference,
					})
				}
			}
		}

		// Set indexData
		this.indexData = notes

		// Set Filters
		this.filterData.multiselects.tags.options = this.generateMultiselectOptions(
			tags.reduce((acc: Record<string, string>, c) => {
				acc[c] = c
				return acc
			}, {}),
		)

		console.debug("GURPS | Compendium Browser | Finished loading notes")
	}

	protected override filterIndexData(entry: CompendiumBrowserIndexData): boolean {
		const { multiselects } = this.filterData

		// Tags
		if (!this.filterTraits(entry.notes, multiselects.tags.selected)) return false
		return true
	}

	protected override prepareFilterData(): NoteFilters {
		return {
			multiselects: {
				tags: {
					label: "tags",
					options: [],
					selected: [],
				},
			},
			order: {
				by: "name",
				direction: "asc",
				options: {
					name: "name",
					points: "points",
					reference: "reference",
				},
			},
			search: {
				text: "",
			},
		}
	}
}
