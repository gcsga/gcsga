import { SYSTEM_NAME } from "@module/data/index.ts"
import { randomID } from "types/foundry/common/utils/helpers.js"
import { LocalizeGURPS } from "./localize.ts"
import { PrereqList } from "@prereq/prereq_list.ts"
import { selfctrl } from "./enum/selfctrl.ts"
import { SkillDefault } from "@sytem/default/index.ts"
import { stdmg } from "./enum/stdmg.ts"
import { FeatureObj } from "@feature/index.ts"
import { ItemType } from "@item/types.ts"
import { ItemFlags, ItemFlagsGURPS, ItemSourceGURPS } from "@item/base/data/index.ts"
import { TraitSystemSource } from "@item/trait/data.ts"
import { TraitContainerSystemSource } from "@item/trait_container/data.ts"
import { TraitModifierSystemSource } from "@item/trait_modifier/data.ts"
import { TraitModifierContainerSystemSource } from "@item/trait_modifier_container/data.ts"
import { SkillSystemSource } from "@item/skill/data.ts"
import { TechniqueSystemSource } from "@item/technique/data.ts"
import { SkillContainerSystemSource } from "@item/skill_container/data.ts"
import { SpellSystemSource } from "@item/spell/data.ts"
import { RitualMagicSpellSystemSource } from "@item/ritual_magic_spell/data.ts"
import { SpellContainerSystemSource } from "@item/spell_container/data.ts"
import { EquipmentSystemSource } from "@item/equipment/data.ts"
import { EquipmentContainerSystemSource } from "@item/equipment_container/data.ts"
import { EquipmentModifierSystemSource } from "@item/equipment_modifier/data.ts"
import { EquipmentModifierContainerSystemSource } from "@item/equipment_modifier_container/data.ts"
import { NoteSystemSource } from "@item/note/data.ts"
import { NoteContainerSystemSource } from "@item/note_container/data.ts"
import { MeleeWeaponSystemSource } from "@item/melee_weapon/data.ts"
import { RangedWeaponSystemSource } from "@item/ranged_weapon/data.ts"

type ImportedTraitSystemSource = TraitSystemSource & {
	modifiers: (ImportedTraitModifierSystemSource | ImportedTraitModifierContainerSystemSource)[]
	weapons: (ImportedMeleeWeaponSystemSource | ImportedRangedWeaponSystemSource)[]
}

type ImportedTraitContainerSystemSource = TraitContainerSystemSource & {
	children: (ImportedTraitSystemSource | ImportedTraitContainerSystemSource)[]
	modifiers: (ImportedTraitModifierSystemSource | ImportedTraitModifierContainerSystemSource)[]
	weapons: (ImportedMeleeWeaponSystemSource | ImportedRangedWeaponSystemSource)[]
}

type ImportedTraitModifierSystemSource = TraitModifierSystemSource

type ImportedTraitModifierContainerSystemSource = TraitModifierContainerSystemSource & {
	children: (ImportedTraitModifierSystemSource | ImportedTraitModifierContainerSystemSource)[]
}

type ImportedSkillSystemSource = SkillSystemSource & {
	weapons: (ImportedMeleeWeaponSystemSource | ImportedRangedWeaponSystemSource)[]
}

type ImportedTechniqueSystemSorce = TechniqueSystemSource & {
	weapons: (ImportedMeleeWeaponSystemSource | ImportedRangedWeaponSystemSource)[]
}

type ImportedSkillContainerSystemSource = SkillContainerSystemSource & {
	children: (ImportedSkillSystemSource | ImportedTechniqueSystemSorce | ImportedSkillContainerSystemSource)[]
}

type ImportedSpellSystemSource = SpellSystemSource & {
	weapons: (ImportedMeleeWeaponSystemSource | ImportedRangedWeaponSystemSource)[]
}

type ImportedRitualMagicSpellSystemSource = RitualMagicSpellSystemSource & {
	weapons: (ImportedMeleeWeaponSystemSource | ImportedRangedWeaponSystemSource)[]
}

type ImportedSpellContainerSystemSource = SpellContainerSystemSource & {
	children: (ImportedSpellSystemSource | ImportedRitualMagicSpellSystemSource | ImportedSpellContainerSystemSource)[]
}

