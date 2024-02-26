import { EncumbrancePenaltyMultiplier, SkillSource, SkillSystemSource } from "@item/skill/data.ts"
import { TraitSource, TraitSystemSource } from "@item/trait/data.ts"
import {
	ImportedEquipmentContainerSystemSource,
	ImportedEquipmentModifierContainerSystemSource,
	ImportedEquipmentModifierSystemSource,
	ImportedEquipmentSystemSource,
	ImportedFeature,
	ImportedItemSource,
	ImportedItemType,
	ImportedMeleeWeaponSystemSource,
	ImportedNoteContainerSystemSource,
	ImportedNoteSystemSource,
	ImportedPrereqList,
	ImportedRangedWeaponSystemSource,
	ImportedRitualMagicSpellSystemSource,
	ImportedSkillContainerSystemSource,
	ImportedSkillSystemSource,
	ImportedSpellContainerSystemSource,
	ImportedSpellSystemSource,
	ImportedStudy,
	ImportedTechniqueSystemSorce,
	ImportedTemplatePicker,
	ImportedTraitContainerSystemSource,
	ImportedTraitModifierContainerSystemSource,
	ImportedTraitModifierSystemSource,
	ImportedTraitSystemSource,
} from "./data.ts"
import { TechniqueSource, TechniqueSystemSource } from "@item/technique/data.ts"
import { SpellSource, SpellSystemSource } from "@item/spell/data.ts"
import { EquipmentSource, EquipmentSystemSource } from "@item/equipment/data.ts"
import { ItemFlags, ItemType, SYSTEM_NAME, gid } from "@data"
import { ItemSourceGURPS } from "@item/data/index.ts"
import { FeatureObj, PrereqListObj, Study, TemplatePickerObj } from "@system"
import {
	LocalizeGURPS,
	affects,
	container,
	difficulty,
	emcost,
	emweight,
	picker,
	prereq,
	selfctrl,
	tmcost,
} from "@util"
import { TraitContainerSource, TraitContainerSystemSource } from "@item/trait-container/data.ts"
import { TraitModifierSource, TraitModifierSystemSource } from "@item/trait-modifier/data.ts"
import {
	TraitModifierContainerSource,
	TraitModifierContainerSystemSource,
} from "@item/trait-modifier-container/data.ts"
import { SkillContainerSource, SkillContainerSystemSource } from "@item/skill-container/data.ts"
import { RitualMagicSpellSource, RitualMagicSpellSystemSource } from "@item/ritual-magic-spell/data.ts"
import { SpellContainerSource, SpellContainerSystemSource } from "@item/spell-container/data.ts"
import { EquipmentContainerSource, EquipmentContainerSystemSource } from "@item/equipment-container/data.ts"
import { EquipmentModifierSource, EquipmentModifierSystemSource } from "@item/equipment-modifier/data.ts"
import {
	EquipmentModifierContainerSource,
	EquipmentModifierContainerSystemSource,
} from "@item/equipment-modifier-container/data.ts"
import { NoteSource, NoteSystemSource } from "@item/note/data.ts"
import { NoteContainerSource, NoteContainerSystemSource } from "@item/note-container/data.ts"
import { MeleeWeaponSource, MeleeWeaponSystemSource } from "@item/melee-weapon/data.ts"
import { RangedWeaponSource, RangedWeaponSystemSource } from "@item/ranged-weapon/data.ts"

interface ItemImportContext {
	parentId: string | null
	other?: boolean
	// sort: number
}

interface DocumentStats {
	systemId: string
	systemVersion: string
	coreVersion: string
	createdTime: number
	modifiedTime: number
	lastModifiedBy: string
}

abstract class ItemImporter {
	static importItems(
		list?: ImportedItemSource[],
		context: { other?: boolean } = { other: false },
	): ItemSourceGURPS[] {
		if (!list) return []

		const results: ItemSourceGURPS[] = []

		for (const item of list) {
			results.push(...ItemImportHandlers[item.type].importItem(item, { parentId: null, other: context.other }))
		}
		return results
	}

	abstract importItem(item: ImportedItemSource, context: ItemImportContext): ItemSourceGURPS[]

	static importPrereqs(prereqList?: ImportedPrereqList): PrereqListObj {
		return prereqList ?? { type: prereq.Type.List, all: true }
	}

	static importFeatures(featureList?: ImportedFeature[]): FeatureObj[] {
		return featureList ?? []
	}

	static importStudy(studyList?: ImportedStudy[]): Study[] {
		return studyList ?? []
	}

	static importTemplatePicker(templatePicker?: ImportedTemplatePicker): TemplatePickerObj {
		return templatePicker ?? { type: picker.Type.NotApplicable, qualifier: {} }
	}

