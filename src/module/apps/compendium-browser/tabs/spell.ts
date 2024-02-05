import { ContentTabName, TabName } from "../data.ts"
import { CompendiumBrowserTab } from "./base.ts"
import { CompendiumBrowserIndexData, SpellFilters } from "./data.ts"
import { LocalizeGURPS } from "@util"
import { CompendiumBrowser } from "../index.ts"
import { ItemType, SYSTEM_NAME } from "@data"

export class CompendiumBrowserSpellTab extends CompendiumBrowserTab {
	tabName: ContentTabName = TabName.Spell
	filterData: SpellFilters
	templatePath = `systems/${SYSTEM_NAME}/templates/compendium-browser/partials/spell.hbs`

	constructor(browser: CompendiumBrowser) {
		super(browser)

		// Set the filterData object of this tab
		this.filterData = this.prepareFilterData()
	}

	protected override async loadData(): Promise<void> {
		console.debug("GURPS | Compendium Browser | Started loading spells")

		const spells: CompendiumBrowserIndexData[] = []
		const indexFields = ["img", "formattedName", "resolvedNotes", "adjustedPoints", "system.reference"]
		const tags = new Set<string>()

		for await (const { pack, index } of this.browser.packLoader.loadPacks(
			"Item",
			this.browser.loadedPacks(TabName.Spell),
			indexFields,
		)) {
			console.debug(`GURPS | Compendium Browser | ${pack.metadata.label} - Loading`)
			for (const spellData of index) {
				if (
					spellData.type === ItemType.Spell ||
					spellData.type === ItemType.RitualMagicSpell ||
					spellData.type === ItemType.SpellContainer
				) {
					if (!this.hasAllIndexFields(spellData, indexFields)) {
						console.warn(
							`${LocalizeGURPS.translations.TYPES.Item[spellData.type]} '${
								spellData.name
							}' does not have all required data fields. Consider unselecting pack '${
								pack.metadata.label
							}' in the compendium browser settings.`,
						)
						continue
					}

					const { system } = spellData
					for (const tag of system.tags) tags.add(tag)

					spells.push({
						type: spellData.type,
						name: spellData.name,
						img: spellData.img,
						uuid: `Compendium.${pack.collection}.${spellData._id}`,
						formattedName: spellData.formattedName,
						resolvedNotes: spellData.resolvedNotes,
						level: spellData.level,
						points: spellData.adjustedPoints,
						reference: spellData.reference,
					})
				}
			}
		}

		// Set indexData
		this.indexData = spells

		// Set Filters
		this.filterData.multiselects.tags.options = this.generateMultiselectOptions(
			tags.reduce((acc: Record<string, string>, c) => {
				acc[c] = c
				return acc
			}, {}),
		)

		console.debug("GURPS | Compendium Browser | Finished loading spells")
	}

	protected override filterIndexData(entry: CompendiumBrowserIndexData): boolean {
		const { multiselects } = this.filterData

		// Tags
		if (!this.filterTraits(entry.traits, multiselects.tags.selected)) return false
		return true
	}

	protected override prepareFilterData(): SpellFilters {
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
