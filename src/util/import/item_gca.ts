import { ItemSourceGURPS } from "@item/base/data/index.ts"
import { GCACharacter, GCATrait } from "./data_gca.ts"
import { TraitSource, TraitSystemSource } from "@item/trait/data.ts"
import { ItemFlags, ItemType, SYSTEM_NAME, SkillDifficulty, gid } from "@data"
import { LocalizeGURPS, difficulty, prereq, selfctrl } from "@util"
import { SkillSource, SkillSystemSource } from "@item/skill/data.ts"
import { TechniqueSource, TechniqueSystemSource } from "@item/technique/data.ts"
import { SpellSource, SpellSystemSource } from "@item/spell/data.ts"
import { EquipmentSource, EquipmentSystemSource } from "@item/equipment/data.ts"
import { EquipmentContainerSource, EquipmentContainerSystemSource } from "@item/equipment_container/data.ts"

interface DocumentStats {
	systemId: string
	systemVersion: string
	coreVersion: string
	createdTime: number
	modifiedTime: number
	lastModifiedBy: string
}

class GCAItemImporter {
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

	static importAdvantages(data: GCACharacter): ItemSourceGURPS[] {
		const results: ItemSourceGURPS[] = []
		for (const item of data.traits.advantages.trait ?? []) {
			results.push(this.importTrait(item, data))
		}
		return results
	}

	static importDisadvantages(data: GCACharacter): ItemSourceGURPS[] {
		const results: ItemSourceGURPS[] = []
		for (const item of data.traits.disadvantages.trait ?? []) {
			results.push(this.importTrait(item, data))
		}
		return results
	}

	static importPerks(data: GCACharacter): ItemSourceGURPS[] {
		const results: ItemSourceGURPS[] = []
		for (const item of data.traits.perks.trait ?? []) {
			results.push(this.importTrait(item, data))
		}
		return results
	}

	static importQuirks(data: GCACharacter): ItemSourceGURPS[] {
		const results: ItemSourceGURPS[] = []
		for (const item of data.traits.quirks.trait ?? []) {
			results.push(this.importTrait(item, data))
		}
		return results
	}

	static importLanguages(data: GCACharacter): ItemSourceGURPS[] {
		const results: ItemSourceGURPS[] = []
		for (const item of data.traits.languages.trait ?? []) {
			results.push(this.importTrait(item, data))
		}
		return results
	}

	static importCultures(data: GCACharacter): ItemSourceGURPS[] {
		const results: ItemSourceGURPS[] = []
		for (const item of data.traits.cultures.trait ?? []) {
			results.push(this.importTrait(item, data))
		}
		return results
	}