	static getStats(): DocumentStats {
		const date = Date.now()
		return {
			systemId: SYSTEM_NAME,
			systemVersion: game.system.version,
			coreVersion: game.version,
			createdTime: date,
			modifiedTime: date,
			lastModifiedBy: game.user.id,
		}
	}
}

class TraitImporter extends ItemImporter {
	override importItem(
		item: ImportedTraitSystemSource,
		context: ItemImportContext = { parentId: null },
	): ItemSourceGURPS[] {
		const results: ItemSourceGURPS[] = []

		const id = fu.randomID()

		const systemData: TraitSystemSource = {
			slug: "",
			_migration: { version: null, previous: null },
			type: ItemType.Trait,
			name: item.name ?? "",
			reference: item.reference ?? "",
			reference_highlight: item.reference ?? "",
			notes: item.notes ?? "",
			vtt_notes: item.vtt_notes ?? "",
			userdesc: item.userdesc ?? "",
			tags: item.tags ?? [],
			// modifiers handled separately
			base_points: item.base_points ?? 0,
			levels: item.levels ?? 0,
			points_per_level: item.points_per_level ?? 0,
			prereqs: ItemImporter.importPrereqs(item.prereqs),
			// weapons handled separately
			features: ItemImporter.importFeatures(item.features),
			study: ItemImporter.importStudy(item.study),
			cr: item.cr ?? selfctrl.Roll.NoCR,
			cr_adj: item.cr_adj ?? selfctrl.Adjustment.NoCRAdj,
			study_hours_needed: item.study_hours_needed ?? "",
			disabled: item.disabled ?? false,
			round_down: item.round_down ?? false,
			can_level: item.can_level ?? false,
		}

		item.modifiers?.reduce((acc, mod) => {
			acc.push(...ItemImportHandlers[mod.type].importItem(mod, { parentId: id }))
			return acc
		}, results)

		item.weapons?.reduce((acc, weapon) => {
			acc.push(...ItemImportHandlers[weapon.type].importItem(weapon, { parentId: id }))
			return acc
		}, results)

		const newItem: TraitSource = {
			_id: id,
			type: ItemType.Trait,
			name: systemData.name || LocalizeGURPS.translations.TYPES.Item[ItemType.Trait],
			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.Trait}.svg`,
			system: systemData,
			effects: [],
			folder: null,
			sort: 0,
			ownership: {},
			flags: {
				[SYSTEM_NAME]: {
					[ItemFlags.Container]: context.parentId,
				},
			},
			_stats: ItemImporter.getStats(),
		}

		results.push(newItem)

		return results
	}
}

class TraitContainerImporter extends ItemImporter {
	override importItem(
		item: ImportedTraitContainerSystemSource,
		context: ItemImportContext = { parentId: null },
	): ItemSourceGURPS[] {
		const results: ItemSourceGURPS[] = []

		const id = fu.randomID()

		const systemData: TraitContainerSystemSource = {
			slug: "",
			_migration: { version: null, previous: null },
			type: ItemType.TraitContainer,
			name: item.name ?? "",
			reference: item.reference ?? "",
			reference_highlight: item.reference ?? "",
			notes: item.notes ?? "",
			vtt_notes: item.vtt_notes ?? "",
			ancestry: item.ancestry ?? "",
			userdesc: item.userdesc ?? "",
			tags: item.tags ?? [],
			// modifiers handled separately
			// weapons handled separately
			cr: item.cr ?? selfctrl.Roll.NoCR,
			cr_adj: item.cr_adj ?? selfctrl.Adjustment.NoCRAdj,
			container_type: item.container_type ?? container.Type.Group,
			disabled: item.disabled ?? false,
			template_picker: ItemImporter.importTemplatePicker(item.template_picker),
			open: item.open ?? false,
		}

		item.children?.reduce((acc, child) => {
			acc.push(...ItemImportHandlers[child.type].importItem(child, { parentId: id }))
			return acc
		}, results)

		item.modifiers?.reduce((acc, mod) => {
			acc.push(...ItemImportHandlers[mod.type].importItem(mod, { parentId: id }))
			return acc
		}, results)

		const newItem: TraitContainerSource = {
			_id: id,
			type: ItemType.TraitContainer,
			name: systemData.name || LocalizeGURPS.translations.TYPES.Item[ItemType.TraitContainer],
			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.Trait}.svg`,
			system: systemData,
			effects: [],
			folder: null,
			sort: 0,
			ownership: {},
			flags: {
				[SYSTEM_NAME]: {
					[ItemFlags.Container]: context.parentId,
				},
			},
			_stats: ItemImporter.getStats(),
		}

		results.push(newItem)

		return results
	}
}