type ImportedEquipmentSystemSource = EquipmentSystemSource & {
	modifiers: (ImportedEquipmentModifierSystemSource | ImportedEquipmentModifierContainerSystemSource)[]
	weapons: (ImportedMeleeWeaponSystemSource | ImportedRangedWeaponSystemSource)[]
}

type ImportedEquipmentContainerSystemSource = EquipmentContainerSystemSource & {
	children: (ImportedEquipmentSystemSource | ImportedEquipmentContainerSystemSource)[]
	modifiers: (ImportedEquipmentModifierSystemSource | ImportedEquipmentModifierContainerSystemSource)[]
	weapons: (ImportedMeleeWeaponSystemSource | ImportedRangedWeaponSystemSource)[]
}

type ImportedEquipmentModifierSystemSource = EquipmentModifierSystemSource

type ImportedEquipmentModifierContainerSystemSource = EquipmentModifierContainerSystemSource & {
	children: (ImportedEquipmentModifierSystemSource | ImportedEquipmentModifierContainerSystemSource)[]
}

type ImportedNoteSystemSource = NoteSystemSource

type ImportedNoteContainerSystemSource = NoteContainerSystemSource & {
	children: (ImportedNoteSystemSource | ImportedNoteContainerSystemSource)[]
}

type ImportedMeleeWeaponSystemSource = MeleeWeaponSystemSource
type ImportedRangedWeaponSystemSource = RangedWeaponSystemSource

export type ImportedSystemSource =
	| ImportedTraitSystemSource
	| ImportedTraitContainerSystemSource
	| ImportedTraitModifierSystemSource
	| ImportedTraitModifierContainerSystemSource
	| ImportedSkillSystemSource
	| ImportedTechniqueSystemSorce
	| ImportedSkillContainerSystemSource
	| ImportedSpellSystemSource
	| ImportedRitualMagicSpellSystemSource
	| ImportedSpellContainerSystemSource
	| ImportedEquipmentSystemSource
	| ImportedEquipmentContainerSystemSource
	| ImportedEquipmentModifierSystemSource
	| ImportedEquipmentModifierContainerSystemSource
	| ImportedNoteSystemSource
	| ImportedNoteContainerSystemSource
	| ImportedMeleeWeaponSystemSource
	| ImportedRangedWeaponSystemSource

interface ItemImportConext {
	container: string | null
	other?: boolean
	sort: number
}

class ImportUtils {
	static importItems(
		list: ImportedSystemSource[],
		context: ItemImportConext = { container: null, sort: 0 },
	): ImportedSystemSource[] {
		if (!list) return []

		let items: Partial<ItemSourceGURPS>[] = []

		for (const item of list) {
			const [itemData, itemFlags, children, id] = ImportUtils.getItemData(item, context, randomID())

			let type = itemData.type?.replace("_container", "")
			if (type === ItemType.Technique) type = ItemType.Skill
			else if (type === ItemType.RitualMagicSpell) type = ItemType.Spell
			else if (type === ItemType.Equipment) type = "equipment"
			const newItem = {
				name: ImportUtils.getItemName(item),
				img: `systems/${SYSTEM_NAME}/assets/icons/${type}.svg`,
				type: itemData.type as ItemType,
				system: itemData,
				flags: itemFlags,
				sort: context.sort * 1000,
				_id: id,
			}
			if (!newItem.name) {
				newItem.name = game.i18n.localize(`TYPES.Item.${newItem.system.type}`)
			}
			items.push(newItem)
			items = [...items, ...children]
			context.sort += 1
		}
		return items
	}

	private static getItemName(item: ImportedSystemSource): string {
		switch (item.type) {
			case ItemType.MeleeWeapon:
			case ItemType.RangedWeapon:
				return (item as ImportedMeleeWeaponSystemSource).usage
			case ItemType.Equipment:
			case ItemType.EquipmentContainer:
				return (item as ImportedEquipmentSystemSource).description
			case ItemType.Note:
			case ItemType.NoteContainer:
				return (item as ImportedNoteSystemSource).text
			default:
				return (item as ImportedTraitSystemSource).name
		}
	}

