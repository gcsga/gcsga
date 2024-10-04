import { CharacterSheetGURPS } from "@module/applications/actor/character-sheet.ts"
import { ItemSheetGURPS } from "@module/applications/item/item-sheet.ts"
import { ActorType, ItemType, SYSTEM_NAME } from "@module/data/constants.ts"

export function registerSheets(): void {
	/** Actor Sheets */
	Actors.registerSheet(SYSTEM_NAME, CharacterSheetGURPS, {
		types: [ActorType.Character],
		makeDefault: true,
		label: "GURPS Character Sheet V2",
	})

	Items.registerSheet(SYSTEM_NAME, ItemSheetGURPS, {
		types: [
			ItemType.Equipment,
			ItemType.EquipmentContainer,
			ItemType.RitualMagicSpell,
			ItemType.Skill,
			ItemType.Spell,
			ItemType.Technique,
			ItemType.Trait,
			ItemType.TraitContainer,
		],
		makeDefault: true,
		label: "GURPS Item Sheet V2",
	})

	// Actor
	// Actors.registerSheet(SYSTEM_NAME, CharacterSheetGURPS, {
	// 	types: [ActorType.Character],
	// 	makeDefault: true,
	// 	label: game.i18n.localize("gurps.system.sheet.character"),
	// })
	// Actors.registerSheet(SYSTEM_NAME, CharacterSheetGURPSv2, {
	// 	types: [ActorType.Character],
	// 	makeDefault: false,
	// 	label: game.i18n.localize("test sheet"),
	// })
	// Actors.registerSheet(SYSTEM_NAME, MookSheetGURPS, {
	// 	types: [ActorType.Character],
	// 	makeDefault: false,
	// 	label: game.i18n.localize("gurps.system.sheet.mook"),
	// })
	// Actors.registerSheet(SYSTEM_NAME, LootSheetGURPS, {
	// 	types: [ActorType.Loot],
	// 	makeDefault: true,
	// 	label: game.i18n.localize("gurps.system.sheet.loot"),
	// })
	// Actors.registerSheet(SYSTEM_NAME, LegacyCharacterSheetGURPS, {
	// 	types: [ActorType.LegacyCharacter, ActorType.LegacyEnemy],
	// 	makeDefault: true,
	// 	label: game.i18n.localize("gurps.system.sheet.character"),
	// })
	// Item
	// Items.registerSheet(SYSTEM_NAME, TraitSheetGURPS, {
	// 	types: [ItemType.Trait],
	// 	makeDefault: true,
	// 	label: game.i18n.localize("gurps.system.sheet.trait"),
	// })
	// Items.registerSheet(SYSTEM_NAME, TraitContainerSheetGURPS, {
	// 	types: [ItemType.TraitContainer],
	// 	makeDefault: true,
	// 	label: game.i18n.localize("gurps.system.sheet.trait_container"),
	// })
	// Items.registerSheet(SYSTEM_NAME, TraitModifierSheetGURPS, {
	// 	types: [ItemType.TraitModifier],
	// 	makeDefault: true,
	// 	label: game.i18n.localize("gurps.system.sheet.modifier"),
	// })
	// Items.registerSheet(SYSTEM_NAME, TraitModifierContainerSheetGURPS, {
	// 	types: [ItemType.TraitModifierContainer],
	// 	makeDefault: true,
	// 	label: game.i18n.localize("gurps.system.sheet.modifier_container"),
	// })
	// Items.registerSheet(SYSTEM_NAME, SkillSheetGURPS, {
	// 	types: [ItemType.Skill],
	// 	makeDefault: true,
	// 	label: game.i18n.localize("gurps.system.sheet.skill"),
	// })
	// Items.registerSheet(SYSTEM_NAME, TechniqueSheetGURPS, {
	// 	types: [ItemType.Technique],
	// 	makeDefault: true,
	// 	label: game.i18n.localize("gurps.system.sheet.technique"),
	// })
	// Items.registerSheet(SYSTEM_NAME, SkillContainerSheetGURPS, {
	// 	types: [ItemType.SkillContainer],
	// 	makeDefault: true,
	// 	label: game.i18n.localize("gurps.system.sheet.skill_container"),
	// })
	// Items.registerSheet(SYSTEM_NAME, SpellSheetGURPS, {
	// 	types: [ItemType.Spell],
	// 	makeDefault: true,
	// 	label: game.i18n.localize("gurps.system.sheet.spell"),
	// })
	// Items.registerSheet(SYSTEM_NAME, SpellContainerSheetGURPS, {
	// 	types: [ItemType.SpellContainer],
	// 	makeDefault: true,
	// 	label: game.i18n.localize("gurps.system.sheet.spell_container"),
	// })
	// Items.registerSheet(SYSTEM_NAME, RitualMagicSpellSheetGURPS, {
	// 	types: [ItemType.RitualMagicSpell],
	// 	makeDefault: true,
	// 	label: game.i18n.localize("gurps.system.sheet.ritual_magic_spell"),
	// })
	// Items.registerSheet(SYSTEM_NAME, EquipmentSheetGURPS, {
	// 	types: [ItemType.Equipment, ItemType.EquipmentContainer],
	// 	makeDefault: true,
	// 	label: game.i18n.localize("gurps.system.sheet.equipment"),
	// })
	// Items.registerSheet(SYSTEM_NAME, EquipmentModifierSheetGURPS, {
	// 	types: [ItemType.EquipmentModifier],
	// 	makeDefault: true,
	// 	label: game.i18n.localize("gurps.system.sheet.eqp_modifier"),
	// })
	// Items.registerSheet(SYSTEM_NAME, EquipmentModifierContainerSheetGURPS, {
	// 	types: [ItemType.EquipmentModifierContainer],
	// 	makeDefault: true,
	// 	label: game.i18n.localize("gurps.system.sheet.eqp_modifier_container"),
	// })
	// Items.registerSheet(SYSTEM_NAME, NoteSheetGURPS, {
	// 	types: [ItemType.Note],
	// 	makeDefault: true,
	// 	label: game.i18n.localize("gurps.system.sheet.note"),
	// })
	// Items.registerSheet(SYSTEM_NAME, NoteContainerSheetGURPS, {
	// 	types: [ItemType.NoteContainer],
	// 	makeDefault: true,
	// 	label: game.i18n.localize("gurps.system.sheet.note_container"),
	// })
	// Items.registerSheet(SYSTEM_NAME, MeleeWeaponSheetGURPS, {
	// 	types: [ItemType.WeaponMelee],
	// 	makeDefault: true,
	// 	label: game.i18n.localize("gurps.system.sheet.melee_weapon"),
	// })
	// Items.registerSheet(SYSTEM_NAME, RangedWeaponSheetGURPS, {
	// 	types: [ItemType.WeaponRanged],
	// 	makeDefault: true,
	// 	label: game.i18n.localize("gurps.system.sheet.ranged_weapon"),
	// })
	// Items.registerSheet(SYSTEM_NAME, EffectSheetGURPS, {
	// 	types: [ItemType.Effect, ItemType.Condition],
	// 	makeDefault: true,
	// 	label: game.i18n.localize("gurps.system.sheet.effect"),
	// })
	// Items.registerSheet(SYSTEM_NAME, LegacyItemSheetGURPS, {
	// 	types: [ItemType.LegacyItem],
	// 	makeDefault: true,
	// 	label: game.i18n.localize("gurps.system.sheet.static_equipment"),
	// })
	// Journal Entry Page
	// DocumentSheetConfig.registerSheet(JournalEntryPage, SYSTEM_NAME, JournalPDFPageSheetGURPS, {
	// 	types: [JournalEntryPageType.pdf],
	// 	makeDefault: true,
	// 	label: game.i18n.localize("gurps.system.sheet.pdf_edit"),
	// })
}