class TraitModifierImporter extends ItemImporter {
	override importItem(
		item: ImportedTraitModifierSystemSource,
		context: ItemImportContext = { parentId: null },
	): ItemSourceGURPS[] {
		const results: ItemSourceGURPS[] = []

		const id = fu.randomID()

		const systemData: TraitModifierSystemSource = {
			slug: "",
			_migration: { version: null, previous: null },
			type: ItemType.TraitModifier,
			name: item.name ?? "",
			reference: item.reference ?? "",
			reference_highlight: item.reference ?? "",
			notes: item.notes ?? "",
			vtt_notes: item.vtt_notes ?? "",
			tags: item.tags ?? [],
			cost: item.cost ?? 0,
			levels: item.levels ?? 0,
			affects: item.affects ?? affects.Option.Total,
			cost_type: item.cost_type ?? tmcost.Type.Points,
			disabled: item.disabled ?? false,
			features: ItemImporter.importFeatures(item.features),
		}

		const newItem: TraitModifierSource = {
			_id: id,
			type: ItemType.TraitModifier,
			name: systemData.name || LocalizeGURPS.translations.TYPES.Item[ItemType.TraitModifier],
			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.TraitModifier}.svg`,
			system: systemData,
			effects: [],
			folder: null,
			sort: 0,
			ownership: {},
			flags: {
				[SYSTEM_NAME]: {
					[ItemFlags.Container]: context.parentId,
				},
			},
			_stats: ItemImporter.getStats(),
		}

		results.push(newItem)

		return results
	}
}

class TraitModifierContainerImporter extends ItemImporter {
	override importItem(
		item: ImportedTraitModifierContainerSystemSource,
		context: ItemImportContext = { parentId: null },
	): ItemSourceGURPS[] {
		const results: ItemSourceGURPS[] = []

		const id = fu.randomID()

		const systemData: TraitModifierContainerSystemSource = {
			slug: "",
			_migration: { version: null, previous: null },
			type: ItemType.TraitModifierContainer,
			name: item.name ?? "",
			reference: item.reference ?? "",
			reference_highlight: item.reference ?? "",
			notes: item.notes ?? "",
			vtt_notes: item.vtt_notes ?? "",
			tags: item.tags ?? [],
		}

		item.children?.reduce((acc, child) => {
			acc.push(...ItemImportHandlers[child.type].importItem(child, { parentId: id }))
			return acc
		}, results)

		const newItem: TraitModifierContainerSource = {
			_id: id,
			type: ItemType.TraitModifierContainer,
			name: systemData.name || LocalizeGURPS.translations.TYPES.Item[ItemType.TraitModifierContainer],
			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.TraitModifier}.svg`,
			system: systemData,
			effects: [],
			folder: null,
			sort: 0,
			ownership: {},
			flags: {
				[SYSTEM_NAME]: {
					[ItemFlags.Container]: context.parentId,
				},
			},
			_stats: ItemImporter.getStats(),
		}

		results.push(newItem)

		return results
	}
}

class SkillImporter extends ItemImporter {
	override importItem(
		item: ImportedSkillSystemSource,
		context: ItemImportContext = { parentId: null },
	): ItemSourceGURPS[] {
		const results: ItemSourceGURPS[] = []

		const id = fu.randomID()

		const systemData: SkillSystemSource = {
			slug: "",
			_migration: { version: null, previous: null },
			type: ItemType.Skill,
			name: item.name ?? "",
			reference: item.reference ?? "",
			reference_highlight: item.reference ?? "",
			notes: item.notes ?? "",
			vtt_notes: item.vtt_notes ?? "",
			tags: item.tags ?? [],
			specialization: item.specialization ?? "",
			tech_level: item.tech_level ?? "",
			tech_level_required: typeof item.tech_level === "string",
			difficulty: item.difficulty ?? "dx/a",
			points: item.points ?? 0,
			encumbrance_penalty_multiplier: (item.encumbrance_penalty_multiplier as EncumbrancePenaltyMultiplier) ?? 0,
			defaulted_from: item.defaulted_from ?? { type: gid.Skill, name: "Skill", modifier: 0 },
			defaults: item.defaults ?? [],
			prereqs: ItemImporter.importPrereqs(item.prereqs),
			// weapons handled separately
			features: ItemImporter.importFeatures(item.features),
			study: ItemImporter.importStudy(item.study),
			study_hours_needed: item.study_hours_needed ?? "",
		}

		item.weapons?.reduce((acc, weapon) => {
			acc.push(...ItemImportHandlers[weapon.type].importItem(weapon, { parentId: id }))
			return acc
		}, results)

		const newItem: SkillSource = {
			_id: id,
			type: ItemType.Skill,
			name: systemData.name || LocalizeGURPS.translations.TYPES.Item[ItemType.Skill],
			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.Skill}.svg`,
			system: systemData,
			effects: [],
			folder: null,
			sort: 0,
			ownership: {},
			flags: {
				[SYSTEM_NAME]: {
					[ItemFlags.Container]: context.parentId,
				},
			},
			_stats: ItemImporter.getStats(),
		}

		results.push(newItem)

		return results
	}
}

class TechniqueImporter extends ItemImporter {
	override importItem(
		item: ImportedTechniqueSystemSorce,
		context: ItemImportContext = { parentId: null },
	): ItemSourceGURPS[] {
		const results: ItemSourceGURPS[] = []

		const id = fu.randomID()

		const systemData: TechniqueSystemSource = {
			slug: "",
			_migration: { version: null, previous: null },
			type: ItemType.Technique,
			name: item.name ?? "",
			reference: item.reference ?? "",
			reference_highlight: item.reference ?? "",
			notes: item.notes ?? "",
			vtt_notes: item.vtt_notes ?? "",
			tags: item.tags ?? [],
			tech_level: item.tech_level ?? "",
			difficulty: item.difficulty ?? difficulty.Level.Average,
			points: item.points ?? 0,
			default: item.default ?? { type: gid.Skill, name: "Skill", modifier: 0 },
			limit: item.limit ?? 0,
			limited: typeof item.limit === "number",
			prereqs: ItemImporter.importPrereqs(item.prereqs),
			// weapons handled separately
			features: ItemImporter.importFeatures(item.features),
			study: ItemImporter.importStudy(item.study),
			study_hours_needed: item.study_hours_needed ?? "",
		}

		item.weapons?.reduce((acc, weapon) => {
			acc.push(...ItemImportHandlers[weapon.type].importItem(weapon, { parentId: id }))
			return acc
		}, results)

		const newItem: TechniqueSource = {
			_id: id,
			type: ItemType.Technique,
			name: systemData.name || LocalizeGURPS.translations.TYPES.Item[ItemType.Technique],
			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.Skill}.svg`,
			system: systemData,
			effects: [],
			folder: null,
			sort: 0,
			ownership: {},
			flags: {
				[SYSTEM_NAME]: {
					[ItemFlags.Container]: context.parentId,
				},
			},
			_stats: ItemImporter.getStats(),
		}

