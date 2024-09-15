// import { ContentTabName, TabName } from "../data.ts"
// import { CompendiumBrowserTab } from "./base.ts"
// import { CompendiumBrowserIndexData, TraitModifierFilters } from "./data.ts"
// import { LocalizeGURPS } from "@util"
// import { CompendiumBrowser } from "../index.ts"
// import { ItemType, SYSTEM_NAME } from "@data"
//
// export class CompendiumBrowserTraitModifierTab extends CompendiumBrowserTab {
// 	tabName: ContentTabName = TabName.TraitModifier
// 	filterData: TraitModifierFilters
// 	templatePath = `systems/${SYSTEM_NAME}/templates/common/trait-modifier.hbs`
//
// 	constructor(browser: CompendiumBrowser) {
// 		super(browser)
//
// 		// Set the filterData object of this tab
// 		this.filterData = this.prepareFilterData()
// 	}
//
// 	protected override async loadData(): Promise<void> {
// 		console.debug("GURPS | Compendium Browser | Started loading trait modifiers")
//
// 		const modifiers: CompendiumBrowserIndexData[] = []
// 		const indexFields = ["img", "formattedName", "resolvedNotes", "adjustedPoints", "system.reference"]
// 		const tags = new Set<string>()
//
// 		for await (const { pack, index } of this.browser.packLoader.loadPacks(
// 			"Item",
// 			this.browser.loadedPacks(TabName.TraitModifier),
// 			indexFields,
// 		)) {
// 			console.debug(`GURPS | Compendium Browser | ${pack.metadata.label} - Loading`)
// 			for (const modifierData of index) {
// 				if (
// 					modifierData.type === ItemType.EquipmentModifier ||
// 					modifierData.type === ItemType.EquipmentModifierContainer
// 				) {
// 					if (!this.hasAllIndexFields(modifierData, indexFields)) {
// 						console.warn(
// 							`${LocalizeGURPS.translations.TYPES.Item[modifierData.type]} '${
// 								modifierData.name
// 							}' does not have all required data fields. Consider unselecting pack '${
// 								pack.metadata.label
// 							}' in the compendium browser settings.`,
// 						)
// 						continue
// 					}
//
// 					const { system } = modifierData
// 					for (const tag of system.tags) tags.add(tag)
//
// 					modifiers.push({
// 						type: modifierData.type,
// 						name: modifierData.name,
// 						img: modifierData.img,
// 						id: `Compendium.${pack.collection}.${modifierData._id}`,
// 						formattedName: modifierData.formattedName,
// 						resolvedNotes: modifierData.resolvedNotes,
// 						costDescription: modifierData.costDescription,
// 						reference: modifierData.reference,
// 					})
// 				}
// 			}
// 		}
//
// 		// Set indexData
// 		this.indexData = modifiers
//
// 		// Set Filters
// 		this.filterData.multiselects.tags.options = this.generateMultiselectOptions(
// 			tags.reduce((acc: Record<string, string>, c) => {
// 				acc[c] = c
// 				return acc
// 			}, {}),
// 		)
//
// 		console.debug("GURPS | Compendium Browser | Finished loading trait modifiers")
// 	}
//
// 	protected override filterIndexData(entry: CompendiumBrowserIndexData): boolean {
// 		const { multiselects } = this.filterData
//
// 		// Tags
// 		if (!this.filterTraits(entry.traits, multiselects.tags.selected)) return false
// 		return true
// 	}
//
// 	protected override prepareFilterData(): TraitModifierFilters {
// 		return {
// 			multiselects: {
// 				tags: {
// 					label: "tags",
// 					options: [],
// 					selected: [],
// 				},
// 			},
// 			order: {
// 				by: "name",
// 				direction: "asc",
// 				options: {
// 					name: "name",
// 					points: "points",
// 					reference: "reference",
// 				},
// 			},
// 			search: {
// 				text: "",
// 			},
// 		}
// 	}
// }
