import { SYSTEM_NAME } from "@data"

export async function preloadHandlebarsTemplates(): Promise<void> {
	const partials = [
		// Shared Partials
		`systems/${SYSTEM_NAME}/templates/shared/list-roll-modifiers.hbs`,

		// Item Detsils Partials
		`systems/${SYSTEM_NAME}/templates/items/parts/details-container.hbs`,
		`systems/${SYSTEM_NAME}/templates/items/parts/details-defaults.hbs`,
		`systems/${SYSTEM_NAME}/templates/items/parts/details-equipment-modifier.hbs`,
		`systems/${SYSTEM_NAME}/templates/items/parts/details-equipment.hbs`,
		`systems/${SYSTEM_NAME}/templates/items/parts/details-features.hbs`,
		`systems/${SYSTEM_NAME}/templates/items/parts/details-note.hbs`,
		`systems/${SYSTEM_NAME}/templates/items/parts/details-prereqs.hbs`,
		`systems/${SYSTEM_NAME}/templates/items/parts/details-ritual-magic-spell.hbs`,
		`systems/${SYSTEM_NAME}/templates/items/parts/details-skill.hbs`,
		`systems/${SYSTEM_NAME}/templates/items/parts/details-spell.hbs`,
		`systems/${SYSTEM_NAME}/templates/items/parts/details-study.hbs`,
		`systems/${SYSTEM_NAME}/templates/items/parts/details-technique.hbs`,
		`systems/${SYSTEM_NAME}/templates/items/parts/details-trait-container.hbs`,
		`systems/${SYSTEM_NAME}/templates/items/parts/details-trait-modifier.hbs`,
		`systems/${SYSTEM_NAME}/templates/items/parts/details-trait.hbs`,
		`systems/${SYSTEM_NAME}/templates/items/parts/details-weapon-melee.hbs`,
		`systems/${SYSTEM_NAME}/templates/items/parts/details-weapon-ranged.hbs`,
		`systems/${SYSTEM_NAME}/templates/items/parts/fields-weapon-damage.hbs`,

		// Item Embeds Partials
		`systems/${SYSTEM_NAME}/templates/items/parts/embeds-equipment-modifier.hbs`,
		`systems/${SYSTEM_NAME}/templates/items/parts/embeds-equipment.hbs`,
		`systems/${SYSTEM_NAME}/templates/items/parts/embeds-trait-modifier.hbs`,
		`systems/${SYSTEM_NAME}/templates/items/parts/embeds-trait.hbs`,
		`systems/${SYSTEM_NAME}/templates/items/parts/embeds-spell.hbs`,
		`systems/${SYSTEM_NAME}/templates/items/parts/embeds-skill.hbs`,
		`systems/${SYSTEM_NAME}/templates/items/parts/embeds-note.hbs`,
		`systems/${SYSTEM_NAME}/templates/items/parts/embeds-weapon-melee.hbs`,
		`systems/${SYSTEM_NAME}/templates/items/parts/embeds-weapon-ranged.hbs`,
		`systems/${SYSTEM_NAME}/templates/items/parts/embeds-weapon-ranged.hbs`,
		`systems/${SYSTEM_NAME}/templates/items/parts/embeds-entry.hbs`,
	]

	const paths = <Record<string, string>>{}
	for (const path of partials) {
		paths[path.replace(".hbs", ".html")] = path
		paths[`gurps.${path.split("/").pop()!.replace(".hbs", "")}`] = path
	}

	return loadTemplates(paths)
}