		results.push(newItem)

		return results
	}
}

class SkillContainerImporter extends ItemImporter {
	override importItem(
		item: ImportedSkillContainerSystemSource,
		context: ItemImportContext = { parentId: null },
	): ItemSourceGURPS[] {
		const results: ItemSourceGURPS[] = []

		const id = fu.randomID()

		const systemData: SkillContainerSystemSource = {
			_migration: { version: null, previous: null },
			slug: "",
			type: ItemType.SkillContainer,
			name: item.name ?? "",
			reference: item.reference ?? "",
			reference_highlight: item.reference ?? "",
			notes: item.notes ?? "",
			vtt_notes: item.vtt_notes ?? "",
			tags: item.tags ?? [],
			template_picker: ItemImporter.importTemplatePicker(item.template_picker),
			open: item.open ?? false,
		}

		item.children?.reduce((acc, child) => {
			acc.push(...ItemImportHandlers[child.type].importItem(child, { parentId: id }))
			return acc
		}, results)

		const newItem: SkillContainerSource = {
			_id: id,
			type: ItemType.SkillContainer,
			name: systemData.name || LocalizeGURPS.translations.TYPES.Item[ItemType.SkillContainer],
			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.Skill}.svg`,
			system: systemData,
			effects: [],
			folder: null,
			sort: 0,
			ownership: {},
			flags: {
				[SYSTEM_NAME]: {
					[ItemFlags.Container]: context.parentId,
				},
			},
			_stats: ItemImporter.getStats(),
		}

		results.push(newItem)

		return results
	}
}

class SpellImporter extends ItemImporter {
	override importItem(
		item: ImportedSpellSystemSource,
		context: ItemImportContext = { parentId: null },
	): ItemSourceGURPS[] {
		const results: ItemSourceGURPS[] = []

		const id = fu.randomID()

		const systemData: SpellSystemSource = {
			slug: "",
			_migration: { version: null, previous: null },
			type: ItemType.Spell,
			name: item.name ?? "",
			reference: item.reference ?? "",
			reference_highlight: item.reference ?? "",
			notes: item.notes ?? "",
			vtt_notes: item.vtt_notes ?? "",
			tags: item.tags ?? [],
			tech_level: item.tech_level ?? "",
			tech_level_required: typeof item.tech_level === "string",
			difficulty: item.difficulty ?? "dx/a",
			college: item.college ?? [],
			power_source: item.power_source ?? "",
			spell_class: item.spell_class ?? "",
			resist: item.resist ?? "",
			casting_cost: item.casting_cost ?? "",
			maintenance_cost: item.maintenance_cost ?? "",
			casting_time: item.casting_time ?? "",
			duration: item.duration ?? "",
			points: item.points ?? 0,
			prereqs: ItemImporter.importPrereqs(item.prereqs),
			// weapons handled separately
			study: ItemImporter.importStudy(item.study),
			study_hours_needed: item.study_hours_needed ?? "",
		}

		item.weapons?.reduce((acc, weapon) => {
			acc.push(...ItemImportHandlers[weapon.type].importItem(weapon, { parentId: id }))
			return acc
		}, results)

		const newItem: SpellSource = {
			_id: id,
			type: ItemType.Spell,
			name: systemData.name || LocalizeGURPS.translations.TYPES.Item[ItemType.Spell],
			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.Spell}.svg`,
			system: systemData,
			effects: [],
			folder: null,
			sort: 0,
			ownership: {},
			flags: {
				[SYSTEM_NAME]: {
					[ItemFlags.Container]: context.parentId,
				},
			},
			_stats: ItemImporter.getStats(),
		}