	private static getItemData(
		item: ImportedSystemSource,
		context: { container: string | null; other?: boolean; sort: number },
		id: string,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	): [any, ItemFlagsGURPS, any[], string] {
		const flags: ItemFlagsGURPS = { [SYSTEM_NAME]: { [ItemFlags.Container]: context.container } }
		if (["equipment", "equipment_container"].includes(item.type!))
			flags[SYSTEM_NAME]![ItemFlags.Other] = context.other || false
		let items: ItemSourceGURPS["system"][] = []
		switch (item.type) {
			case "trait":
				items = [
					...ImportUtils.importItems(item.modifiers, { container: id, sort: context.sort }),
					...ImportUtils.importItems(item.weapons, { container: id, sort: context.sort }),
				]
				return [ImportUtils.getTraitData(item as TraitSystemSource), flags, items, id]
			case "trait_container":
				items = [
					...ImportUtils.importItems(item.children, { container: id, sort: context.sort }),
					...ImportUtils.importItems(item.modifiers, { container: id, sort: context.sort }),
					...ImportUtils.importItems(item.weapons, { container: id, sort: context.sort }),
				]
				return [ImportUtils.getTraitContainerSource(item as TraitContainerSystemSource), flags, items, id]
			case "modifier":
				return [ImportUtils.getTraitModifierData(item as TraitModifierSystemSource), flags, items, id]
			case "modifier_container":
				items = [...ImportUtils.importItems(item.children, { container: id, sort: context.sort })]
				return [
					ImportUtils.getTraitModifierContainerData(item as TraitModifierContainerSystemSource),
					flags,
					items,
					id,
				]
			case "skill":
				items = [...ImportUtils.importItems(item.weapons, { container: id, sort: context.sort })]
				return [ImportUtils.getSkillData(item as SkillSystemSource), flags, items, id]
			case "technique":
				items = [...ImportUtils.importItems(item.weapons, { container: id, sort: context.sort })]
				return [ImportUtils.getTechniqueData(item as TechniqueSystemSource), flags, items, id]
			case "skill_container":
				items = [...ImportUtils.importItems(item.children, { container: id, sort: context.sort })]
				return [ImportUtils.getSkillContainerData(item as SkillContainerSystemSource), flags, items, id]
			case "spell":
				items = [...ImportUtils.importItems(item.weapons, { container: id, sort: context.sort })]
				return [ImportUtils.getSpellData(item as SpellSystemSource), flags, items, id]
			case "ritual_magic_spell":
				items = [...ImportUtils.importItems(item.weapons, { container: id, sort: context.sort })]
				return [ImportUtils.getRitualMagicSpellData(item as RitualMagicSpellSystemSource), flags, items, id]
			case "spell_container":
				items = [...ImportUtils.importItems(item.children, { container: id, sort: context.sort })]
				return [ImportUtils.getSpellContainerData(item as SpellContainerSystemSource), flags, items, id]
			case "equipment":
				items = [
					...ImportUtils.importItems(item.modifiers, { container: id, sort: context.sort }),
					...ImportUtils.importItems(item.weapons, { container: id, sort: context.sort }),
				]
				return [ImportUtils.getEquipmentData(item as EquipmentSystemSource), flags, items, id]
			case "equipment_container":
				items = [
					...ImportUtils.importItems(item.children, { container: id, sort: context.sort }),
					...ImportUtils.importItems(item.modifiers, { container: id, sort: context.sort }),
					...ImportUtils.importItems(item.weapons, { container: id, sort: context.sort }),
				]
				return [ImportUtils.getEquipmentContainerData(item as EquipmentContainerSystemSource), flags, items, id]
			case "eqp_modifier":
				return [ImportUtils.getEquipmentModifierData(item as EquipmentModifierSystemSource), flags, items, id]
			case "eqp_modifier_container":
				items = [...ImportUtils.importItems(item.children, { container: id, sort: context.sort })]
				return [
					ImportUtils.getEquipmentModifierContainerData(item as EquipmentModifierContainerSystemSource),
					flags,
					items,
					id,
				]
			case "note":
				return [ImportUtils.getNoteData(item as NoteSystemSource), flags, items, id]
			case "note_container":
				items = [...ImportUtils.importItems(item.children, { container: id, sort: context.sort })]
				return [ImportUtils.getNoteContainerData(item), flags, items, id]
			case "melee_weapon":
				return [ImportUtils.getMeleeWeaponData(item), flags, items, id]
			case "ranged_weapon":
				return [ImportUtils.getRangedWeaponData(item), flags, items, id]
			default:
				throw new Error(
					LocalizeGURPS.format(LocalizeGURPS.translations.gurps.error.import.invalid_item_type, {
						type: item.type!,
					}),
				)
		}
	}

