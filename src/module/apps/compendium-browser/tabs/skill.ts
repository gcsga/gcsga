import { ContentTabName, TabName } from "../data.ts"
import { CompendiumBrowserTab } from "./base.ts"
import { CompendiumBrowserIndexData, SkillFilters } from "./data.ts"
import { LocalizeGURPS } from "@util"
import { CompendiumBrowser } from "../index.ts"
import { ItemType, SYSTEM_NAME } from "@data"

export class CompendiumBrowserSkillTab extends CompendiumBrowserTab {
	tabName: ContentTabName = TabName.Skill
	filterData: SkillFilters
	templatePath = `systems/${SYSTEM_NAME}/templates/common/skill.hbs`

	constructor(browser: CompendiumBrowser) {
		super(browser)

		// Set the filterData object of this tab
		this.filterData = this.prepareFilterData()
	}

	protected override async loadData(): Promise<void> {
		console.debug("GURPS | Compendium Browser | Started loading skills")

		const skills: CompendiumBrowserIndexData[] = []
		const indexFields = ["img", "formattedName", "resolvedNotes", "adjustedPoints", "system.reference"]
		const tags = new Set<string>()

		for await (const { pack, index } of this.browser.packLoader.loadPacks(
			"Item",
			this.browser.loadedPacks(TabName.Skill),
			indexFields,
		)) {
			console.debug(`GURPS | Compendium Browser | ${pack.metadata.label} - Loading`)
			for (const skillData of index) {
				if (
					skillData.type === ItemType.Skill ||
					skillData.type === ItemType.Technique ||
					skillData.type === ItemType.SkillContainer
				) {
					if (!this.hasAllIndexFields(skillData, indexFields)) {
						console.warn(
							`${LocalizeGURPS.translations.TYPES.Item[skillData.type]} '${
								skillData.name
							}' does not have all required data fields. Consider unselecting pack '${
								pack.metadata.label
							}' in the compendium browser settings.`,
						)
						continue
					}

					const { system } = skillData
					for (const tag of system.tags) tags.add(tag)

					skills.push({
						type: skillData.type,
						name: skillData.name,
						img: skillData.img,
						id: `Compendium.${pack.collection}.${skillData._id}`,
						formattedName: skillData.formattedName,
						resolvedNotes: skillData.resolvedNotes,
						level: skillData.level,
						points: skillData.adjustedPoints,
						reference: skillData.reference,
					})
				}
			}
		}

		// Set indexData
		this.indexData = skills

		// Set Filters
		this.filterData.multiselects.tags.options = this.generateMultiselectOptions(
			tags.reduce((acc: Record<string, string>, c) => {
				acc[c] = c
				return acc
			}, {}),
		)

		console.debug("GURPS | Compendium Browser | Finished loading skills")
	}

	protected override filterIndexData(entry: CompendiumBrowserIndexData): boolean {
		const { multiselects } = this.filterData

		// Tags
		if (!this.filterTraits(entry.traits, multiselects.tags.selected)) return false
		return true
	}

	protected override prepareFilterData(): SkillFilters {
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
