import {
	AttributeDef,
	AttributeDefSchema,
	BodyGURPS,
	BodySchema,
	MoveTypeDef,
	MoveTypeDefSchema,
	ResourceTrackerDef,
	ResourceTrackerDefSchema,
} from "@system"
import { LengthUnits, TooltipGURPS, WeightUnits, display, paper, progression } from "@util"
import { ActorType, SETTINGS, SYSTEM_NAME } from "./constants.ts"
import { ActorGURPS } from "@actor"
import { BodyOwner } from "@module/util/resolvers.ts"
import fields = foundry.data.fields

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

type SheetSettingsSchema = {
	page: fields.ObjectField<PageSettings>
	block_layout: fields.ObjectField<BlockLayout>
	attributes: fields.ArrayField<fields.SchemaField<AttributeDefSchema>>
	resource_trackers: fields.ArrayField<fields.SchemaField<ResourceTrackerDefSchema>>
	move_types: fields.ArrayField<fields.SchemaField<MoveTypeDefSchema>>
	body_type: fields.SchemaField<BodySchema>
	damage_progression: fields.StringField<progression.Option>
	default_length_units: fields.StringField<LengthUnits>
	default_weight_units: fields.StringField<WeightUnits>
	user_description_display: fields.StringField<display.Option>
	modifiers_display: fields.StringField<display.Option>
	notes_display: fields.StringField<display.Option>
	skill_level_adj_display: fields.StringField<display.Option>
	use_multiplicative_modifiers: fields.BooleanField
	use_modifying_dice_plus_adds: fields.BooleanField
	use_half_stat_defaults: fields.BooleanField
	show_trait_modifier_adj: fields.BooleanField
	show_equipment_modifier_adj: fields.BooleanField
	show_spell_adj: fields.BooleanField
	use_title_in_footer: fields.BooleanField
	exclude_unspent_points_from_total: fields.BooleanField
}

export class SheetSettings extends foundry.abstract.DataModel<ActorGURPS, SheetSettingsSchema> {
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


	protected declare static _schema: fields.SchemaField<SheetSettingsSchema>

	constructor(data: DeepPartial<SourceFromSchema<SheetSettingsSchema>>) {

		super(data)

		this.attributes = data.attributes.map(e => new AttributeDef(e))
		this.resource_trackers = data.attributes.map(e => new ResourceTrackerDef(e))
		this.move_types = data.attributes.map(e => new MoveTypeDef(e))
	}



	static override defineSchema(): SheetSettingsSchema {
		const fields = foundry.data.fields
		const defaults = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.settings`)
		return {
			page: new fields.ObjectField<PageSettings>({ initial: defaults.page }),
			block_layout: new fields.ObjectField<BlockLayout>(),
			attributes: new fields.ArrayField(new fields.SchemaField(AttributeDef.defineSchema()),
				{ initial: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`) }
			),
			resource_trackers: new fields.ArrayField(new fields.SchemaField(ResourceTrackerDef.defineSchema()),
				{ initial: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`) }
			),
			move_types: new fields.ArrayField(new fields.SchemaField(MoveTypeDef.defineSchema()),
				{ initial: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`) }
			),
			body_type: new fields.SchemaField(BodyGURPS.defineSchema(),
				{
					initial: {
						name: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.name`),
						roll: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.roll`),
						locations: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`),
					}
				}
			),
			damage_progression: new fields.StringField<progression.Option>({ initial: defaults.damage_progression }),
			default_length_units: new fields.StringField<LengthUnits>({ initial: defaults.default_length_units }),
			default_weight_units: new fields.StringField<WeightUnits>({ initial: defaults.default_weight_units }),
			user_description_display: new fields.StringField<display.Option>({ initial: defaults.user_description_display }),
			modifiers_display: new fields.StringField<display.Option>({ initial: defaults.modifiers_display }),
			notes_display: new fields.StringField<display.Option>({ initial: defaults.notes_display }),
			skill_level_adj_display: new fields.StringField<display.Option>({ initial: defaults.skill_level_adj_display }),
			use_multiplicative_modifiers: new fields.BooleanField({ initial: defaults.use_multiplicative_modifiers }),
			use_modifying_dice_plus_adds: new fields.BooleanField({ initial: defaults.use_modifying_dice_plus_adds }),
			use_half_stat_defaults: new fields.BooleanField({ initial: defaults.use_half_stat_defaults }),
			show_trait_modifier_adj: new fields.BooleanField({ initial: defaults.show_trait_modifier_adj }),
			show_equipment_modifier_adj: new fields.BooleanField({ initial: defaults.show_equipment_modifier_adj }),
			show_spell_adj: new fields.BooleanField({ initial: defaults.show_spell_adj }),
			use_title_in_footer: new fields.BooleanField({ initial: defaults.use_title_in_footer }),
			exclude_unspent_points_from_total: new fields.BooleanField({ initial: defaults.exclude_unspent_points_from_total }),
		}
	}

	static default(): SheetSettings {
		return new SheetSettings({})
	}

	static for(actor: ActorGURPS | null): SheetSettings {

	}

}

// export interface SheetSettings {
// 	page: PageSettings
// 	block_layout: BlockLayout
// 	attributes: AttributeDef[]
// 	resource_trackers: ResourceTrackerDef[]
// 	move_types: MoveTypeDef[]
// 	body_type: BodyGURPS<BodyOwner>
// 	damage_progression: progression.Option
// 	default_length_units: LengthUnits
// 	default_weight_units: WeightUnits
// 	user_description_display: display.Option
// 	modifiers_display: display.Option
// 	notes_display: display.Option
// 	skill_level_adj_display: display.Option
// 	use_multiplicative_modifiers: boolean
// 	use_modifying_dice_plus_adds: boolean
// 	use_half_stat_defaults: boolean
// 	show_trait_modifier_adj: boolean
// 	show_equipment_modifier_adj: boolean
// 	show_spell_adj: boolean
// 	use_title_in_footer: boolean
// 	exclude_unspent_points_from_total: boolean
// }

// export function defaultSheetSettings(): SheetSettings {
// 	const dummyBodyOwner: BodyOwner = {
// 		hitLocationTable: new BodyGURPS(),
// 		addDRBonusesFor: (_locationID: string, _tooltip: TooltipGURPS | null, drMap: Map<string, number>) => drMap,
// 	}
// 	const bodyObj: BodyObj = {
// 		name: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.name`),
// 		roll: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.roll`),
// 		locations: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`),
// 	}
// 	const body = BodyGURPS.fromObject(bodyObj, dummyBodyOwner)
// 	return {
// 		...game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.settings`),
// 		body_type: body,
// 		attributes: game.settings
// 			.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`)
// 			.map(e => new AttributeDef(e)),
// 		resource_trackers: game.settings
// 			.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`)
// 			.map(e => new ResourceTrackerDef(e)),
// 		move_types: game.settings
// 			.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`)
// 			.map(e => new MoveTypeDef(e)),
// 	}
// }

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

export { SheetSettings }
export type { SheetSettingsSchema }