	static getTraitData(data: TraitSystemSource): TraitSystemSource {
		return {
			_migration: { version: null, previous: null },
			name: data.name ?? "Trait",
			type: ItemType.Trait,
			// id: data.id ?? newUUID(),
			id: data.id ?? "",
			reference: data.reference ?? "",
			reference_highlight: data.reference_highlight ?? "",
			notes: data.notes ?? "",
			tags: data.tags ?? [],
			prereqs: data.prereqs ? PrereqList.fromObject(data.prereqs) : new PrereqList(),
			round_down: data.round_down ?? false,
			disabled: data.disabled ?? false,
			can_level: data.can_level ?? false,
			levels: data.levels ?? 0,
			base_points: data.base_points ?? 0,
			points_per_level: data.points_per_level ?? 0,
			cr: data.cr ?? selfctrl.Roll.NoCR,
			cr_adj: data.cr_adj ?? selfctrl.Adjustment.NoCRAdj,
			features: data.features ? ImportUtils.importFeatures(data.features) : [],
			vtt_notes: data.vtt_notes ?? "",
			study: data.study ?? [],
			study_hours_needed: data.study_hours_needed ?? "200",
			userdesc: data.userdesc ?? "",
		}
	}

	private static getTraitContainerSource(data: TraitContainerSystemSource): TraitContainerSystemSource {
		return {
			_migration: { version: null, previous: null },
			name: data.name ?? "Trait Container",
			type: ItemType.TraitContainer,
			container_type: data.container_type ?? "group",
			id: data.id ?? "",
			reference: data.reference ?? "",
			reference_highlight: data.reference_highlight ?? "",
			notes: data.notes ?? "",
			tags: data.tags ?? [],
			disabled: data.disabled ?? false,
			cr: data.cr ?? selfctrl.Roll.NoCR,
			cr_adj: data.cr_adj ?? selfctrl.Adjustment.NoCRAdj,
			open: data.open ?? false,
			vtt_notes: data.vtt_notes ?? "",
		}
	}

	private static getTraitModifierData(data: TraitModifierSystemSource): TraitModifierSystemSource {
		return {
			_migration: { version: null, previous: null },
			name: data.name ?? "Trait Modifier",
			type: ItemType.TraitModifier,
			id: data.id ?? "",
			reference: data.reference ?? "",
			reference_highlight: data.reference_highlight ?? "",
			notes: data.notes ?? "",
			tags: data.tags ?? [],
			disabled: data.disabled ?? false,
			cost_type: data.cost_type ?? "percentage",
			cost: data.cost ?? 0,
			affects: data.affects ?? "total",
			levels: data.levels ?? 0,
			features: data.features ? ImportUtils.importFeatures(data.features) : [],
			vtt_notes: data.vtt_notes ?? "",
		}
	}

	private static getTraitModifierContainerData(
		data: TraitModifierContainerSystemSource,
	): TraitModifierContainerSystemSource {
		return {
			_migration: { version: null, previous: null },
			name: data.name ?? "Trait Modifier Container",
			type: ItemType.TraitModifierContainer,
			id: data.id ?? "",
			reference: data.reference ?? "",
			reference_highlight: data.reference_highlight ?? "",
			notes: data.notes ?? "",
			tags: data.tags ?? [],
			open: data.open ?? false,
			vtt_notes: data.vtt_notes ?? "",
		}
	}

	private static getSkillData(data: SkillSystemSource): SkillSystemSource {
		return {
			_migration: { version: null, previous: null },
			name: data.name ?? "Skill",
			type: ItemType.Skill,
			id: data.id ?? "",
			reference: data.reference ?? "",
			reference_highlight: data.reference_highlight ?? "",
			notes: data.notes ?? "",
			tags: data.tags ?? [],
			prereqs: data.prereqs ? PrereqList.fromObject(data.prereqs) : new PrereqList(),
			points: data.points ?? 1,
			specialization: data.specialization ?? "",
			tech_level: data.tech_level ?? "",
			tech_level_required: !!data.tech_level,
			encumbrance_penalty_multiplier: data.encumbrance_penalty_multiplier ?? 0,
			difficulty: data.difficulty ?? "dx/a",
			defaults: data.defaults ? ImportUtils.importDefaults(data.defaults) : [],
			features: data.features ? ImportUtils.importFeatures(data.features) : [],
			vtt_notes: data.vtt_notes ?? "",
			study: data.study ?? [],
			study_hours_needed: data.study_hours_needed ?? "200",
			defaulted_from: null,
		}
	}

