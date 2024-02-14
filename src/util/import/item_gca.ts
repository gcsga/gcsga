import { ItemSourceGURPS } from "@item/base/data/index.ts"
import { GCACharacter, GCATrait } from "./data_gca.ts"
import { TraitSource, TraitSystemSource } from "@item/trait/data.ts"
import { ItemFlags, ItemType, SYSTEM_NAME } from "@data"
import { LocalizeGURPS, prereq, selfctrl } from "@util"

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

	static importSkills(_data: GCACharacter): ItemSourceGURPS[] {
		return []
	}

	static importSpells(_data: GCACharacter): ItemSourceGURPS[] {
		return []
	}

	static importEquipment(_data: GCACharacter): ItemSourceGURPS[] {
		return []
	}
}

export { GCAItemImporter }
