import { SYSTEM_NAME } from "./data"

/**
 *
 */
export async function preloadTemplates(): Promise<Handlebars.TemplateDelegate[]> {
	const templatePaths: string[] = [
		// Add paths to "systems/gurps/templates"

		"actor/character/sections/basic-damage",
		"actor/character/sections/conditional-modifier",
		"actor/character/sections/description",
		"actor/character/sections/dropdown-closed",
		"actor/character/sections/dropdown-open",
		"actor/character/sections/effect",
		"actor/character/sections/encumbrance",
		"actor/character/sections/equipment",
		"actor/character/sections/hit-location",
		"actor/character/sections/identity",
		// "actor/character/sections/item-notes",
		"actor/character/sections/lifting",
		"actor/character/sections/macros",
		"actor/character/sections/melee-attack",
		"actor/character/sections/miscellaneous",
		"actor/character/sections/move",
		"actor/character/sections/note",
		"actor/character/sections/other-equipment",
		"actor/character/sections/points",
		"actor/character/sections/pool-attributes",
		"actor/character/sections/portrait",
		"actor/character/sections/primary-attributes",
		"actor/character/sections/ranged-attack",
		"actor/character/sections/reaction",
		"actor/character/sections/resource-trackers",
		"actor/character/sections/secondary-attributes",
		"actor/character/sections/skill",
		"actor/character/sections/spell",
		"actor/character/sections/trait",

		"actor/mook/sections/basic-damage",
		"actor/mook/sections/conditional-modifier",
		"actor/mook/sections/description",
		"actor/mook/sections/dropdown-closed",
		"actor/mook/sections/dropdown-open",
		"actor/mook/sections/effect",
		"actor/mook/sections/encumbrance",
		"actor/mook/sections/equipment",
		"actor/mook/sections/hit-location",
		"actor/mook/sections/identity",
		"actor/mook/sections/lifting",
		"actor/mook/sections/macros",
		"actor/mook/sections/melee-attack",
		"actor/mook/sections/miscellaneous",
		"actor/mook/sections/move",
		"actor/mook/sections/note",
		"actor/mook/sections/other-equipment",
		"actor/mook/sections/points",
		"actor/mook/sections/pool-attributes",
		"actor/mook/sections/portrait",
		"actor/mook/sections/primary-attributes",
		"actor/mook/sections/ranged-attack",
		"actor/mook/sections/reaction",
		"actor/mook/sections/resource-trackers",
		"actor/mook/sections/secondary-attributes",
		"actor/mook/sections/skill",
		"actor/mook/sections/spell",
		"actor/mook/sections/trait",

		"actor/character/config/sheet-settings",
		"actor/character/config/attributes",
		"actor/character/config/threshold",
		"actor/character/config/body-type",
		"actor/character/config/location",
		"actor/character/config/resource-trackers",
		"actor/character/config/move-types",
		"actor/character/config/override",

		"actor/static/sections/attributes",
		"actor/static/sections/basic-damage",
		"actor/static/sections/ci-editor",
		// "actor/static/sections/conditional-injury",
		// "actor/static/sections/conditionalmods",
		"actor/static/sections/conditions",
		"actor/static/sections/description",
		"actor/static/sections/encumbrance",
		"actor/static/sections/equipment",
		"actor/static/sections/footer",
		"actor/static/sections/hit-location",
		"actor/static/sections/identity",
		"actor/static/sections/lifting",
		"actor/static/sections/macros",
		"actor/static/sections/melee-attack",
		"actor/static/sections/miscellaneous",
		"actor/static/sections/move",
		"actor/static/sections/note",
		"actor/static/sections/other-equipment",
		"actor/static/sections/points",
		"actor/static/sections/pool-attributes",
		"actor/static/sections/portrait",
		"actor/static/sections/primary-attributes",
		"actor/static/sections/quicknote",
		"actor/static/sections/ranged-attack",
		"actor/static/sections/reaction",
		"actor/static/sections/resource-trackers",
		"actor/static/sections/secondary-attributes",
		"actor/static/sections/skill",
		"actor/static/sections/speed-range-table",
		"actor/static/sections/spell",
		"actor/static/sections/trackers",
		"actor/static/sections/trait",

		"actor/static/config/sheet-settings",
		"actor/static/config/resource-trackers",
		"actor/static/config/threshold",

		"actor/character/sections/error",
		"actor/drag-image",

		"actor/import",

		"item/sections/prerequisites",
		"item/sections/prereq",
		"item/sections/prereq/trait-prereq",
		"item/sections/prereq/attribute-prereq",
		"item/sections/prereq/contained-quantity-prereq",
		"item/sections/prereq/contained-weight-prereq",
		"item/sections/prereq/equipped-equipment-prereq",
		"item/sections/prereq/skill-prereq",
		"item/sections/prereq/spell-prereq",

		"item/sections/features",
		"item/sections/feature/attribute-bonus",
		"item/sections/feature/cond-mod",
		"item/sections/feature/dr-bonus",
		"item/sections/feature/reaction-bonus",
		"item/sections/feature/skill-bonus",
		"item/sections/feature/skill-point-bonus",
		"item/sections/feature/spell-bonus",
		"item/sections/feature/spell-point-bonus",
		"item/sections/feature/weapon-bonus",
		"item/sections/feature/weapon-dr-divisor-bonus",
		"item/sections/feature/cost-reduction",
		"item/sections/feature/contained-weight-reduction",

		"item/sections/modifiers",

		"item/sections/study",

		"item/sections/trait-mod",
		"item/sections/eqp-mod",
		"item/sections/melee",
		"item/sections/ranged",
		"item/sections/defaults",

		"item/legacy_equipment/melee",
		"item/legacy_equipment/ranged",
		"item/legacy_equipment/traits",
		"item/legacy_equipment/skills",
		"item/legacy_equipment/spells",
		"item/legacy_equipment/bonuses",

		"chat/import-character-error",

		"compendium-browser/searchbar",
		"compendium-browser/settings",

		"modifier-bucket/active",
		"modifier-bucket/collapsible",
		"modifier-bucket/modifier",
		"modifier-bucket/player",

		"system/settings/attribute-effects",
		"system/settings/attribute-condition",

		"mook-generator/attribute",
	]
	const formattedPaths: string[] = []
	for (let filename of templatePaths) {
		const name = filename
		filename = `systems/${SYSTEM_NAME}/templates/${filename}.hbs`
		// Const match = filename.match(`.*/(.*).hbs`);
		// const name = match ? match[1] : "";
		fetch(filename)
			.then(it => it.text())
			.then(async text => {
				if (name) Handlebars.registerPartial(name, text)
				formattedPaths.push(name)
			})
	}
	return loadTemplates(formattedPaths)
}