	private static getTechniqueData(data: TechniqueSystemSource): TechniqueSystemSource {
		return {
			_migration: { version: null, previous: null },
			name: data.name ?? "Technique",
			type: ItemType.Technique,
			id: data.id ?? "",
			reference: data.reference ?? "",
			reference_highlight: data.reference_highlight ?? "",
			notes: data.notes ?? "",
			tags: data.tags ?? [],
			prereqs: data.prereqs ? PrereqList.fromObject(data.prereqs) : new PrereqList(),
			points: data.points ?? 1,
			limit: data.limit ?? 0,
			limited: !!data.limit ?? false,
			tech_level: data.tech_level ?? "",
			encumbrance_penalty_multiplier: data.encumbrance_penalty_multiplier ?? 0,
			difficulty: data.difficulty ?? "dx/a",
			default: data.default ? new SkillDefault(data.default) : new SkillDefault(),
			defaults: data.defaults ? ImportUtils.importDefaults(data.defaults) : [],
			features: data.features ? ImportUtils.importFeatures(data.features) : [],
			vtt_notes: data.vtt_notes ?? "",
			study: data.study ?? [],
			study_hours_needed: data.study_hours_needed ?? "200",
			defaulted_from: null,
		}
	}

	private static getSkillContainerData(data: SkillContainerSystemSource): SkillContainerSystemSource {
		return {
			_migration: { version: null, previous: null },
			name: data.name ?? "Skill Container",
			type: ItemType.SkillContainer,
			id: data.id ?? "",
			reference: data.reference ?? "",
			reference_highlight: data.reference_highlight ?? "",
			notes: data.notes ?? "",
			tags: data.tags ?? [],
			open: data.open ?? false,
			vtt_notes: data.vtt_notes ?? "",
		}
	}

	private static getSpellData(data: SpellSystemSource): SpellSystemSource {
		return {
			_migration: { version: null, previous: null },
			name: data.name ?? "Spell",
			type: ItemType.Spell,
			id: data.id ?? "",
			reference: data.reference ?? "",
			reference_highlight: data.reference_highlight ?? "",
			notes: data.notes ?? "",
			tags: data.tags ?? [],
			prereqs: data.prereqs ? PrereqList.fromObject(data.prereqs) : new PrereqList(),
			points: data.points ?? 1,
			tech_level: data.tech_level ?? "",
			tech_level_required: !!data.tech_level,
			difficulty: data.difficulty ?? "dx/a",
			college: data.college ?? [],
			power_source: data.power_source ?? "",
			spell_class: data.spell_class ?? "",
			resist: data.resist ?? "",
			casting_cost: data.casting_cost ?? "",
			maintenance_cost: data.maintenance_cost ?? "",
			casting_time: data.casting_time ?? "",
			duration: data.duration ?? "",
			vtt_notes: data.vtt_notes ?? "",
			study: data.study ?? [],
			study_hours_needed: data.study_hours_needed ?? "200",
		}
	}

	private static getRitualMagicSpellData(data: RitualMagicSpellSystemSource): RitualMagicSpellSystemSource {
		return {
			_migration: { version: null, previous: null },
			name: data.name ?? "Spell",
			type: ItemType.RitualMagicSpell,
			id: data.id ?? "",
			reference: data.reference ?? "",
			reference_highlight: data.reference_highlight ?? "",
			notes: data.notes ?? "",
			tags: data.tags ?? [],
			prereqs: data.prereqs ? PrereqList.fromObject(data.prereqs) : new PrereqList(),
			points: data.points ?? 1,
			tech_level: data.tech_level ?? "",
			tech_level_required: !!data.tech_level,
			difficulty: data.difficulty ?? "dx/a",
			college: data.college ?? [],
			power_source: data.power_source ?? "",
			spell_class: data.spell_class ?? "",
			resist: data.resist ?? "",
			casting_cost: data.casting_cost ?? "",
			maintenance_cost: data.maintenance_cost ?? "",
			casting_time: data.casting_time ?? "",
			duration: data.duration ?? "",
			base_skill: data.base_skill ?? "",
			prereq_count: data.prereq_count ?? 0,
			vtt_notes: data.vtt_notes ?? "",
			study: data.study ?? [],
			study_hours_needed: data.study_hours_needed ?? "200",
		}
	}