	private static importTrait(data: GCATrait, _char: GCACharacter): ItemSourceGURPS {
		let level_points = 0
		let base_points = 0
		const levelDifference = data.calcs.cost?.split("/") ?? []
		if (levelDifference.length === 2) {
			level_points = parseInt(levelDifference[1]) - parseInt(levelDifference[0])
		} else {
			base_points = parseInt(levelDifference[0] ?? "0")
		}
		let cr = selfctrl.Roll.NoCR
		if (data.modifiers?.modifier.some(e => e.group === "Self-Control")) {
			const number = data.modifiers.modifier.find(e => e.group === "Self-Control")?.shortname ?? ""
			if (number.startsWith("6")) cr = selfctrl.Roll.CR6
			if (number.startsWith("9")) cr = selfctrl.Roll.CR9
			if (number.startsWith("12")) cr = selfctrl.Roll.CR12
			if (number.startsWith("15")) cr = selfctrl.Roll.CR15
		}

		const id = fu.randomID()

		const systemData: TraitSystemSource = {
			slug: "",
			_migration: { version: null, previous: null },
			type: ItemType.Trait,
			name: data.name,
			reference: data.ref?.page ?? "",
			reference_highlight: "",
			notes: data.ref?.notes ?? "",
			vtt_notes: data.ref?.vttnotes ?? "",
			userdesc: data.ref?.description ?? "",
			tags: [],
			base_points: base_points,
			levels: levelDifference.length > 1 ? data.level ?? 0 : 0,
			points_per_level: level_points,
			prereqs: { type: prereq.Type.List, all: true },
			features: [],
			study: [],
			cr,
			cr_adj: selfctrl.Adjustment.NoCRAdj,
			study_hours_needed: "",
			disabled: false,
			round_down: false,
			can_level: levelDifference.length > 1,
		}

		if (data.nameext?.trim()) systemData.name = `${systemData.name} (${data.nameext})`

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
					[ItemFlags.Container]: null,
				},
			},
			_stats: GCAItemImporter.getStats(),
		}

		return newItem
	}

	static importSkills(data: GCACharacter): ItemSourceGURPS[] {
		const results: ItemSourceGURPS[] = []
		for (const item of data.traits.skills.trait ?? []) {
			if (item.type?.startsWith("Tech")) results.push(this.importTechnique(item))
			else results.push(this.importSkill(item))
		}
		return results
	}

	static importSkill(data: GCATrait): ItemSourceGURPS {
		const id = fu.randomID()

		const systemData: SkillSystemSource = {
			slug: "",
			_migration: { version: null, previous: null },
			type: ItemType.Skill,
			name: data.name,
			reference: data.ref?.page ?? "",
			reference_highlight: "",
			notes: data.ref?.notes ?? "",
			vtt_notes: data.ref?.vttnotes ?? "",
			tags: [],
			specialization: data.nameext ?? "",
			tech_level: data.tl ?? "",
			tech_level_required: data.tl !== "",
			difficulty: data.type?.toLowerCase() as SkillDifficulty,
			points: data.points ?? 0,
			encumbrance_penalty_multiplier: 0,
			defaulted_from: null,
			defaults: [],
			prereqs: { type: prereq.Type.List, all: true },
			// weapons handled separately
			features: [],
			study: [],
			study_hours_needed: "",
		}

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
					[ItemFlags.Container]: null,
				},
			},
			_stats: GCAItemImporter.getStats(),
		}

		return newItem
	}

	static importTechnique(data: GCATrait): ItemSourceGURPS {
		const id = fu.randomID()

		const systemData: TechniqueSystemSource = {
			slug: "",
			_migration: { version: null, previous: null },
			type: ItemType.Technique,
			name: data.name,
			reference: data.ref?.page ?? "",
			reference_highlight: "",
			notes: data.ref?.notes ?? "",
			vtt_notes: data.ref?.vttnotes ?? "",
			tags: [],
			tech_level: data.tl ?? "",
			difficulty: data.type?.toLowerCase().split("/")[1] as difficulty.Level.Average | difficulty.Level.Hard,
			points: data.points ?? 0,
			defaults: [],
			default: {
				type: gid.Skill,
				name: data.ref?.default?.match(/SK:([A-z -]+)::level/)?.[1],
				modifier: parseInt(data.ref!.default!.replace(/SK:.*::level/, "")),
			},
			limited: !!data.calcs.upto && data.calcs.upto !== "",
			limit: parseInt(data.calcs.upto?.replace("prereq", "") || "0"),
			prereqs: { type: prereq.Type.List, all: true },
			// weapons handled separately
			features: [],
			study: [],
			study_hours_needed: "",
		}

		const newItem: TechniqueSource = {
			_id: id,
			type: ItemType.Technique,
			name: systemData.name || LocalizeGURPS.translations.TYPES.Item[ItemType.Skill],
			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.Skill}.svg`,
			system: systemData,
			effects: [],
			folder: null,
			sort: 0,
			ownership: {},
			flags: {
				[SYSTEM_NAME]: {
					[ItemFlags.Container]: null,
				},
			},
			_stats: GCAItemImporter.getStats(),
		}

		return newItem
	}

	static importSpells(data: GCACharacter): ItemSourceGURPS[] {
		const results: ItemSourceGURPS[] = []
		for (const item of data.traits.spells.trait ?? []) {
			results.push(this.importSpell(item))
		}
		return results
	}

	static importSpell(data: GCATrait): ItemSourceGURPS {
		const id = fu.randomID()

		const systemData: SpellSystemSource = {
			slug: "",
			_migration: { version: null, previous: null },
			type: ItemType.Spell,
			name: data.name,
			reference: data.ref?.page ?? "",
			reference_highlight: "",
			notes: data.ref?.notes ?? "",
			vtt_notes: data.ref?.vttnotes ?? "",
			tags: [],
			tech_level: data.tl ?? "",
			tech_level_required: data.tl !== "",
			difficulty: data.type?.toLowerCase() as SkillDifficulty,
			college: [data.nameext ?? ""],
			power_source: "Arcane",
			spell_class: data.ref?.class ?? "",
			resist: "",
			casting_cost: data.ref?.castingcost?.split("/")[0] ?? "",
			maintenance_cost: data.ref?.castingcost?.split("/")[1] ?? "",
			casting_time: data.ref?.time ?? "",
			duration: data.ref?.duration ?? "",
			points: data.points ?? 0,
			defaults: [],
			prereqs: { type: prereq.Type.List, all: true },
			// weapons handled separately
			features: [],
			study: [],
			study_hours_needed: "",
		}

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
					[ItemFlags.Container]: null,
				},
			},
			_stats: GCAItemImporter.getStats(),
		}

		return newItem
	}

	static importEquipments(data: GCACharacter): ItemSourceGURPS[] {
		const results: ItemSourceGURPS[] = []
		for (const item of data.traits.equipment.trait ?? []) {
			if (item.ref?.isparent) results.push(this.importEquipmentContainer(item))
			else results.push(this.importEquipment(item))
		}
		return results
	}

	static importEquipment(data: GCATrait): ItemSourceGURPS {
		const id = fu.randomID()

		const systemData: EquipmentSystemSource = {
			slug: "",
			_migration: { version: null, previous: null },
			type: ItemType.Equipment,
			description: data.name,
			reference: data.ref?.page ?? "",
			reference_highlight: "",
			notes: data.ref?.notes ?? "",
			vtt_notes: data.ref?.vttnotes ?? "",
			tags: [],
			tech_level: data.tl ?? "",
			legality_class: data.ref?.lc ?? "",
			quantity: data.count ?? 1,
			value: data.cost ?? 1,
			weight: `${data.weight ?? 0} lb`,
			max_uses: 0,
			uses: 0,
			prereqs: { type: prereq.Type.List, all: true },
			// weapons handled separately
			features: [],
			equipped: true,
			ignore_weight_for_skills: false,
		}

		const newItem: EquipmentSource = {
			_id: id,
			type: ItemType.Equipment,
			name: systemData.description || LocalizeGURPS.translations.TYPES.Item[ItemType.Equipment],
			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.Equipment}.svg`,
			system: systemData,
			effects: [],
			folder: null,
			sort: 0,
			ownership: {},
			flags: {
				[SYSTEM_NAME]: {
					[ItemFlags.Container]: null,
				},
			},
			_stats: GCAItemImporter.getStats(),
		}

		return newItem
	}

	static importEquipmentContainer(data: GCATrait): ItemSourceGURPS {
		const id = fu.randomID()

		const systemData: EquipmentContainerSystemSource = {
			slug: "",
			_migration: { version: null, previous: null },
			type: ItemType.EquipmentContainer,
			description: data.name,
			reference: data.ref?.page ?? "",
			reference_highlight: "",
			notes: data.ref?.notes ?? "",
			vtt_notes: data.ref?.vttnotes ?? "",
			tags: [],
			tech_level: data.tl ?? "",
			legality_class: data.ref?.lc ?? "",
			quantity: data.count ?? 1,
			value: data.cost ?? 1,
			weight: `${data.weight ?? 0} lb`,
			max_uses: 0,
			uses: 0,
			prereqs: { type: prereq.Type.List, all: true },
			// weapons handled separately
			features: [],
			equipped: true,
			ignore_weight_for_skills: false,
			open: true,
		}

		const newItem: EquipmentContainerSource = {
			_id: id,
			type: ItemType.EquipmentContainer,
			name: systemData.description || LocalizeGURPS.translations.TYPES.Item[ItemType.EquipmentContainer],
			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.Equipment}.svg`,
			system: systemData,
			effects: [],
			folder: null,
			sort: 0,
			ownership: {},
			flags: {
				[SYSTEM_NAME]: {
					[ItemFlags.Container]: null,
				},
			},
			_stats: GCAItemImporter.getStats(),
		}

		return newItem
	}
}

export { GCAItemImporter }