		results.push(newItem)

		return results
	}
}

class RitualMagicSpellImporter extends ItemImporter {
	override importItem(
		item: ImportedRitualMagicSpellSystemSource,
		context: ItemImportContext = { parentId: null },
	): ItemSourceGURPS[] {
		const results: ItemSourceGURPS[] = []

		const id = fu.randomID()

		const systemData: RitualMagicSpellSystemSource = {
			slug: "",
			_migration: { version: null, previous: null },
			type: ItemType.RitualMagicSpell,
			name: item.name ?? "",
			reference: item.reference ?? "",
			reference_highlight: item.reference ?? "",
			notes: item.notes ?? "",
			vtt_notes: item.vtt_notes ?? "",
			tags: item.tags ?? [],
			tech_level: item.tech_level ?? "",
			tech_level_required: typeof item.tech_level === "string",
			difficulty: item.difficulty ?? difficulty.Level.Hard,
			college: item.college ?? [],
			power_source: item.power_source ?? "",
			spell_class: item.spell_class ?? "",
			resist: item.resist ?? "",
			casting_cost: item.casting_cost ?? "",
			maintenance_cost: item.maintenance_cost ?? "",
			casting_time: item.casting_time ?? "",
			duration: item.duration ?? "",
			base_skill: item.base_skill ?? "Ritual Magic",
			prereq_count: item.prereq_count ?? 0,
			points: item.points ?? 0,
			prereqs: ItemImporter.importPrereqs(item.prereqs),
			// weapons handled separately
			study: ItemImporter.importStudy(item.study),
			study_hours_needed: item.study_hours_needed ?? "",
		}

		item.weapons?.reduce((acc, weapon) => {
			acc.push(...ItemImportHandlers[weapon.type].importItem(weapon, { parentId: id }))
			return acc
		}, results)

		const newItem: RitualMagicSpellSource = {
			_id: id,
			type: ItemType.RitualMagicSpell,
			name: systemData.name || LocalizeGURPS.translations.TYPES.Item[ItemType.RitualMagicSpell],
			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.Spell}.svg`,
			system: systemData,
			effects: [],
			folder: null,
			sort: 0,
			ownership: {},
			flags: {
				[SYSTEM_NAME]: {
					[ItemFlags.Container]: context.parentId,
				},
			},
			_stats: ItemImporter.getStats(),
		}

		results.push(newItem)

		return results
	}
}

class SpellContainerImporter extends ItemImporter {
	override importItem(
		item: ImportedSpellContainerSystemSource,
		context: ItemImportContext = { parentId: null },
	): ItemSourceGURPS[] {
		const results: ItemSourceGURPS[] = []

		const id = fu.randomID()

		const systemData: SpellContainerSystemSource = {
			slug: "",
			_migration: { version: null, previous: null },
			type: ItemType.SpellContainer,
			name: item.name ?? "",
			reference: item.reference ?? "",
			reference_highlight: item.reference ?? "",
			notes: item.notes ?? "",
			vtt_notes: item.vtt_notes ?? "",
			tags: item.tags ?? [],
			template_picker: ItemImporter.importTemplatePicker(item.template_picker),
			open: item.open ?? false,
		}

		item.children?.reduce((acc, mod) => {
			acc.push(...ItemImportHandlers[item.type].importItem(mod, { parentId: id }))
			return acc
		}, results)

		const newItem: SpellContainerSource = {
			_id: id,
			type: ItemType.SpellContainer,
			name: systemData.name || LocalizeGURPS.translations.TYPES.Item[ItemType.SpellContainer],
			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.Spell}.svg`,
			system: systemData,
			effects: [],
			folder: null,
			sort: 0,
			ownership: {},
			flags: {
				[SYSTEM_NAME]: {
					[ItemFlags.Container]: context.parentId,
				},
			},
			_stats: ItemImporter.getStats(),
		}

		results.push(newItem)

		return results
	}
}

