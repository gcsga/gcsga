import { ContentTabName, TabName } from "../data.ts"
import { CompendiumBrowserTab } from "./base.ts"
import { CompendiumBrowserIndexData, EquipmentFilters } from "./data.ts"
import { LocalizeGURPS } from "@util"
import { CompendiumBrowser } from "../index.ts"
import { ItemType, SYSTEM_NAME } from "@data"

export class CompendiumBrowserEquipmentTab extends CompendiumBrowserTab {
	tabName: ContentTabName = TabName.Equipment
	filterData: EquipmentFilters
	templatePath = `systems/${SYSTEM_NAME}/templates/compendium-browser/partials/equipment.hbs`

	constructor(browser: CompendiumBrowser) {
		super(browser)

		// Set the filterData object of this tab
		this.filterData = this.prepareFilterData()
	}

	protected override async loadData(): Promise<void> {
		console.debug("GURPS | Compendium Browser | Started loading equipment")

		const equipment: CompendiumBrowserIndexData[] = []
		const indexFields = ["img", "formattedName", "resolvedNotes", "adjustedPoints", "system.reference"]
		const tags = new Set<string>()

		for await (const { pack, index } of this.browser.packLoader.loadPacks(
			"Item",
			this.browser.loadedPacks(TabName.Equipment),
			indexFields,
		)) {
			console.debug(`GURPS | Compendium Browser | ${pack.metadata.label} - Loading`)
			for (const equipmentData of index) {
				if (equipmentData.type === ItemType.Equipment || equipmentData.type === ItemType.EquipmentContainer) {
					if (!this.hasAllIndexFields(equipmentData, indexFields)) {
						console.warn(
							`${LocalizeGURPS.translations.TYPES.Item[equipmentData.type]} '${
								equipmentData.name
							}' does not have all required data fields. Consider unselecting pack '${
								pack.metadata.label
							}' in the compendium browser settings.`,
						)
						continue
					}

					const { system } = equipmentData
					for (const tag of system.tags) tags.add(tag)

					equipment.push({
						type: equipmentData.type,
						name: equipmentData.name,
						img: equipmentData.img,
						uuid: `Compendium.${pack.collection}.${equipmentData._id}`,
						formattedName: equipmentData.formattedName,
						resolvedNotes: equipmentData.resolvedNotes,
						value: equipmentData.adjustedValue,
						weight: equipmentData.adjustedWeight,
						extendedValue: equipmentData.extendedValue,
						extendedWeight: equipmentData.extendedWeightFast,
						reference: equipmentData.reference,
					})
				}
			}
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
