import { ItemType, SYSTEM_NAME } from "@data"
import { ContentTabName, TabName } from "../data.ts"
import { CompendiumBrowser } from "../index.ts"
import { CompendiumBrowserTab } from "./base.ts"
import { CompendiumBrowserIndexData, TraitFilters } from "./data.ts"

export class CompendiumBrowserTraitTab extends CompendiumBrowserTab {
	tabName: ContentTabName = TabName.Trait
	filterData: TraitFilters
	templatePath = `systems/${SYSTEM_NAME}/templates/compendium-browser/partials/trait.hbs`

	constructor(browser: CompendiumBrowser) {
		super(browser)

		// Set the filterData object of this tab
		this.filterData = this.prepareFilterData()
	}

	protected override async loadData(): Promise<void> {
		console.debug("GURPS | Compendium Browser | Started loading traits")

		const traits: CompendiumBrowserIndexData[] = []
		const indexFields = ["img", "formattedName", "resolvedNotes", "adjustedPoints", "system.reference"]
		const tags = new Set<string>()

		for await (const { pack, index } of this.browser.packLoader.loadPacks(
			"Item",
			this.browser.loadedPacks(TabName.Trait),
			indexFields,
		)) {
			console.debug(`GURPS | Compendium Browser | ${pack.metadata.label} - Loading`)
			for (const traitData of index) {
				if (traitData.type === ItemType.Trait || traitData.type === ItemType.TraitContainer) {
					if (!this.hasAllIndexFields(traitData, indexFields)) {
						console.warn(
							`Trait '${traitData.name}' does not have all required data fields. Consider unselecting pack '${pack.metadata.label}' in the compendium browser settings.`,
						)
						continue
					}

					const { system } = traitData
					for (const tag of system.tags) tags.add(tag)

					traits.push({
						type: traitData.type,
						name: traitData.name,
						img: traitData.img,
						uuid: `Compendium.${pack.collection}.${traitData._id}`,
						formattedName: traitData.formattedName,
						resolvedNotes: traitData.resolvedNotes,
						points: traitData.adjustedPoints,
						reference: traitData.reference,
					})
				}
			}
		}

		// Set indexData
		this.indexData = traits

		// Set Filters
		this.filterData.multiselects.tags.options = this.generateMultiselectOptions(
			tags.reduce((acc: Record<string, string>, c) => {
				acc[c] = c
				return acc
			}, {}),
		)

		console.debug("GURPS | Compendium Browser | Finished loading traits")
	}

	protected override filterIndexData(entry: CompendiumBrowserIndexData): boolean {
		const { multiselects } = this.filterData

		// Tags
		if (!this.filterTraits(entry.traits, multiselects.tags.selected)) return false
		return true
	}

	protected override prepareFilterData(): TraitFilters {
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