	private static getSpellContainerData(data: SpellContainerSystemSource): SpellContainerSystemSource {
		return {
			_migration: { version: null, previous: null },
			name: data.name ?? "Spell Container",
			type: ItemType.SpellContainer,
			id: data.id ?? "",
			reference: data.reference ?? "",
			reference_highlight: data.reference_highlight ?? "",
			notes: data.notes ?? "",
			tags: data.tags ?? [],
			open: data.open ?? false,
			vtt_notes: data.vtt_notes ?? "",
		}
	}

	// private static getEquipmentData(data: EquipmentSystemSource, other = false): EquipmentSystemSource {
	private static getEquipmentData(data: EquipmentSystemSource): EquipmentSystemSource {
		return {
			_migration: { version: null, previous: null },
			name: data.name ?? "Equipment",
			type: ItemType.Equipment,
			id: data.id ?? "",
			reference: data.reference ?? "",
			reference_highlight: data.reference_highlight ?? "",
			notes: data.notes ?? "",
			tags: data.tags ?? [],
			prereqs: data.prereqs ? PrereqList.fromObject(data.prereqs) : new PrereqList(),
			features: data.features ? ImportUtils.importFeatures(data.features) : [],
			tech_level: data.tech_level ?? "",
			value: data.value ?? 0,
			weight: data.weight ?? "0 lb",
			uses: data.uses ?? 0,
			max_uses: data.max_uses ?? 0,
			equipped: data.equipped ?? true,
			description: data.description ?? "",
			legality_class: data.legality_class ?? "4",
			quantity: data.quantity ?? 0,
			ignore_weight_for_skills: data.ignore_weight_for_skills ?? false,
			rated_strength: data.rated_strength ?? 0,
			// other: other,
			vtt_notes: data.vtt_notes ?? "",
		}
	}

	private static getEquipmentContainerData(
		data: EquipmentContainerSystemSource,
		// other = false
	): EquipmentContainerSystemSource {
		return {
			_migration: { version: null, previous: null },
			name: data.name ?? "Equipment",
			type: ItemType.EquipmentContainer,
			id: data.id ?? "",
			reference: data.reference ?? "",
			reference_highlight: data.reference_highlight ?? "",
			notes: data.notes ?? "",
			tags: data.tags ?? [],
			prereqs: data.prereqs ? PrereqList.fromObject(data.prereqs) : new PrereqList(),
			features: data.features ? ImportUtils.importFeatures(data.features) : [],
			tech_level: data.tech_level ?? "",
			value: data.value ?? 0,
			weight: data.weight ?? "0 lb",
			uses: data.uses ?? 0,
			max_uses: data.max_uses ?? 0,
			equipped: data.equipped ?? true,
			description: data.description ?? "",
			legality_class: data.legality_class ?? "4",
			quantity: data.quantity ?? 0,
			ignore_weight_for_skills: data.ignore_weight_for_skills ?? false,
			rated_strength: data.rated_strength ?? 0,
			// other: other,
			open: data.open ?? false,
			vtt_notes: data.vtt_notes ?? "",
		}
	}

	private static getEquipmentModifierData(data: EquipmentModifierSystemSource): EquipmentModifierSystemSource {
		return {
			_migration: { version: null, previous: null },
			name: data.name ?? "Equipment Modifier",
			type: ItemType.EquipmentModifier,
			id: data.id ?? "",
			reference: data.reference ?? "",
			reference_highlight: data.reference_highlight ?? "",
			notes: data.notes ?? "",
			tags: data.tags ?? [],
			cost_type: data.cost_type ?? "to_original_cost",
			cost: data.cost ?? "",
			weight_type: data.weight_type ?? "to_original_weight",
			weight: data.weight ?? "",
			tech_level: data.tech_level ?? "",
			features: data.features ? ImportUtils.importFeatures(data.features) : [],
			disabled: data.disabled ?? false,
			vtt_notes: data.vtt_notes ?? "",
		}
	}

