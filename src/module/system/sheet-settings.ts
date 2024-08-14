import type { ActorGURPS, CharacterGURPS } from "@actor"
import { ActorType, SETTINGS, SYSTEM_NAME } from "@module/data/constants.ts"
import { ErrorGURPS, LengthUnits, WeightUnits, display, paper, progression } from "@util"
import { AttributeDefSchema } from "./attribute/data.ts"
import { AttributeDef } from "./attribute/definition.ts"
import { BodyGURPS, BodySchema, BodySource } from "./hit-location/index.ts"
import { MoveTypeDefSchema } from "./move-type/data.ts"
import { MoveTypeDef } from "./move-type/definition.ts"
import { ResourceTrackerDefSchema } from "./resource-tracker/data.ts"
import { ResourceTrackerDef } from "./resource-tracker/definition.ts"
import fields = foundry.data.fields
import { Mook } from "./mook/document.ts"

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

type BlockLayoutString = `${BlockLayoutKey}` | `${BlockLayoutKey} ${BlockLayoutKey}`

type SheetSettingsSchema = {
	page: fields.ObjectField<PageSettings>
	block_layout: fields.ArrayField<fields.StringField<BlockLayoutString>>
	attributes: fields.ArrayField<fields.SchemaField<AttributeDefSchema>>
	resource_trackers: fields.ArrayField<fields.SchemaField<ResourceTrackerDefSchema>>
	body_type: fields.SchemaField<BodySchema>
	move_types: fields.ArrayField<fields.SchemaField<MoveTypeDefSchema>>
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

type SheetSettingsSource = Omit<SourceFromSchema<SheetSettingsSchema>, "body_type"> & {
	body_type: BodySource
}

class SheetSettings extends foundry.abstract.DataModel<CharacterGURPS, SheetSettingsSchema> {
	constructor(
		data: DeepPartial<SourceFromSchema<SheetSettingsSchema>>,
		options?: DataModelConstructionOptions<CharacterGURPS>,
	) {
		super(data, options)
		this.attributes = data.attributes?.map(e => new AttributeDef(e!, { parent: this.parent })) ?? []
		this.resource_trackers =
			data.resource_trackers?.map(e => new ResourceTrackerDef(e!, { parent: this.parent })) ?? []
		this.move_types = data.move_types?.map(e => new MoveTypeDef(e!, { parent: this.parent })) ?? []
		this.body_type = new BodyGURPS(data.body_type ?? {})
	}

	get actor(): ActorGURPS {
		return this.parent
	}

	static override defineSchema(): SheetSettingsSchema {
		const fields = foundry.data.fields
		const defaults = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.settings`)
		return {
			page: new fields.ObjectField<PageSettings>({ initial: defaults.page }),
			block_layout: new fields.ArrayField(new fields.StringField(), { initial: defaults["block_layout"] }),
			attributes: new fields.ArrayField(new fields.SchemaField(AttributeDef.defineSchema()), {
				initial: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`),
			}),
			resource_trackers: new fields.ArrayField(new fields.SchemaField(ResourceTrackerDef.defineSchema()), {
				initial: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`),
			}),
			move_types: new fields.ArrayField(new fields.SchemaField(MoveTypeDef.defineSchema()), {
				initial: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`),
			}),
			body_type: new fields.SchemaField(BodyGURPS.defineSchema(), {
				initial: {
					name: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.name`),
					roll: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.roll`),
					locations: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`),
				},
			}),
			damage_progression: new fields.StringField<progression.Option>({ initial: defaults.damage_progression }),
			default_length_units: new fields.StringField<LengthUnits>({ initial: defaults.default_length_units }),
			default_weight_units: new fields.StringField<WeightUnits>({ initial: defaults.default_weight_units }),
			user_description_display: new fields.StringField<display.Option>({
				initial: defaults.user_description_display,
			}),
			modifiers_display: new fields.StringField<display.Option>({ initial: defaults.modifiers_display }),
			notes_display: new fields.StringField<display.Option>({ initial: defaults.notes_display }),
			skill_level_adj_display: new fields.StringField<display.Option>({
				initial: defaults.skill_level_adj_display,
			}),
			use_multiplicative_modifiers: new fields.BooleanField({ initial: defaults.use_multiplicative_modifiers }),
			use_modifying_dice_plus_adds: new fields.BooleanField({ initial: defaults.use_modifying_dice_plus_adds }),
			use_half_stat_defaults: new fields.BooleanField({ initial: defaults.use_half_stat_defaults }),
			show_trait_modifier_adj: new fields.BooleanField({ initial: defaults.show_trait_modifier_adj }),
			show_equipment_modifier_adj: new fields.BooleanField({ initial: defaults.show_equipment_modifier_adj }),
			show_spell_adj: new fields.BooleanField({ initial: defaults.show_spell_adj }),
			use_title_in_footer: new fields.BooleanField({ initial: defaults.use_title_in_footer }),
			exclude_unspent_points_from_total: new fields.BooleanField({
				initial: defaults.exclude_unspent_points_from_total,
			}),
		}
	}

	static default(): SheetSettings {
		return new SheetSettings({})
	}

	static for(actor: ActorGURPS | Mook | null): SheetSettings {
		if (actor instanceof Actor && actor?.isOfType(ActorType.Character)) {
			return actor.settings ?? new SheetSettings(actor.system.settings, { parent: actor })
		}
		if (actor) {
			ErrorGURPS(
				`Actor "${actor.name}" is of type "${actor.type}", which does not support Sheet Settings.Returning default settings.`,
			)
		} else {
			ErrorGURPS(`Actor does not exist.Returning default settings.`)
		}
		return SheetSettings.default()
	}
}

// interface SheetSettings
// 	extends foundry.abstract.DataModel<CharacterGURPS, SheetSettingsSchema>,
// 	ModelPropsFromSchema<SheetSettingsSchema> {
// }

interface SheetSettings
	extends foundry.abstract.DataModel<CharacterGURPS, SheetSettingsSchema>,
		Omit<
			ModelPropsFromSchema<SheetSettingsSchema>,
			"attributes" | "resource_trackers" | "move_types" | "body_type"
		> {
	attributes: AttributeDef[]
	resource_trackers: ResourceTrackerDef[]
	move_types: MoveTypeDef[]
	body_type: BodyGURPS
}

export { SheetSettings }
export type { BlockLayoutString, SheetSettingsSchema, SheetSettingsSource }
