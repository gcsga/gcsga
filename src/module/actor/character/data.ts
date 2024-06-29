import fields = foundry.data.fields
import type { ActorFlagsGURPS, ActorSystemData, ActorSystemSource, BaseActorSourceGURPS } from "@actor/base/data.ts"
import { ActorSystemModel, ActorSystemSchema } from "@actor/base/schema.ts"
import { ActorFlags, ActorType, SYSTEM_NAME, gid } from "@data"
import { PageSettings, SheetSettingsObj } from "@module/data/sheet-settings.ts"
import { DiceGURPS } from "@module/dice/index.ts"
import type { AttributeObj, MoveTypeObj, PoolThreshold, ResourceTrackerObj } from "@system"
import type { Weight } from "@util/weight.ts"
import { CharacterManeuver } from "../../system/maneuver-manager.ts"
import { CharacterGURPS } from "./document.ts"

type CharacterSource = BaseActorSourceGURPS<ActorType.Character, CharacterSystemSource> & {
	flags: DeepPartial<CharacterFlags>
}

type CharacterFlags = ActorFlagsGURPS & {
	[SYSTEM_NAME]: {
		[ActorFlags.MoveType]: string
		[ActorFlags.AutoEncumbrance]: { active: boolean; manual: number }
		[ActorFlags.AutoThreshold]: { active: boolean; manual: Record<string, PoolThreshold | null> }
		[ActorFlags.AutoDamage]: { active: boolean; thrust: DiceGURPS; swing: DiceGURPS }
	}
}

const CharacterFlagDefaults: CharacterFlags = {
	[SYSTEM_NAME]: {
		[ActorFlags.TargetModifiers]: [],
		[ActorFlags.SelfModifiers]: [],
		[ActorFlags.MoveType]: gid.Ground,
		[ActorFlags.AutoEncumbrance]: { active: true, manual: 0 },
		[ActorFlags.AutoThreshold]: { active: true, manual: {} },
		[ActorFlags.AutoDamage]: { active: true, thrust: new DiceGURPS(), swing: new DiceGURPS() },
		[ActorFlags.Import]: { name: "", path: "", last_import: "" },
	},
}

interface CharacterSystemSource extends ActorSystemSource {
	type: ActorType.Character
	version: number
	settings: SheetSettingsObj
	created_date: string
	modified_date: string
	profile: CharacterProfile
	attributes: AttributeObj[]
	resource_trackers: ResourceTrackerObj[]
	move_types: MoveTypeObj[]
	move: CharacterMove
	total_points: number
	points_record: PointsRecord[]
}

interface CharacterSystemData extends CharacterSystemSource, ActorSystemData { }

export interface CharacterMove {
	maneuver: CharacterManeuver | null
	posture: string
	type: string
}

export interface CharacterProfile {
	player_name: string
	name: string
	title: string
	organization: string
	age: string
	birthday: string
	eyes: string
	hair: string
	skin: string
	handedness: string
	height: string
	weight: string
	SM: number
	gender: string
	tech_level: string
	religion: string
	portrait: string
}

export interface CharacterCalc {
	swing: string
	thrust: string
	basic_lift: Weight
	lifting_st_bonus: number
	striking_st_bonus: number
	throwing_st_bonus: number
	move: number[]
	dodge: number[]
	dodge_bonus: number
	block_bonus: number
	parry_bonus: number
}

export interface PointsRecord {
	when: string
	points: number
	reason: string
}

export interface Encumbrance {
	level: number
	maximumCarry: number
	penalty: number
	name: string
	active: boolean
	dodge: {
		normal: number
		effective: number
	}
	move: {
		normal: number
		effective: number
	}
}

export const CharacterDefaultData: Partial<CharacterSystemSource> = {
	profile: {
		player_name: "",
		name: "",
		title: "",
		organization: "",
		age: "",
		birthday: "",
		eyes: "",
		hair: "",
		skin: "",
		handedness: "",
		height: "6'",
		weight: "0 lb",
		SM: 0,
		gender: "",
		tech_level: "",
		religion: "",
		portrait: "",
	},
}

export { CharacterFlagDefaults }
// export type { CharacterFlags, CharacterSource, CharacterSystemData, CharacterSystemSource }

export interface PointsBreakdown {
	overspent: boolean
	ancestry: number
	attributes: number
	advantages: number
	disadvantages: number
	quirks: number
	skills: number
	spells: number
	total: number
	unspent: number
}

class CharacterSystemData extends ActorSystemModel<CharacterGURPS, CharacterSystemSchema> {

	static override defineSchema(): CharacterSystemSchema {
		return {
			...super.defineSchema(),
		}
	}

}

type CharacterSystemSchema = ActorSystemSchema & {
	type: fields.StringField<ActorType.Character, ActorType.Character, true, false, true>
	version: fields.NumberField
	settings: fields.SchemaField<SheetSettingsSchema>
	created_date: fields.StringField
	modified_date: fields.StringField
	profile: fields.SchemaField<CharacterProfileSchema>
	attributes: fields.ArrayField<fields.SchemaField<AttributeSchema>>
	resource_trackers: fields.ArrayField<fields.SchemaField<AttributeSchema>>
	move_types: fields.ArrayField<fields.SchemaField<AttributeSchema>>
	move: fields.SchemaField<CharacterMoveSchema>
	total_points: fields.NumberField
	points_record: fields.ArrayField<fields.ObjectField<PointsRecord>>
}

type SheetSettingsSchema = {
	page: fields.ObjectField<PageSettings>
	block_layout: fields.ObjectField<BlockLayout>
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

type CharacterSystemSource = SourceFromSchema<CharacterSystemSchema>

type CharacterSource = BaseActorSourceGURPS<ActorType.Character, CharacterSystemSource>

export type { CharacterFlags, CharacterSource, CharacterSystemData, CharacterSystemSource }