class EquipmentImporter extends ItemImporter {
	override importItem(
		item: ImportedEquipmentSystemSource,
		context: ItemImportContext = { parentId: null },
	): ItemSourceGURPS[] {
		const results: ItemSourceGURPS[] = []

		const id = fu.randomID()

		const systemData: EquipmentSystemSource = {
			slug: "",
			_migration: { version: null, previous: null },
			type: ItemType.Equipment,
			description: item.description ?? "",
			reference: item.reference ?? "",
			reference_highlight: item.reference ?? "",
			notes: item.notes ?? "",
			vtt_notes: item.vtt_notes ?? "",
			tech_level: item.tech_level ?? "",
			legality_class: item.legality_class ?? "",
			tags: item.tags ?? [],
			// modifiers handled separately
			rated_strength: item.rated_strength,
			quantity: item.quantity ?? 0,
			value: item.value ?? 0,
			weight: item.weight ?? "0 lb",
			max_uses: item.max_uses ?? 0,
			uses: item.uses ?? 0,
			prereqs: ItemImporter.importPrereqs(item.prereqs),
			// weapons handled separately
			features: ItemImporter.importFeatures(item.features),
			equipped: item.equipped ?? true,
			ignore_weight_for_skills: item.ignore_weight_for_skills ?? false,
		}

		item.modifiers?.reduce((acc, mod) => {
			acc.push(...ItemImportHandlers[mod.type].importItem(mod, { parentId: id }))
			return acc
		}, results)

		item.weapons?.reduce((acc, weapon) => {
			acc.push(...ItemImportHandlers[weapon.type].importItem(weapon, { parentId: id }))
			return acc
		}, results)

		const newItem: EquipmentSource = {
			_id: id,
			type: ItemType.Equipment,
			name: systemData.description || LocalizeGURPS.translations.TYPES.Item[ItemType.Equipment],
			img: `systems/${SYSTEM_NAME}/assets/icons/equipment.svg`,
			system: systemData,
			effects: [],
			folder: null,
			sort: 0,
			ownership: {},
			flags: {
				[SYSTEM_NAME]: {
					[ItemFlags.Container]: context.parentId,
				},
			},
			_stats: ItemImporter.getStats(),
		}

		results.push(newItem)

		return results
	}
}

class EquipmentContainerImporter extends ItemImporter {
	override importItem(
		item: ImportedEquipmentContainerSystemSource,
		context: ItemImportContext = { parentId: null },
	): ItemSourceGURPS[] {
		const results: ItemSourceGURPS[] = []

		const id = fu.randomID()

		const systemData: EquipmentContainerSystemSource = {
			slug: "",
			_migration: { version: null, previous: null },
			type: ItemType.EquipmentContainer,
			description: item.description ?? "",
			reference: item.reference ?? "",
			reference_highlight: item.reference ?? "",
			notes: item.notes ?? "",
			vtt_notes: item.vtt_notes ?? "",
			tech_level: item.tech_level ?? "",
			legality_class: item.legality_class ?? "",
			tags: item.tags ?? [],
			// modifiers handled separately
			rated_strength: item.rated_strength,
			quantity: item.quantity ?? 0,
			value: item.value ?? 0,
			weight: item.weight ?? "0 lb",
			max_uses: item.max_uses ?? 0,
			uses: item.uses ?? 0,
			prereqs: ItemImporter.importPrereqs(item.prereqs),
			// weapons handled separately
			features: ItemImporter.importFeatures(item.features),
			equipped: item.equipped ?? true,
			ignore_weight_for_skills: item.ignore_weight_for_skills ?? false,
			open: item.open ?? false,
		}

		item.children?.reduce((acc, child) => {
			acc.push(...ItemImportHandlers[child.type].importItem(child, { parentId: id }))
			return acc
		}, results)

		item.modifiers?.reduce((acc, mod) => {
			acc.push(...ItemImportHandlers[mod.type].importItem(mod, { parentId: id }))
			return acc
		}, results)

		item.weapons?.reduce((acc, weapon) => {
			acc.push(...ItemImportHandlers[weapon.type].importItem(weapon, { parentId: id }))
			return acc
		}, results)

		const newItem: EquipmentContainerSource = {
			_id: id,
			type: ItemType.EquipmentContainer,
			name: systemData.description || LocalizeGURPS.translations.TYPES.Item[ItemType.EquipmentContainer],
			img: `systems/${SYSTEM_NAME}/assets/icons/equipment.svg`,
			system: systemData,
			effects: [],
			folder: null,
			sort: 0,
			ownership: {},
			flags: {
				[SYSTEM_NAME]: {
					[ItemFlags.Container]: context.parentId,
				},
			},
			_stats: ItemImporter.getStats(),
		}

		results.push(newItem)

		return results
	}
}

