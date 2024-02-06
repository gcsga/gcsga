import { HitLocationTable, HitLocationTableData } from "@actor/character/hit_location.ts"
import { CharacterResolver, LengthUnits, WeightUnits } from "@util"
import { display } from "@util/enum/display.ts"
import { paper } from "@util/enum/paper.ts"
import { progression } from "@util/enum/progression.ts"
import { SETTINGS, SYSTEM_NAME } from "./constants.ts"
import { ActorGURPS, CharacterGURPS } from "@actor"
import { AttributeDef } from "@sytem/attribute/attribute_def.ts"
import { ResourceTrackerDef } from "@sytem/resource_tracker/tracker_def.ts"
import { MoveTypeDef } from "@sytem/move_type/move_type_def.ts"
import { AttributeDefObj } from "@sytem/attribute/data.ts"
import { ResourceTrackerDefObj } from "@sytem/resource_tracker/data.ts"
import { MoveTypeDefObj } from "@sytem/move_type/data.ts"

export interface PageSettings {
	paper_size: paper.Size
	orientation: paper.Orientation
	top_margin: paper.Length
	left_margin: paper.Length
	bottom_margin: paper.Length
	right_margin: paper.Length
}

export enum BlockLayoutKey {
	BlockLayoutReactionsKey = "reactions",
	BlockLayoutConditionalModifiersKey = "conditional_modifiers",
	BlockLayoutMeleeKey = "melee",
	BlockLayoutRangedKey = "ranged",
	BlockLayoutTraitsKey = "traits",
	BlockLayoutSkillsKey = "skills",
	BlockLayoutSpellsKey = "spells",
	BlockLayoutEquipmentKey = "equipment",
	BlockLayoutOtherEquipmentKey = "other_equipment",
	BlockLayoutNotesKey = "notes",
}

export type BlockLayout = BlockLayoutKey[]

export interface SheetSettingsObj {
	page: PageSettings
	block_layout: BlockLayout
	attributes: AttributeDefObj[]
	resource_trackers: ResourceTrackerDefObj[]
	move_types: MoveTypeDefObj[]
	body_type: HitLocationTableData
	damage_progression: progression.Option
	default_length_units: LengthUnits
	default_weight_units: WeightUnits
	user_description_display: display.Option
	modifiers_display: display.Option
	notes_display: display.Option
	skill_level_adj_display: display.Option
	use_multiplicative_modifiers: boolean
	use_modifying_dice_plus_adds: boolean
	use_half_stat_defaults: boolean
	show_trait_modifier_adj: boolean
	show_equipment_modifier_adj: boolean
	show_spell_adj: boolean
	use_title_in_footer: boolean
	exclude_unspent_points_from_total: boolean
}

export interface SheetSettings {
	page: PageSettings
	block_layout: BlockLayout
	attributes: AttributeDef[]
	resource_trackers: ResourceTrackerDef[]
	move_types: MoveTypeDef[]
	body_type: HitLocationTable
	damage_progression: progression.Option
	default_length_units: LengthUnits
	default_weight_units: WeightUnits
	user_description_display: display.Option
	modifiers_display: display.Option
	notes_display: display.Option
	skill_level_adj_display: display.Option
	use_multiplicative_modifiers: boolean
	use_modifying_dice_plus_adds: boolean
	use_half_stat_defaults: boolean
	show_trait_modifier_adj: boolean
	show_equipment_modifier_adj: boolean
	show_spell_adj: boolean
	use_title_in_footer: boolean
	exclude_unspent_points_from_total: boolean
}

export function defaultSheetSettings(): SheetSettingsObj {
	return {
		...game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.settings`),
		body_type: {
			name: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.name`),
			roll: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.roll`),
			locations: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`),
		},
		attributes: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`),
		resource_trackers: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`),
		move_types: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`),
	}
}

export function sheetSettingsFor(actor: ActorGURPS | CharacterResolver | null): SheetSettings | SheetSettingsObj {
	if (!actor || !(actor instanceof CharacterGURPS)) return defaultSheetSettings()
	return actor.settings
}
