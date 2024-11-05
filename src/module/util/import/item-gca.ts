// import { GCACharacter, GCATrait } from "./data-gca.ts"
// import { TraitSource, TraitSystemSource } from "@item/trait/data.ts"
// import { ItemType, NumericCompareType, SYSTEM_NAME, SkillDifficulty, gid } from "@data"
// import {  container, difficulty, picker, prereq, selfctrl, study } from "@util"
// import { SkillSource, SkillSystemSource } from "@item/skill/data.ts"
// import { TechniqueSource, TechniqueSystemSource } from "@item/technique/data.ts"
// import { SpellSource, SpellSystemSource } from "@item/spell/data.ts"
// import { EquipmentSource, EquipmentSystemSource } from "@item/equipment/data.ts"
// import { EquipmentContainerSource, EquipmentContainerSystemSource } from "@item/equipment-container/data.ts"
// import { TraitContainerSource, TraitContainerSystemSource } from "@item/trait-container/data.ts"
// import { ItemSourceGURPS } from "@item/data/index.ts"
// import { DocumentStatsSchema } from "types/foundry/common/data/fields.js"
// import { TID } from "../tid.ts"
//
// interface ItemImportContext {
// 	char: GCACharacter
// 	parentId: string | null
// }
//
// class GCAItemImporter {
// 	static getStats(): SourceFromSchema<DocumentStatsSchema> {
// 		const date = Date.now()
// 		return {
// 			systemId: SYSTEM_NAME,
// 			systemVersion: game.system.version,
// 			coreVersion: game.version,
// 			createdTime: date,
// 			modifiedTime: date,
// 			lastModifiedBy: game.user.id,
// 			compendiumSource: null,
// 			duplicateSource: null,
// 		}
// 	}
//
// 	static importAdvantages(data: GCACharacter): ItemSourceGURPS[] {
// 		const results: ItemSourceGURPS[] = []
// 		for (const item of data.traits.advantages.trait ?? []) {
// 			if (item.ref?.owned === "yes") continue
// 			results.push(this.importTrait(item, { char: data, parentId: null }))
// 		}
// 		return results
// 	}
//
// 	static importDisadvantages(data: GCACharacter): ItemSourceGURPS[] {
// 		const results: ItemSourceGURPS[] = []
// 		for (const item of data.traits.disadvantages.trait ?? []) {
// 			results.push(this.importTrait(item, { char: data, parentId: null }))
// 		}
// 		return results
// 	}
//
// 	static importPerks(data: GCACharacter): ItemSourceGURPS[] {
// 		const results: ItemSourceGURPS[] = []
// 		for (const item of data.traits.perks.trait ?? []) {
// 			results.push(this.importTrait(item, { char: data, parentId: null }))
// 		}
// 		return results
// 	}
//
// 	static importQuirks(data: GCACharacter): ItemSourceGURPS[] {
// 		const results: ItemSourceGURPS[] = []
// 		for (const item of data.traits.quirks.trait ?? []) {
// 			results.push(this.importTrait(item, { char: data, parentId: null }))
// 		}
// 		return results
// 	}
//
// 	static importLanguages(data: GCACharacter): ItemSourceGURPS[] {
// 		const results: ItemSourceGURPS[] = []
// 		for (const item of data.traits.languages.trait ?? []) {
// 			results.push(this.importTrait(item, { char: data, parentId: null }))
// 		}
// 		return results
// 	}
//
// 	static importCultures(data: GCACharacter): ItemSourceGURPS[] {
// 		const results: ItemSourceGURPS[] = []
// 		for (const item of data.traits.cultures.trait ?? []) {
// 			results.push(this.importTrait(item, { char: data, parentId: null }))
// 		}
// 		return results
// 	}
//
// 	static importSkills(data: GCACharacter): ItemSourceGURPS[] {
// 		const results: ItemSourceGURPS[] = []
// 		for (const item of data.traits.skills.trait ?? []) {
// 			if (item.type?.startsWith("Tech")) results.push(this.importTechnique(item, { char: data, parentId: null }))
// 			else results.push(this.importSkill(item, { char: data, parentId: null }))
// 		}
// 		return results
// 	}
//
// 	static importEquipments(data: GCACharacter): ItemSourceGURPS[] {
// 		const results: ItemSourceGURPS[] = []
// 		for (const item of data.traits.equipment.trait ?? []) {
// 			if (item.ref?.isparent) results.push(this.importEquipmentContainer(item, { char: data, parentId: null }))
// 			else results.push(this.importEquipment(item, { char: data, parentId: null }))
// 		}
// 		return results
// 	}
//
// 	static importSpells(data: GCACharacter): ItemSourceGURPS[] {
// 		const results: ItemSourceGURPS[] = []
// 		for (const item of data.traits.spells.trait ?? []) {
// 			results.push(this.importSpell(item, { char: data, parentId: null }))
// 		}
// 		return results
// 	}
//
// 	static importTemplates(data: GCACharacter): ItemSourceGURPS[] {
// 		const results: ItemSourceGURPS[] = []
// 		for (const item of data.traits.templates.trait ?? []) {
// 			results.push(...this.importTemplate(item, { char: data, parentId: null }))
// 		}
// 		return results
// 	}
//
// 	private static importTrait(data: GCATrait, options: ItemImportContext): ItemSourceGURPS {
// 		let level_points = 0
// 		let base_points = 0
// 		const levelDifference = data.calcs.cost?.split("/") ?? []
// 		if (levelDifference.length === 2) {
// 			level_points = parseInt(levelDifference[1]) - parseInt(levelDifference[0])
// 		} else {
// 			base_points = parseInt(levelDifference[0] ?? "0")
// 		}
// 		let cr = selfctrl.Roll.NoCR
// 		if (data.modifiers?.modifier.some(e => e.group === "Self-Control")) {
// 			const number = data.modifiers.modifier.find(e => e.group === "Self-Control")?.shortname ?? ""
// 			if (number.startsWith("6")) cr = selfctrl.Roll.CR6
// 			if (number.startsWith("9")) cr = selfctrl.Roll.CR9
// 			if (number.startsWith("12")) cr = selfctrl.Roll.CR12
// 			if (number.startsWith("15")) cr = selfctrl.Roll.CR15
// 		}
//
// 		const id = fu.randomID()
//
// 		const systemData: TraitSystemSource = {
// 			container: options.parentId,
// 			id: TID.fromDocumentType(ItemType.Trait),
// 			slug: "",
// 			_migration: { version: null, previous: null },
// 			type: ItemType.Trait,
// 			name: data.name,
// 			reference: data.ref?.page ?? "",
// 			reference_highlight: "",
// 			notes: data.ref?.notes ?? "",
// 			vtt_notes: data.ref?.vttnotes ?? "",
// 			userdesc: data.ref?.description ?? "",
// 			tags: data.cat?.split(",").map(e => e.trim()) ?? [],
// 			base_points: base_points,
// 			levels: levelDifference.length > 1 ? (data.level ?? 0) : 0,
// 			points_per_level: level_points,
// 			prereqs: [
// 				{
// 					id: "root",
// 					type: prereq.Type.List,
// 					all: true,
// 					when_tl: { compare: NumericCompareType.AnyNumber, qualifier: 0 },
// 					prereqs: [],
// 				},
// 			],
// 			features: [],
// 			study: [],
// 			cr,
// 			cr_adj: selfctrl.Adjustment.NoCRAdj,
// 			study_hours_needed: study.Level.Standard,
// 			disabled: false,
// 			round_down: false,
// 			can_level: levelDifference.length > 1,
// 			replacements: {},
// 		}
//
// 		if (data.nameext?.trim()) systemData.name = `${systemData.name} (${data.nameext})`
//
// 		const newItem: TraitSource = {
// 			_id: id,
// 			type: ItemType.Trait,
// 			name: systemData.name || translations.TYPES.Item[ItemType.Trait],
// 			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.Trait}.svg`,
// 			system: systemData,
// 			effects: [],
// 			folder: null,
// 			sort: 0,
// 			ownership: {},
// 			flags: {},
// 			_stats: GCAItemImporter.getStats(),
// 		}
//
// 		return newItem
// 	}
//
// 	static importSkill(data: GCATrait, options: ItemImportContext): ItemSourceGURPS {
// 		const id = fu.randomID()
//
// 		const systemData: SkillSystemSource = {
// 			container: options.parentId,
// 			id: TID.fromDocumentType(ItemType.Skill),
// 			slug: "",
// 			_migration: { version: null, previous: null },
// 			type: ItemType.Skill,
// 			name: data.name,
// 			reference: data.ref?.page ?? "",
// 			reference_highlight: "",
// 			notes: data.ref?.notes ?? "",
// 			vtt_notes: data.ref?.vttnotes ?? "",
// 			tags: data.cat?.split(",").map(e => e.trim()) ?? [],
// 			specialization: data.nameext ?? "",
// 			tech_level: data.tl ?? "",
// 			tech_level_required: !!data.tl && data.tl !== "",
// 			difficulty: data.type?.toLowerCase() as SkillDifficulty,
// 			points: data.points ?? 0,
// 			encumbrance_penalty_multiplier: 0,
// 			defaulted_from: null,
// 			defaults: [],
// 			prereqs: [
// 				{
// 					id: "root",
// 					type: prereq.Type.List,
// 					all: true,
// 					when_tl: { compare: NumericCompareType.AnyNumber, qualifier: 0 },
// 					prereqs: [],
// 				},
// 			],
// 			// weapons handled separately
// 			features: [],
// 			study: [],
// 			study_hours_needed: study.Level.Standard,
// 			replacements: {},
// 		}
//
// 		const newItem: SkillSource = {
// 			_id: id,
// 			type: ItemType.Skill,
// 			name: systemData.name || translations.TYPES.Item[ItemType.Skill],
// 			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.Skill}.svg`,
// 			system: systemData,
// 			effects: [],
// 			folder: null,
// 			sort: 0,
// 			ownership: {},
// 			flags: {},
// 			_stats: GCAItemImporter.getStats(),
// 		}
//
// 		return newItem
// 	}
//
// 	static importTechnique(data: GCATrait, options: ItemImportContext): ItemSourceGURPS {
// 		const id = fu.randomID()
//
// 		const systemData: TechniqueSystemSource = {
// 			container: options.parentId,
// 			id: TID.fromDocumentType(ItemType.Technique),
// 			slug: "",
// 			_migration: { version: null, previous: null },
// 			type: ItemType.Technique,
// 			name: data.name,
// 			reference: data.ref?.page ?? "",
// 			reference_highlight: "",
// 			notes: data.ref?.notes ?? "",
// 			vtt_notes: data.ref?.vttnotes ?? "",
// 			tags: data.cat?.split(",").map(e => e.trim()) ?? [],
// 			tech_level: data.tl ?? "",
// 			tech_level_required: data.tl !== "",
// 			difficulty: data.type?.toLowerCase().split("/")[1] as difficulty.Level.Average | difficulty.Level.Hard,
// 			points: data.points ?? 0,
// 			default: {
// 				type: gid.Skill,
// 				name: data.ref?.default?.match(/SK:([A-z -]+)::level/)?.[1] ?? null,
// 				specialization: null,
// 				modifier: parseInt(data.ref!.default!.replace(/SK:.*::level/, "")),
// 				level: 0,
// 				adjusted_level: 0,
// 				points: 0,
// 			},
// 			// TODO: change
// 			defaults: [],
// 			limited: !!data.calcs.upto && data.calcs.upto !== "",
// 			limit: parseInt(data.calcs.upto?.replace("prereq", "") || "0"),
// 			prereqs: [
// 				{
// 					id: "root",
// 					type: prereq.Type.List,
// 					all: true,
// 					when_tl: { compare: NumericCompareType.AnyNumber, qualifier: 0 },
// 					prereqs: [],
// 				},
// 			],
// 			// weapons handled separately
// 			features: [],
// 			study: [],
// 			study_hours_needed: study.Level.Standard,
// 			replacements: {},
// 		}
//
// 		const newItem: TechniqueSource = {
// 			_id: id,
// 			type: ItemType.Technique,
// 			name: systemData.name || translations.TYPES.Item[ItemType.Skill],
// 			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.Skill}.svg`,
// 			system: systemData,
// 			effects: [],
// 			folder: null,
// 			sort: 0,
// 			ownership: {},
// 			flags: {},
// 			_stats: GCAItemImporter.getStats(),
// 		}
//
// 		return newItem
// 	}
//
// 	static importSpell(data: GCATrait, options: ItemImportContext): ItemSourceGURPS {
// 		const id = fu.randomID()
//
// 		const systemData: SpellSystemSource = {
// 			container: options.parentId,
// 			id: TID.fromDocumentType(ItemType.Spell),
// 			slug: "",
// 			_migration: { version: null, previous: null },
// 			type: ItemType.Spell,
// 			name: data.name,
// 			reference: data.ref?.page ?? "",
// 			reference_highlight: "",
// 			notes: data.ref?.notes ?? "",
// 			vtt_notes: data.ref?.vttnotes ?? "",
// 			tags: data.cat?.split(",").map(e => e.trim()) ?? [],
// 			tech_level: data.tl ?? "",
// 			tech_level_required: data.tl !== "",
// 			difficulty: data.type?.toLowerCase() as SkillDifficulty,
// 			college: [data.nameext ?? ""],
// 			power_source: "Arcane",
// 			spell_class: data.ref?.class ?? "",
// 			resist: "",
// 			casting_cost: data.ref?.castingcost?.split("/")[0] ?? "",
// 			maintenance_cost: data.ref?.castingcost?.split("/")[1] ?? "",
// 			casting_time: data.ref?.time ?? "",
// 			duration: data.ref?.duration ?? "",
// 			points: data.points ?? 0,
// 			prereqs: [
// 				{
// 					id: "root",
// 					type: prereq.Type.List,
// 					all: true,
// 					when_tl: { compare: NumericCompareType.AnyNumber, qualifier: 0 },
// 					prereqs: [],
// 				},
// 			],
// 			// weapons handled separately
// 			study: [],
// 			study_hours_needed: study.Level.Standard,
// 			replacements: {},
// 		}
//
// 		const newItem: SpellSource = {
// 			_id: id,
// 			type: ItemType.Spell,
// 			name: systemData.name || translations.TYPES.Item[ItemType.Spell],
// 			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.Spell}.svg`,
// 			system: systemData,
// 			effects: [],
// 			folder: null,
// 			sort: 0,
// 			ownership: {},
// 			flags: {},
// 			_stats: GCAItemImporter.getStats(),
// 		}
//
// 		return newItem
// 	}
//
// 	static importEquipment(data: GCATrait, options: ItemImportContext): ItemSourceGURPS {
// 		const id = fu.randomID()
//
// 		const systemData: EquipmentSystemSource = {
// 			container: options.parentId,
// 			id: TID.fromDocumentType(ItemType.Equipment),
// 			slug: "",
// 			_migration: { version: null, previous: null },
// 			type: ItemType.Equipment,
// 			description: data.name,
// 			reference: data.ref?.page ?? "",
// 			reference_highlight: "",
// 			notes: data.ref?.notes ?? "",
// 			vtt_notes: data.ref?.vttnotes ?? "",
// 			tags: data.cat?.split(",").map(e => e.trim()) ?? [],
// 			tech_level: data.tl ?? "",
// 			legality_class: data.ref?.lc ?? "",
// 			quantity: data.count ?? 1,
// 			value: data.cost ?? 1,
// 			weight: `${data.weight ?? 0} lb`,
// 			max_uses: 0,
// 			uses: 0,
// 			prereqs: [
// 				{
// 					id: "root",
// 					type: prereq.Type.List,
// 					all: true,
// 					when_tl: { compare: NumericCompareType.AnyNumber, qualifier: 0 },
// 					prereqs: [],
// 				},
// 			],
// 			rated_strength: null,
// 			// weapons handled separately
// 			features: [],
// 			equipped: true,
// 			ignore_weight_for_skills: false,
// 			replacements: {},
// 		}
//
// 		const newItem: EquipmentSource = {
// 			_id: id,
// 			type: ItemType.Equipment,
// 			name: systemData.description || translations.TYPES.Item[ItemType.Equipment],
// 			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.Equipment}.svg`,
// 			system: systemData,
// 			effects: [],
// 			folder: null,
// 			sort: 0,
// 			ownership: {},
// 			flags: {},
// 			_stats: GCAItemImporter.getStats(),
// 		}
//
// 		return newItem
// 	}
//
// 	static importEquipmentContainer(data: GCATrait, options: ItemImportContext): ItemSourceGURPS {
// 		const id = fu.randomID()
//
// 		const systemData: EquipmentContainerSystemSource = {
// 			container: options.parentId,
// 			id: TID.fromDocumentType(ItemType.EquipmentContainer),
// 			slug: "",
// 			_migration: { version: null, previous: null },
// 			type: ItemType.EquipmentContainer,
// 			description: data.name,
// 			reference: data.ref?.page ?? "",
// 			reference_highlight: "",
// 			notes: data.ref?.notes ?? "",
// 			vtt_notes: data.ref?.vttnotes ?? "",
// 			tags: data.cat?.split(",").map(e => e.trim()) ?? [],
// 			tech_level: data.tl ?? "",
// 			legality_class: data.ref?.lc ?? "",
// 			quantity: data.count ?? 1,
// 			value: data.cost ?? 1,
// 			weight: `${data.weight ?? 0} lb`,
// 			max_uses: 0,
// 			uses: 0,
// 			prereqs: [
// 				{
// 					id: "root",
// 					type: prereq.Type.List,
// 					all: true,
// 					when_tl: { compare: NumericCompareType.AnyNumber, qualifier: 0 },
// 					prereqs: [],
// 				},
// 			],
// 			rated_strength: null,
// 			// weapons handled separately
// 			features: [],
// 			equipped: true,
// 			ignore_weight_for_skills: false,
// 			open: true,
// 			replacements: {},
// 		}
//
// 		const newItem: EquipmentContainerSource = {
// 			_id: id,
// 			type: ItemType.EquipmentContainer,
// 			name: systemData.description || translations.TYPES.Item[ItemType.EquipmentContainer],
// 			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.Equipment}.svg`,
// 			system: systemData,
// 			effects: [],
// 			folder: null,
// 			sort: 0,
// 			ownership: {},
// 			flags: {},
// 			_stats: GCAItemImporter.getStats(),
// 		}
//
// 		return newItem
// 	}
//
// 	static importTemplate(data: GCATrait, options: ItemImportContext): ItemSourceGURPS[] {
// 		const results: ItemSourceGURPS[] = []
//
// 		const id = fu.randomID()
//
// 		let cr = selfctrl.Roll.NoCR
// 		if (data.modifiers?.modifier.some(e => e.group === "Self-Control")) {
// 			const number = data.modifiers.modifier.find(e => e.group === "Self-Control")?.shortname ?? ""
// 			if (number.startsWith("6")) cr = selfctrl.Roll.CR6
// 			if (number.startsWith("9")) cr = selfctrl.Roll.CR9
// 			if (number.startsWith("12")) cr = selfctrl.Roll.CR12
// 			if (number.startsWith("15")) cr = selfctrl.Roll.CR15
// 		}
//
// 		let container_type = container.Type.Group
// 		if (data.cat?.includes("Racial Templates")) container_type = container.Type.Ancestry
// 		else if (data.cat?.includes("Meta-Traits")) container_type = container.Type.MetaTrait
//
// 		const systemData: TraitContainerSystemSource = {
// 			container: options.parentId,
// 			id: TID.fromDocumentType(ItemType.TraitContainer),
// 			slug: "",
// 			_migration: { version: null, previous: null },
// 			type: ItemType.TraitContainer,
// 			name: data.name,
// 			reference: data.ref?.page ?? "",
// 			reference_highlight: "",
// 			notes: data.ref?.notes ?? "",
// 			vtt_notes: data.ref?.vttnotes ?? "",
// 			userdesc: data.ref?.description ?? "",
// 			tags: data.cat?.split(",").map(e => e.trim()) ?? [],
// 			cr,
// 			cr_adj: selfctrl.Adjustment.NoCRAdj,
// 			disabled: false,
// 			ancestry: "",
// 			template_picker: {
// 				type: picker.Type.NotApplicable,
// 				qualifier: { compare: NumericCompareType.AnyNumber, qualifier: null },
// 			},
// 			prereqs: [
// 				{
// 					id: "root",
// 					type: prereq.Type.List,
// 					all: true,
// 					when_tl: { compare: NumericCompareType.AnyNumber, qualifier: 0 },
// 					prereqs: [],
// 				},
// 			],
// 			open: true,
// 			container_type,
// 			replacements: {},
// 		}
//
// 		const newItem: TraitContainerSource = {
// 			_id: id,
// 			type: ItemType.TraitContainer,
// 			name: systemData.name || translations.TYPES.Item[ItemType.TraitContainer],
// 			img: `systems/${SYSTEM_NAME}/assets/icons/${ItemType.Trait}.svg`,
// 			system: systemData,
// 			effects: [],
// 			folder: null,
// 			sort: 0,
// 			ownership: {},
// 			flags: {},
// 			_stats: GCAItemImporter.getStats(),
// 		}
//
// 		results.push(newItem)
//
// 		for (const pkid of data.ref?.pkids?.split(",")?.map(e => e.trim()) ?? []) {
// 			const trait = options.char.traits.advantages.trait?.find(e => e._idkey === parseInt(pkid))
// 			if (!trait) continue
// 			results.push(this.importTrait(trait, { char: options.char, parentId: id }))
// 		}
// 		return results
// 	}
// }
//
// export { GCAItemImporter }