class EquipmentModifierImporter extends ItemImporter {
	override importItem(
		item: ImportedEquipmentModifierSystemSource,
		context: ItemImportContext = { parentId: null },
	): ItemSourceGURPS[] {
		const results: ItemSourceGURPS[] = []

		const id = fu.randomID()

		const systemData: EquipmentModifierSystemSource = {
			slug: "",
			_migration: { version: null, previous: null },
			type: ItemType.EquipmentModifier,
			name: item.name ?? "",
			reference: item.reference ?? "",
			reference_highlight: item.reference ?? "",
			notes: item.notes ?? "",
			vtt_notes: item.vtt_notes ?? "",
			tags: item.tags ?? [],
			cost_type: item.cost_type ?? emcost.Type.Original,
			weight_type: item.weight_type ?? emweight.Type.Original,
			disabled: item.disabled ?? false,
			tech_level: item.tech_level ?? "",
			cost: item.cost ?? "0",
			weight: item.weight ?? "",
			features: ItemImporter.importFeatures(item.features),
		}

		const newItem: EquipmentModifierSource = {
			_id: id,
			type: ItemType.EquipmentModifier,
			name: systemData.name || LocalizeGURPS.translations.TYPES.Item[ItemType.EquipmentModifier],
			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.EquipmentModifier}.svg`,
			system: systemData,
			effects: [],
			folder: null,
			sort: 0,
			ownership: {},
			flags: {
				[SYSTEM_NAME]: {
					[ItemFlags.Container]: context.parentId,
				},
			},
			_stats: ItemImporter.getStats(),
		}

		results.push(newItem)

		return results
	}
}

class EquipmentModifierContainerImporter extends ItemImporter {
	override importItem(
		item: ImportedEquipmentModifierContainerSystemSource,
		context: ItemImportContext = { parentId: null },
	): ItemSourceGURPS[] {
		const results: ItemSourceGURPS[] = []

		const id = fu.randomID()

		const systemData: EquipmentModifierContainerSystemSource = {
			slug: "",
			_migration: { version: null, previous: null },
			type: ItemType.EquipmentModifierContainer,
			name: item.name ?? "",
			reference: item.reference ?? "",
			reference_highlight: item.reference ?? "",
			notes: item.notes ?? "",
			vtt_notes: item.vtt_notes ?? "",
			tags: item.tags ?? [],
		}

		item.children?.reduce((acc, child) => {
			acc.push(...ItemImportHandlers[child.type].importItem(child, { parentId: id }))
			return acc
		}, results)

		const newItem: EquipmentModifierContainerSource = {
			_id: id,
			type: ItemType.EquipmentModifierContainer,
			name: systemData.name || LocalizeGURPS.translations.TYPES.Item[ItemType.EquipmentModifierContainer],
			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.EquipmentModifier}.svg`,
			system: systemData,
			effects: [],
			folder: null,
			sort: 0,
			ownership: {},
			flags: {
				[SYSTEM_NAME]: {
					[ItemFlags.Container]: context.parentId,
				},
			},
			_stats: ItemImporter.getStats(),
		}

		results.push(newItem)

		return results
	}
}

class NoteImporter extends ItemImporter {
	override importItem(
		item: ImportedNoteSystemSource,
		context: ItemImportContext = { parentId: null },
	): ItemSourceGURPS[] {
		const results: ItemSourceGURPS[] = []

		const id = fu.randomID()

		const systemData: NoteSystemSource = {
			slug: "",
			_migration: { version: null, previous: null },
			type: ItemType.Note,
			text: item.text ?? "",
			reference: item.reference ?? "",
			reference_highlight: item.reference ?? "",
		}

		const newItem: NoteSource = {
			_id: id,
			type: ItemType.Note,
			name: systemData.text || LocalizeGURPS.translations.TYPES.Item[ItemType.Note],
			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.Note}.svg`,
			system: systemData,
			effects: [],
			folder: null,
			sort: 0,
			ownership: {},
			flags: {
				[SYSTEM_NAME]: {
					[ItemFlags.Container]: context.parentId,
				},
			},
			_stats: ItemImporter.getStats(),
		}

		results.push(newItem)

		return results
	}
}

class NoteContainerImporter extends ItemImporter {
	override importItem(
		item: ImportedNoteContainerSystemSource,
		context: ItemImportContext = { parentId: null },
	): ItemSourceGURPS[] {
		const results: ItemSourceGURPS[] = []

		const id = fu.randomID()

		const systemData: NoteContainerSystemSource = {
			slug: "",
			_migration: { version: null, previous: null },
			type: ItemType.NoteContainer,
			text: item.text ?? "",
			reference: item.reference ?? "",
			reference_highlight: item.reference ?? "",
			open: item.open ?? false,
		}

		item.children?.reduce((acc, child) => {
			acc.push(...ItemImportHandlers[child.type].importItem(child, { parentId: id }))
			return acc
		}, results)

		const newItem: NoteContainerSource = {
			_id: id,
			type: ItemType.NoteContainer,
			name: systemData.text || LocalizeGURPS.translations.TYPES.Item[ItemType.NoteContainer],
			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.Note}.svg`,
			system: systemData,
			effects: [],
			folder: null,
			sort: 0,
			ownership: {},
			flags: {
				[SYSTEM_NAME]: {
					[ItemFlags.Container]: context.parentId,
				},
			},
			_stats: ItemImporter.getStats(),
		}

