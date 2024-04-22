import { ItemType, SYSTEM_NAME } from "@data"
import { ContentTabName, TabName } from "../data.ts"
import { CompendiumBrowser } from "../index.ts"
import { CompendiumBrowserTab } from "./base.ts"
import { CompendiumBrowserIndexData, TraitFilters } from "./data.ts"
import { TraitContainerGURPS, TraitGURPS } from "@item"
import { LocalizeGURPS } from "@util"

export class CompendiumBrowserTraitTab extends CompendiumBrowserTab {
	tabName: ContentTabName = TabName.Trait
	filterData: TraitFilters
	templatePath = `systems/${SYSTEM_NAME}/templates/common/trait.hbs`

	/* MiniSearch */
	override searchFields = ["name", "tags", "reference", "points", "resolvedNotes"]
	override storeFields = [
		"type",
		"formattedName",
		"name",
		"img",
		"resolvedNotes",
		"adjustedPoints",
		"tags",
		"reference",
		"points",
		"enabled",
	]

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

		for await (const { pack } of this.browser.packLoader.loadPacks(
			"Item",
			this.browser.loadedPacks(TabName.Trait),
			indexFields,
		)) {
			console.debug(`GURPS | Compendium Browser | ${pack.metadata.label} - Loading`)
			const collection = game.packs.get(pack.collection) as CompendiumCollection<
				TraitGURPS<null> | TraitContainerGURPS<null>
			>
			if (!collection) return
			;(await collection.getDocuments()).forEach((item: TraitGURPS<null> | TraitContainerGURPS<null>) => {
				item.prepareData()

				if (item.type === ItemType.Trait || item.type === ItemType.TraitContainer) {
					if (!this.hasAllIndexFields(item, indexFields)) {
						console.warn(
							`${LocalizeGURPS.translations.TYPES.Item[item.type]} '${
								item.name
							}' does not have all required data fields. Consider unselecting pack '${
								pack.metadata.label
							}' in the compendium browser settings.`,
						)
						return
					}
				} else {
					return
				}
				for (const tag of item.tags) tags.add(tag)

				traits.push({
					type: item.type,
					name: item.name,
					img: item.img,
					id: item.uuid ?? `Compendium.${pack.collection}.${item._id}`,
					formattedName: item.formattedName,
					resolvedNotes: item.resolvedNotes,
					adjustedPoints: item.adjustedPoints,
					tags: item.tags,
					reference: item.reference,
					enabled: item.enabled,
					"system.open": item.isOfType(ItemType.TraitContainer) ? item.system.open : false,
					"system.container_type": item.isOfType(ItemType.TraitContainer) ? item.system.container_type : "",
				})
			})
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
		return true
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