	private static getEquipmentModifierContainerData(
		data: EquipmentModifierContainerSystemSource,
	): EquipmentModifierContainerSystemSource {
		return {
			_migration: { version: null, previous: null },
			name: data.name ?? "Equipment Modifier Container",
			type: ItemType.EquipmentModifierContainer,
			id: data.id ?? "",
			reference: data.reference ?? "",
			reference_highlight: data.reference_highlight ?? "",
			notes: data.notes ?? "",
			tags: data.tags ?? [],
			open: data.open ?? false,
			vtt_notes: data.vtt_notes ?? "",
		}
	}

	private static getNoteData(data: NoteSystemSource): NoteSystemSource {
		return {
			_migration: { version: null, previous: null },
			name: data.text ?? "Note",
			type: ItemType.Note,
			id: data.id ?? "",
			reference: data.reference ?? "",
			reference_highlight: data.reference_highlight ?? "",
			notes: data.notes ?? "",
			tags: data.tags ?? [],
			text: data.text ?? "",
			vtt_notes: data.vtt_notes ?? "",
		}
	}

	private static getNoteContainerData(data: NoteContainerSystemSource): NoteContainerSystemSource {
		return {
			name: data.name ?? "Note",
			type: ItemType.NoteContainer,
			id: data.id ?? "",
			reference: data.reference ?? "",
			reference_highlight: data.reference_highlight ?? "",
			notes: data.notes ?? "",
			tags: data.tags ?? [],
			text: data.text ?? "",
			open: data.open ?? false,
			vtt_notes: data.vtt_notes ?? "",
		}
	}

	private static getMeleeWeaponData(data: MeleeWeaponSystemSource): MeleeWeaponSystemSource {
		return {
			_migration: { version: null, previous: null },
			id: data.id ?? "",
			type: ItemType.MeleeWeapon,
			strength: data.strength ?? "",
			usage: data.usage ?? "",
			usage_notes: data.usage_notes ?? "",
			defaults: data.defaults ? ImportUtils.importDefaults(data.defaults) : [],
			reach: data.reach ?? "",
			parry: data.parry ?? "",
			block: data.block ?? "",
			damage: {
				type: data.damage.type ?? "",
				st: data.damage.st ?? stdmg.Option.None,
				base: data.damage.base ?? "",
				armor_divisor: data.damage.armor_divisor ?? 1,
				fragmentation: data.damage.fragmentation ?? "",
				fragmentation_armor_divisor: data.damage.fragmentation_armor_divisor ?? 1,
				fragmentation_type: data.damage.fragmentation_type ?? "",
				modifier_per_die: data.damage.modifier_per_die ?? 0,
			},
		}
	}

	private static getRangedWeaponData(data: RangedWeaponSystemSource): RangedWeaponSystemSource {
		return {
			_migration: { version: null, previous: null },
			id: data.id ?? "",
			type: ItemType.RangedWeapon,
			strength: data.strength ?? "",
			usage: data.usage ?? "",
			usage_notes: data.usage_notes ?? "",
			defaults: data.defaults ? ImportUtils.importDefaults(data.defaults) : [],
			accuracy: data.accuracy ?? "",
			range: data.range ?? "",
			rate_of_fire: data.rate_of_fire ?? "",
			shots: data.shots ?? "",
			bulk: data.bulk ?? "",
			recoil: data.recoil ?? "",
			damage: {
				type: data.damage.type ?? "",
				st: data.damage.st ?? stdmg.Option.None,
				base: data.damage.base ?? "",
				armor_divisor: data.damage.armor_divisor ?? 1,
				fragmentation: data.damage.fragmentation ?? "",
				fragmentation_armor_divisor: data.damage.fragmentation_armor_divisor ?? 1,
				fragmentation_type: data.damage.fragmentation_type ?? "",
				modifier_per_die: data.damage.modifier_per_die ?? 0,
			},
		}
	}

	private static importFeatures(features: FeatureObj[]): FeatureObj[] {
		return features
		// const list: Feature[] = []
		// for (const e of features) {
		// 	list.push(e)
		// 	// const FeatureConstructor = CONFIG.GURPS.Feature.classes[e.type as feature.Type]
		// 	// if (FeatureConstructor) {
		// 	// 	const f = FeatureConstructor.fromObject(e)
		// 	// 	list.push(f.toObject())
		// 	// }
		// }
		// return list
	}

	private static importDefaults(features: SkillDefault[]): SkillDefault[] {
		const list: SkillDefault[] = []
		for (const d of features) {
			list.push(new SkillDefault(d))
		}
		return list
	}
}

export { ImportUtils }