		results.push(newItem)

		return results
	}
}

class MeleeWeaponImporter extends ItemImporter {
	override importItem(
		item: ImportedMeleeWeaponSystemSource,
		context: ItemImportContext = { parentId: null },
	): ItemSourceGURPS[] {
		const results: ItemSourceGURPS[] = []

		const id = fu.randomID()

		const systemData: MeleeWeaponSystemSource = {
			slug: "",
			_migration: { version: null, previous: null },
			type: ItemType.MeleeWeapon,
			damage: item.damage,
			strength: item.strength ?? "",
			usage: item.usage ?? "",
			usage_notes: item.usage_notes ?? "",
			reach: item.reach ?? "",
			parry: item.parry ?? "",
			block: item.block ?? "",
			defaults: item.defaults ?? [],
		}

		const newItem: MeleeWeaponSource = {
			_id: id,
			type: ItemType.MeleeWeapon,
			name: systemData.usage || LocalizeGURPS.translations.TYPES.Item[ItemType.MeleeWeapon],
			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.MeleeWeapon}.svg`,
			system: systemData,
			effects: [],
			folder: null,
			sort: 0,
			ownership: {},
			flags: {
				[SYSTEM_NAME]: {
					[ItemFlags.Container]: context.parentId,
				},
			},
			_stats: ItemImporter.getStats(),
		}

		results.push(newItem)

		return results
	}
}

class RangedWeaponImporter extends ItemImporter {
	override importItem(
		item: ImportedRangedWeaponSystemSource,
		context: ItemImportContext = { parentId: null },
	): ItemSourceGURPS[] {
		const results: ItemSourceGURPS[] = []

		const id = fu.randomID()

		const systemData: RangedWeaponSystemSource = {
			slug: "",
			_migration: { version: null, previous: null },
			type: ItemType.RangedWeapon,
			damage: item.damage,
			strength: item.strength ?? "",
			usage: item.usage ?? "",
			usage_notes: item.usage_notes ?? "",
			accuracy: item.accuracy ?? "",
			range: item.range ?? "",
			rate_of_fire: item.rate_of_fire ?? "",
			shots: item.shots ?? "",
			bulk: item.bulk ?? "",
			recoil: item.recoil ?? "",
			defaults: item.defaults ?? [],
		}

		const newItem: RangedWeaponSource = {
			_id: id,
			type: ItemType.RangedWeapon,
			name: systemData.usage || LocalizeGURPS.translations.TYPES.Item[ItemType.RangedWeapon],
			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.RangedWeapon}.svg`,
			system: systemData,
			effects: [],
			folder: null,
			sort: 0,
			ownership: {},
			flags: {
				[SYSTEM_NAME]: {
					[ItemFlags.Container]: context.parentId,
				},
			},
			_stats: ItemImporter.getStats(),
		}

		results.push(newItem)

		return results
	}
}

const ItemImportHandlers: Record<ImportedItemType, ItemImporter> = {
	[ImportedItemType.Trait]: new TraitImporter(),
	[ImportedItemType.TraitContainer]: new TraitContainerImporter(),
	[ImportedItemType.TraitModifier]: new TraitModifierImporter(),
	[ImportedItemType.TraitModifierContainer]: new TraitModifierContainerImporter(),
	[ImportedItemType.Skill]: new SkillImporter(),
	[ImportedItemType.Technique]: new TechniqueImporter(),
	[ImportedItemType.SkillContainer]: new SkillContainerImporter(),
	[ImportedItemType.Spell]: new SpellImporter(),
	[ImportedItemType.RitualMagicSpell]: new RitualMagicSpellImporter(),
	[ImportedItemType.SpellContainer]: new SpellContainerImporter(),
	[ImportedItemType.Equipment]: new EquipmentImporter(),
	[ImportedItemType.EquipmentContainer]: new EquipmentContainerImporter(),
	[ImportedItemType.EquipmentModifier]: new EquipmentModifierImporter(),
	[ImportedItemType.EquipmentModifierContainer]: new EquipmentModifierContainerImporter(),
	[ImportedItemType.Note]: new NoteImporter(),
	[ImportedItemType.NoteContainer]: new NoteContainerImporter(),
	[ImportedItemType.MeleeWeapon]: new MeleeWeaponImporter(),
	[ImportedItemType.RangedWeapon]: new RangedWeaponImporter(),
}
export { ItemImporter }
