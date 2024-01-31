// import { ItemType, SYSTEM_NAME } from "@module/data"
// import { CompendiumBrowser } from "../browser"
// import { CompendiumIndexData, TabName } from "../data"
// import { CompendiumBrowserTab } from "./base"
//
// export class CompendiumBrowserSkillTab extends CompendiumBrowserTab {
// 	override templatePath = `systems/${SYSTEM_NAME}/templates/compendium-browser/skill.hbs`
//
// 	override get searchFields(): string[] {
// 		return [...super.searchFields, "system.difficulty"]
// 	}
//
// 	constructor(browser: CompendiumBrowser) {
// 		super(browser, TabName.Skill)
// 	}
//
// 	protected override async loadData(): Promise<void> {
// 		const skill_list: CompendiumIndexData[] = []
// 		const indexFields = ["name", "system", "flags"]
//
// 		for await (const { pack, index } of this.browser.packLoader.loadPacks(
// 			"Item",
// 			this.browser.loadedPacks(TabName.Skill),
// 			indexFields,
// 		)) {
// 			const collection = game.packs.get(pack.collection)
// 			;((await collection?.getDocuments()) as any).forEach((skill: any) => {
// 				if (![ItemType.Skill, ItemType.Technique, ItemType.SkillContainer].includes(skill.type)) return
// 				let difficulty = ""
// 				if (skill.type === ItemType.Skill)
// 					difficulty = `${skill.attribute.toUpperCase()}/${skill.difficulty.toUpperCase()}`
// 				if (skill.type === ItemType.Technique) difficulty = `Tech/${skill.difficulty.toUpperCase()}`
// 				skill.prepareData()
// 				skill_list.push({
// 					_id: skill._id,
// 					type: skill.type,
// 					name: skill.name,
// 					formattedName: skill.formattedName,
// 					notes: skill.notes,
// 					img: skill.img,
// 					compendium: pack,
// 					open: skill.open,
// 					uuid: skill.uuid,
// 					id: skill._id,
// 					children: skill.type === ItemType.SkillContainer ? skill.children : [],
// 					tags: skill.tags,
// 					reference: skill.reference,
// 					reference_highlight: skill.reference_highlight,
// 					parents: skill.parents,
// 					indent: skill.indent,
// 					difficulty: difficulty,
// 					flags: skill.flags,
// 				})
// 			})
// 		}
// 		skill_list.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0))
//
// 		this.indexData = skill_list
// 	}
// }
//
import { CompendiumBrowser } from "../index.ts"
import { ContentTabName, TabName } from "../data.ts"
import { CompendiumBrowserTab } from "./base.ts"
import { CompendiumBrowserIndexData, SkillFilters } from "./data.ts"
import { SYSTEM_NAME } from "@module/data/index.ts"
import { ItemType } from "@item/types.ts"

export class CompendiumBrowserTraitTab extends CompendiumBrowserTab {
	tabName: ContentTabName = TabName.Skill
	filterData: SkillFilters
	templatePath = `systems/${SYSTEM_NAME}/templates/compendium-browser/partials/skill.hbs`

	constructor(browser: CompendiumBrowser) {
		super(browser)

		// Set the filterData object of this tab
		this.filterData = this.prepareFilterData()
	}

	protected override async loadData(): Promise<void> {
		console.debug("GURPS | Compendium Browser | Started loading skills")

		const skills: CompendiumBrowserIndexData[] = []
		const indexFields = ["img", "formattedName", "resolvedNotes", "adjustedPoits", "system.reference"]
		const tags = new Set<string>()

		for await (const { pack, index } of this.browser.packLoader.loadPacks(
			"Item",
			this.browser.loadedPacks(TabName.Skill),
			indexFields,
		)) {
			console.debug(`GURPS | Compendium Browser | ${pack.metadata.label} - Loading`)
			for (const skillData of index) {
				if (skillData.type === ItemType.Skill || skillData.type === ItemType.Technique) {
					if (!this.hasAllIndexFields(skillData, indexFields)) {
						console.warn(
							`Trait '${skillData.name}' does not have all required data fields. Consider unselecting pack '${pack.metadata.label}' in the compendium browser settings.`,
						)
						continue
					}

					const { system } = skillData
					for (const tag of system.tags) tags.add(tag)

					skills.push({
						type: skillData.type,
						name: skillData.name,
						img: skillData.img,
						uuid: `Compendium.${pack.collection}.${skillData._id}`,
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
