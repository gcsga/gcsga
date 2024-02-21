import { CharacterSheetGURPS, LootSheetGURPS, MookSheetGURPS, StaticCharacterSheetGURPS } from "@actor/sheet.ts"
import { ActorType, ItemType, SYSTEM_NAME } from "@data"
import {
	EffectSheet,
	EquipmentModifierContainerSheet,
	EquipmentModifierSheet,
	EquipmentSheet,
	MeleeWeaponSheet,
	NoteContainerSheet,
	NoteSheet,
	RangedWeaponSheet,
	RitualMagicSpellSheet,
	SkillContainerSheet,
	SkillSheet,
	SpellContainerSheet,
	SpellSheet,
	StaticItemSheet,
	TechniqueSheet,
	TraitContainerSheet,
	TraitModifierContainerSheet,
	TraitModifierSheet,
	TraitSheet,
} from "@item/sheet.ts"
import { JournalEntryPageType } from "@module/journal-entry/page/document.ts"
import { JournalPDFPageSheetGURPS } from "@module/journal-entry/page/sheet.ts"

export function registerSheets(): void {
	// Actor
	Actors.registerSheet(SYSTEM_NAME, CharacterSheetGURPS, {
		types: [ActorType.Character],
		makeDefault: true,
		label: game.i18n.localize("gurps.system.sheet.character_gcs"),
	})
	Actors.registerSheet(SYSTEM_NAME, MookSheetGURPS, {
		types: [ActorType.Character],
		makeDefault: false,
		label: game.i18n.localize("gurps.system.sheet.mook"),
	})
	Actors.registerSheet(SYSTEM_NAME, LootSheetGURPS, {
		types: [ActorType.Loot],
		makeDefault: true,
		label: game.i18n.localize("gurps.system.sheet.loot"),
	})
	Actors.registerSheet(SYSTEM_NAME, StaticCharacterSheetGURPS, {
		types: [ActorType.LegacyCharacter, ActorType.LegacyEnemy],
		makeDefault: true,
		label: game.i18n.localize("gurps.system.sheet.character"),
	})

	// Item
	Items.registerSheet(SYSTEM_NAME, TraitSheet, {
		types: [ItemType.Trait],
		makeDefault: true,
		label: game.i18n.localize("gurps.system.sheet.trait"),
	})
	Items.registerSheet(SYSTEM_NAME, TraitContainerSheet, {
		types: [ItemType.TraitContainer],
		makeDefault: true,
		label: game.i18n.localize("gurps.system.sheet.trait_container"),
	})
	Items.registerSheet(SYSTEM_NAME, TraitModifierSheet, {
		types: [ItemType.TraitModifier],
		makeDefault: true,
		label: game.i18n.localize("gurps.system.sheet.modifier"),
	})
	Items.registerSheet(SYSTEM_NAME, TraitModifierContainerSheet, {
		types: [ItemType.TraitModifierContainer],
		makeDefault: true,
		label: game.i18n.localize("gurps.system.sheet.modifier_container"),
	})
	Items.registerSheet(SYSTEM_NAME, SkillSheet, {
		types: [ItemType.Skill],
		makeDefault: true,
		label: game.i18n.localize("gurps.system.sheet.skill"),
	})
	Items.registerSheet(SYSTEM_NAME, TechniqueSheet, {
		types: [ItemType.Technique],
		makeDefault: true,
		label: game.i18n.localize("gurps.system.sheet.technique"),
	})
	Items.registerSheet(SYSTEM_NAME, SkillContainerSheet, {
		types: [ItemType.SkillContainer],
		makeDefault: true,
		label: game.i18n.localize("gurps.system.sheet.skill_container"),
	})
	Items.registerSheet(SYSTEM_NAME, SpellSheet, {
		types: [ItemType.Spell],
		makeDefault: true,
		label: game.i18n.localize("gurps.system.sheet.spell"),
	})
	Items.registerSheet(SYSTEM_NAME, SpellContainerSheet, {
		types: [ItemType.SpellContainer],
		makeDefault: true,
		label: game.i18n.localize("gurps.system.sheet.spell_container"),
	})
	Items.registerSheet(SYSTEM_NAME, RitualMagicSpellSheet, {
		types: [ItemType.RitualMagicSpell],
		makeDefault: true,
		label: game.i18n.localize("gurps.system.sheet.ritual_magic_spell"),
	})
	Items.registerSheet(SYSTEM_NAME, EquipmentSheet, {
		types: [ItemType.Equipment, ItemType.EquipmentContainer],
		makeDefault: true,
		label: game.i18n.localize("gurps.system.sheet.equipment"),
	})
	Items.registerSheet(SYSTEM_NAME, EquipmentModifierSheet, {
		types: [ItemType.EquipmentModifier],
		makeDefault: true,
		label: game.i18n.localize("gurps.system.sheet.eqp_modifier"),
	})
	Items.registerSheet(SYSTEM_NAME, EquipmentModifierContainerSheet, {
		types: [ItemType.EquipmentModifierContainer],
		makeDefault: true,
		label: game.i18n.localize("gurps.system.sheet.eqp_modifier_container"),
	})
	Items.registerSheet(SYSTEM_NAME, NoteSheet, {
		types: [ItemType.Note],
		makeDefault: true,
		label: game.i18n.localize("gurps.system.sheet.note"),
	})
	Items.registerSheet(SYSTEM_NAME, NoteContainerSheet, {
		types: [ItemType.NoteContainer],
		makeDefault: true,
		label: game.i18n.localize("gurps.system.sheet.note_container"),
	})
	Items.registerSheet(SYSTEM_NAME, MeleeWeaponSheet, {
		types: [ItemType.MeleeWeapon],
		makeDefault: true,
		label: game.i18n.localize("gurps.system.sheet.melee_weapon"),
	})
	Items.registerSheet(SYSTEM_NAME, RangedWeaponSheet, {
		types: [ItemType.RangedWeapon],
		makeDefault: true,
		label: game.i18n.localize("gurps.system.sheet.ranged_weapon"),
	})
	Items.registerSheet(SYSTEM_NAME, EffectSheet, {
		types: [ItemType.Effect, ItemType.Condition],
		makeDefault: true,
		label: game.i18n.localize("gurps.system.sheet.effect"),
	})
	Items.registerSheet(SYSTEM_NAME, StaticItemSheet, {
		types: [ItemType.LegacyEquipment],
		makeDefault: true,
		label: game.i18n.localize("gurps.system.sheet.static_equipment"),
	})

	// Journal Entry Page
	DocumentSheetConfig.registerSheet(JournalEntryPage, SYSTEM_NAME, JournalPDFPageSheetGURPS, {
		types: [JournalEntryPageType.pdf],
		makeDefault: true,
		label: game.i18n.localize("gurps.system.sheet.pdf_edit"),
	})
}
