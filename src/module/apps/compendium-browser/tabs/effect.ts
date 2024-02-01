import { CompendiumBrowser } from "../index.ts"
import { ContentTabName, TabName } from "../data.ts"
import { CompendiumBrowserTab } from "./base.ts"
import { CompendiumBrowserIndexData, EffectFilters } from "./data.ts"
import { SYSTEM_NAME } from "@module/data/index.ts"
import { ItemType } from "@item/types.ts"

export class CompendiumBrowserEffectTab extends CompendiumBrowserTab {
	tabName: ContentTabName = TabName.Effect
	filterData: EffectFilters
	templatePath = `systems/${SYSTEM_NAME}/templates/compendium-browser/partials/effect.hbs`

	constructor(browser: CompendiumBrowser) {
		super(browser)

		// Set the filterData object of this tab
		this.filterData = this.prepareFilterData()
	}

	protected override async loadData(): Promise<void> {
		console.debug("GURPS | Compendium Browser | Started loading effects")

		const effects: CompendiumBrowserIndexData[] = []
		const indexFields = ["img", "formattedName", "resolvedNotes", "adjustedPoints", "system.reference"]
		const tags = new Set<string>()

		for await (const { pack, index } of this.browser.packLoader.loadPacks(
			"Item",
			this.browser.loadedPacks(TabName.Effect),
			indexFields,
		)) {
			console.debug(`GURPS | Compendium Browser | ${pack.metadata.label} - Loading`)
			for (const effectData of index) {
				if (effectData.type === ItemType.Effect || effectData.type === ItemType.Condition) {
					if (!this.hasAllIndexFields(effectData, indexFields)) {
						console.warn(
							`Effect '${effectData.name}' does not have all required data fields. Consider unselecting pack '${pack.metadata.label}' in the compendium browser settings.`,
						)
						continue
					}

					const { system } = effectData
					for (const tag of system.tags) tags.add(tag)

					effects.push({
						type: effectData.type,
						name: effectData.name,
						img: effectData.img,
						uuid: `Compendium.${pack.collection}.${effectData._id}`,
						formattedName: effectData.formattedName,
						resolvedNotes: effectData.resolvedNotes,
						points: effectData.adjustedPoints,
						reference: effectData.reference,
					})
				}
			}
		}

		// Set indexData
		this.indexData = effects

		// Set Filters
		this.filterData.multiselects.tags.options = this.generateMultiselectOptions(
			tags.reduce((acc: Record<string, string>, c) => {
				acc[c] = c
				return acc
			}, {}),
		)

		console.debug("GURPS | Compendium Browser | Finished loading effects")
	}

	protected override filterIndexData(entry: CompendiumBrowserIndexData): boolean {
		const { multiselects } = this.filterData

		// Tags
		if (!this.filterTraits(entry.effects, multiselects.tags.selected)) return false
		return true
	}

	protected override prepareFilterData(): EffectFilters {
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
