import {
	AttributeDef,
	AttributeDefObj,
	BodyGURPS,
	BodyObj,
	MoveTypeDef,
	MoveTypeDefObj,
	ResourceTrackerDef,
	ResourceTrackerDefObj,
} from "@system"
import { BodyOwner, LengthUnits, TooltipGURPS, WeightUnits, display, paper, progression } from "@util"
import { ActorType, SETTINGS, SYSTEM_NAME } from "./constants.ts"
import { ActorGURPS } from "@actor"

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
	body_type: BodyObj
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
	body_type: BodyGURPS<BodyOwner>
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

export function defaultSheetSettings(): SheetSettings {
	const dummyBodyOwner: BodyOwner = {
		hitLocationTable: new BodyGURPS(),
		addDRBonusesFor: (_locationID: string, _tooltip: TooltipGURPS | null, drMap: Map<string, number>) => drMap,
	}
	const bodyObj: BodyObj = {
		name: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.name`),
		roll: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.roll`),
		locations: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`),
	}
	const body = BodyGURPS.fromObject(bodyObj, dummyBodyOwner)
	return {
		...game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.settings`),
		body_type: body,
		attributes: game.settings
			.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`)
			.map(e => new AttributeDef(e)),
		resource_trackers: game.settings
			.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`)
			.map(e => new ResourceTrackerDef(e)),
		move_types: game.settings
			.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`)
			.map(e => new MoveTypeDef(e)),
	}
}

export function sheetSettingsFor(actor: ActorGURPS | null): SheetSettings {
	if (!actor || !actor.isOfType(ActorType.Character)) {
		return defaultSheetSettings()
	}
	return {
		...actor.system.settings,
		body_type: actor.hitLocationTable,
		resource_trackers: actor.system.settings.resource_trackers.map(e => new ResourceTrackerDef(e)),
		attributes: actor.system.settings.attributes.map(e => new AttributeDef(e)),
		move_types: actor.system.settings.move_types.map(e => new MoveTypeDef(e)),
	}
}
