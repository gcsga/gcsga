import { ContentTabName, TabName } from "../data.ts"
import { CompendiumBrowserTab } from "./base.ts"
import { CompendiumBrowserIndexData, EquipmentFilters } from "./data.ts"
import { LocalizeGURPS, Weight } from "@util"
import { CompendiumBrowser } from "../index.ts"
import { ItemType, SYSTEM_NAME } from "@data"
import { EquipmentContainerGURPS, EquipmentGURPS } from "@item"

export class CompendiumBrowserEquipmentTab extends CompendiumBrowserTab {
	tabName: ContentTabName = TabName.Equipment
	filterData: EquipmentFilters
	templatePath = `systems/${SYSTEM_NAME}/templates/common/equipment.hbs`

	constructor(browser: CompendiumBrowser) {
		super(browser)

		// Set the filterData object of this tab
		this.filterData = this.prepareFilterData()
	}

	protected override async loadData(): Promise<void> {
		console.debug("GURPS | Compendium Browser | Started loading equipment")

		const equipment: CompendiumBrowserIndexData[] = []
		const indexFields = [
			"formattedName",
			"resolvedNotes",
			"adjustedValue",
			"adjustedWeight",
			"extendedValue",
			"extendedWeightFast",
			"system.tech_level",
			"system.legality_class",
			"reference",
		]
		const tags = new Set<string>()

		for await (const { pack } of this.browser.packLoader.loadPacks(
			"Item",
			this.browser.loadedPacks(TabName.Equipment),
			indexFields,
		)) {
			console.debug(`GURPS | Compendium Browser | ${pack.metadata.label} - Loading`)
			const collection = game.packs.get(pack.collection) as CompendiumCollection<
				EquipmentGURPS<null> | EquipmentContainerGURPS<null>
			>
			if (!collection) return
			;(await collection.getDocuments()).forEach((item: EquipmentGURPS<null> | EquipmentContainerGURPS<null>) => {
				item.prepareData()

				if (item.type === ItemType.Equipment || item.type === ItemType.EquipmentContainer) {
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

				equipment.push({
					type: item.type,
					name: item.name,
					img: item.img,
					id: `Compendium.${pack.collection}.${item._id}`,
					formattedName: item.formattedName,
					resolvedNotes: item.resolvedNotes,
					value: item.adjustedValue,
					weight: item.adjustedWeight,
					extendedValue: item.extendedValue,
					extendedWeight: Weight.format(item.extendedWeight(false, item.weightUnits), item.weightUnits),
					reference: item.reference,
				})
			})
		}

		// Set indexData
		this.indexData = equipment

		// Set Filters
		this.filterData.multiselects.tags.options = this.generateMultiselectOptions(
			tags.reduce((acc: Record<string, string>, c) => {
				acc[c] = c
				return acc
			}, {}),
		)

		console.debug("GURPS | Compendium Browser | Finished loading equipment")
	}

	protected override filterIndexData(entry: CompendiumBrowserIndexData): boolean {
		const { multiselects } = this.filterData

		// Tags
		if (!this.filterTraits(entry.traits, multiselects.tags.selected)) return false
		return true
	}

	protected override prepareFilterData(): EquipmentFilters {
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