// export function registerTemplates(): void {
// 	const templatePaths = [
// 		// Common Item Partials
// 		"common/trait",
// 		"common/trait-modifier",
// 		"common/skill",
// 		"common/spell",
// 		"common/equipment",
// 		"common/other-equipment",
// 		"common/equipment-modifier",
// 		"common/effect",
// 		"common/note",
//
// 		// Character
// 		"actor/character/partials/basic-damage",
// 		"actor/character/partials/conditional-modifier",
// 		"actor/character/partials/description",
// 		"actor/character/partials/embeds",
// 		"actor/character/partials/encumbrance",
// 		"actor/character/partials/hit-location",
// 		"actor/character/partials/identity",
// 		"actor/character/partials/lifting",
// 		"actor/character/partials/macros",
// 		"actor/character/partials/melee-attack",
// 		"actor/character/partials/miscellaneous",
// 		"actor/character/partials/move",
// 		"actor/character/partials/points",
// 		"actor/character/partials/pool-attributes",
// 		"actor/character/partials/portrait",
// 		"actor/character/partials/primary-attributes",
// 		"actor/character/partials/ranged-attack",
// 		"actor/character/partials/reaction",
// 		"actor/character/partials/resource-trackers",
// 		"actor/character/partials/secondary-attributes",
//
// 		// Character Config Sheet
// 		"actor/character/config/sheet-settings",
// 		"actor/character/config/attributes",
// 		"actor/character/config/threshold",
// 		"actor/character/config/body-type",
// 		"actor/character/config/location",
// 		"actor/character/config/resource-trackers",
// 		"actor/character/config/move-types",
// 		"actor/character/config/override",
//
// 		// Mook
// 		// "actor/mook/partials/basic-damage",
// 		// "actor/mook/partials/conditional-modifier",
// 		// "actor/mook/partials/description",
// 		// "actor/mook/partials/dropdown-closed",
// 		// "actor/mook/partials/dropdown-open",
// 		// "actor/mook/partials/effect",
// 		// "actor/mook/partials/encumbrance",
// 		// "actor/mook/partials/equipment",
// 		// "actor/mook/partials/hit-location",
// 		// "actor/mook/partials/identity",
// 		// "actor/mook/partials/lifting",
// 		// "actor/mook/partials/macros",
// 		// "actor/mook/partials/melee-attack",
// 		// "actor/mook/partials/miscellaneous",
// 		// "actor/mook/partials/move",
// 		// "actor/mook/partials/note",
// 		// "actor/mook/partials/other-equipment",
// 		// "actor/mook/partials/points",
// 		// "actor/mook/partials/pool-attributes",
// 		// "actor/mook/partials/portrait",
// 		// "actor/mook/partials/primary-attributes",
// 		// "actor/mook/partials/ranged-attack",
// 		// "actor/mook/partials/reaction",
// 		// "actor/mook/partials/resource-trackers",
// 		// "actor/mook/partials/secondary-attributes",
// 		// "actor/mook/partials/skill",
// 		// "actor/mook/partials/spell",
// 		// "actor/mook/partials/trait",
//
// 		// Mook Generator
// 		"mook-generator/attribute",
//
// 		// Legacy Character
// 		// "actor/static/partials/attributes",
// 		// "actor/static/partials/basic-damage",
// 		// "actor/static/partials/ci-editor",
// 		// "actor/static/partials/conditions",
// 		// "actor/static/partials/description",
// 		// "actor/static/partials/encumbrance",
// 		// "actor/static/partials/equipment",
// 		// "actor/static/partials/footer",
// 		// "actor/static/partials/hit-location",
// 		// "actor/static/partials/identity",
// 		// "actor/static/partials/lifting",
// 		// "actor/static/partials/macros",
// 		// "actor/static/partials/melee-attack",
// 		// "actor/static/partials/miscellaneous",
// 		// "actor/static/partials/move",
// 		// "actor/static/partials/note",
// 		// "actor/static/partials/other-equipment",
// 		// "actor/static/partials/points",
// 		// "actor/static/partials/pool-attributes",
// 		// "actor/static/partials/portrait",
// 		// "actor/static/partials/primary-attributes",
// 		// "actor/static/partials/quicknote",
// 		// "actor/static/partials/ranged-attack",
// 		// "actor/static/partials/reaction",
// 		// "actor/static/partials/resource-trackers",
// 		// "actor/static/partials/secondary-attributes",
// 		// "actor/static/partials/skill",
// 		// "actor/static/partials/speed-range-table",
// 		// "actor/static/partials/spell",
// 		// "actor/static/partials/trackers",
// 		// "actor/static/partials/trait",
//
// 		// Legacy Character Config Sheet
// 		// "actor/static/config/sheet-settings",
// 		// "actor/static/config/resource-trackers",
// 		// "actor/static/config/threshold",
//
// 		// Misc Character
// 		"actor/character/partials/error",
// 		"actor/import",
//
// 		// Item Prereqs
// 		"item/partials/prereqs",
// 		"item/partials/prereq/prereq-list",
// 		"item/partials/prereq/trait-prereq",
// 		"item/partials/prereq/attribute-prereq",
// 		"item/partials/prereq/contained-quantity-prereq",
// 		"item/partials/prereq/contained-weight-prereq",
// 		"item/partials/prereq/equipped-equipment-prereq",
// 		"item/partials/prereq/skill-prereq",
// 		"item/partials/prereq/spell-prereq",
//
// 		// Item Features
// 		"item/partials/features",
// 		"item/partials/feature/attribute-bonus",
// 		"item/partials/feature/conditional-modifier",
// 		"item/partials/feature/dr-bonus",
// 		"item/partials/feature/reaction-bonus",
// 		"item/partials/feature/skill-bonus",
// 		"item/partials/feature/skill-point-bonus",
// 		"item/partials/feature/spell-bonus",
// 		"item/partials/feature/spell-point-bonus",
// 		"item/partials/feature/weapon-switch",
// 		"item/partials/feature/weapon-bonus",
// 		"item/partials/feature/cost-reduction",
// 		"item/partials/feature/contained-weight-reduction",
// 		"item/partials/feature/move-bonus",
//
// 		// Item Modifiers
// 		"item/partials/roll-modifiers",
//
// 		// Item Study
// 		"item/partials/study",
//
// 		// Item Embeds
// 		"item/partials/melee-attacks",
// 		"item/partials/ranged-attacks",
// 		"item/partials/defaults",
//
// 		// Legacy Item
// 		"item/legacy_equipment/melee",
// 		"item/legacy_equipment/ranged",
// 		"item/legacy_equipment/traits",
// 		"item/legacy_equipment/skills",
// 		"item/legacy_equipment/spells",
// 		"item/legacy_equipment/bonuses",
//
// 		// Chat
// 		"chat/import-character-error",
//
// 		// Compendium Browser
// 		"compendium-browser/searchbar",
// 		"compendium-browser/settings",
//
// 		// Modifier Bucket
// 		"modifier-bucket/active",
// 		"modifier-bucket/collapsible",
// 		"modifier-bucket/modifier",
// 		"modifier-bucket/player",
// 		"modifier-bucket/stack",
//
// 		// System Settings
// 		"system/settings/attribute-effects",
// 		"system/settings/attribute-condition",
// 	]
// 	const formattedPaths: string[] = []
// 	for (let filename of templatePaths) {
// 		const name = filename
// 		filename = `systems/${SYSTEM_NAME}/templates/${filename}.hbs`
// 		fetch(filename)
// 			.then(it => it.text())
// 			.then(async text => {
// 				if (name) Handlebars.registerPartial(name, text)
// 				formattedPaths.push(name)
// 			})
// 	}
// 	loadTemplates(formattedPaths)
// }
