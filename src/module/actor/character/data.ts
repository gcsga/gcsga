import fields = foundry.data.fields
import type { ActorFlagsGURPS, BaseActorSourceGURPS } from "@actor/base/data.ts"
import { ActorSystemModel, ActorSystemSchema } from "@actor/base/schema.ts"
import { ActorFlags, ActorType, SYSTEM_NAME } from "@data"
import { DiceGURPS } from "@module/dice/index.ts"
import { AttributeGURPS, MoveType, ResourceTracker, SheetSettings, type AttributeSchema, type MoveTypeSchema, type PoolThreshold, type ResourceTrackerSchema, type SheetSettingsSchema } from "@system"
import { CharacterManeuver } from "../../system/maneuver-manager.ts"
import { CharacterGURPS } from "./document.ts"

// type CharacterSource = BaseActorSourceGURPS<ActorType.Character, CharacterSystemSource> & {
// 	flags: DeepPartial<CharacterFlags>
// }

type CharacterFlags = ActorFlagsGURPS & {
	[SYSTEM_NAME]: {
		[ActorFlags.MoveType]: string
		[ActorFlags.AutoEncumbrance]: { active: boolean; manual: number }
		[ActorFlags.AutoThreshold]: { active: boolean; manual: Record<string, PoolThreshold | null> }
		[ActorFlags.AutoDamage]: { active: boolean; thrust: DiceGURPS; swing: DiceGURPS }
	}
}

// const CharacterFlagDefaults: CharacterFlags = {
// 	[SYSTEM_NAME]: {
// 		[ActorFlags.TargetModifiers]: [],
// 		[ActorFlags.SelfModifiers]: [],
// 		[ActorFlags.MoveType]: gid.Ground,
// 		[ActorFlags.AutoEncumbrance]: { active: true, manual: 0 },
// 		[ActorFlags.AutoThreshold]: { active: true, manual: {} },
// 		[ActorFlags.AutoDamage]: { active: true, thrust: new DiceGURPS(), swing: new DiceGURPS() },
// 		[ActorFlags.Import]: { name: "", path: "", last_import: "" },
// 	},
// }

// interface CharacterSystemSource extends ActorSystemSource {
// 	type: ActorType.Character
// 	version: number
// 	settings: SheetSettingsObj
// 	created_date: string
// 	modified_date: string
// 	profile: CharacterProfile
// 	attributes: AttributeObj[]
// 	resource_trackers: ResourceTrackerObj[]
// 	move_types: MoveTypeObj[]
// 	move: CharacterMove
// 	total_points: number
// 	points_record: PointsRecord[]
// }
//
// interface CharacterSystemData extends CharacterSystemSource, ActorSystemData { }

// export interface CharacterMove {
// 	maneuver: CharacterManeuver | null
// 	posture: string
// 	type: string
// }

// export interface CharacterProfile {
// 	player_name: string
// 	name: string
// 	title: string
// 	organization: string
// 	age: string
// 	birthday: string
// 	eyes: string
// 	hair: string
// 	skin: string
// 	handedness: string
// 	height: string
// 	weight: string
// 	SM: number
// 	gender: string
// 	tech_level: string
// 	religion: string
// 	portrait: string
// }
//
// export interface CharacterCalc {
// 	swing: string
// 	thrust: string
// 	basic_lift: Weight
// 	lifting_st_bonus: number
// 	striking_st_bonus: number
// 	throwing_st_bonus: number
// 	move: number[]
// 	dodge: number[]
// 	dodge_bonus: number
// 	block_bonus: number
// 	parry_bonus: number
// }

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

// export const CharacterDefaultData: Partial<CharacterSystemSource> = {
// 	profile: {
// 		player_name: "",
// 		name: "",
// 		title: "",
// 		organization: "",
// 		age: "",
// 		birthday: "",
// 		eyes: "",
// 		hair: "",
// 		skin: "",
// 		handedness: "",
// 		height: "6'",
// 		weight: "0 lb",
// 		SM: 0,
// 		gender: "",
// 		tech_level: "",
// 		religion: "",
// 		portrait: "",
// 	},
// }

// export { CharacterFlagDefaults }
// export type { CharacterFlags, CharacterSource, CharacterSystemData, CharacterSystemSource }

// export interface PointsBreakdown {
// 	overspent: boolean
// 	ancestry: number
// 	attributes: number
// 	advantages: number
// 	disadvantages: number
// 	quirks: number
// 	skills: number
// 	spells: number
// 	total: number
// 	unspent: number
// }

class CharacterSystemData extends ActorSystemModel<CharacterGURPS, CharacterSystemSchema> {
	static override defineSchema(): CharacterSystemSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField<ActorType.Character, ActorType.Character, true, false, true>(),
			version: new fields.NumberField({ initial: 4 }),
			settings: new fields.SchemaField<SheetSettingsSchema>(SheetSettings.defineSchema()),
			created_date: new fields.StringField(),
			modified_date: new fields.StringField(),
			profile: new fields.SchemaField<CharacterProfileSchema>({
				player_name: new fields.StringField({ initial: game.user.name }),
				name: new fields.StringField(),
				title: new fields.StringField(),
				organization: new fields.StringField(),
				age: new fields.StringField(),
				birthday: new fields.StringField(),
				eyes: new fields.StringField(),
				hair: new fields.StringField(),
				skin: new fields.StringField(),
				handedness: new fields.StringField(),
				height: new fields.StringField(),
				weight: new fields.StringField(),
				SM: new fields.NumberField({ integer: true, initial: 0 }),
				gender: new fields.StringField(),
				tech_level: new fields.StringField(),
				religion: new fields.StringField(),
				portrait: new fields.StringField(),
			}),
			attributes: new fields.ArrayField(new fields.SchemaField(AttributeGURPS.defineSchema())),
			resource_trackers: new fields.ArrayField(new fields.SchemaField(ResourceTracker.defineSchema())),
			move_types: new fields.ArrayField(new fields.SchemaField(MoveType.defineSchema())),
			move: new fields.SchemaField({
				maneuver: new fields.ObjectField(),
				posture: new fields.StringField(),
				type: new fields.StringField()
			}),
			total_points: new fields.NumberField(),
			points_record: new fields.ArrayField(new fields.ObjectField<PointsRecord>()),
		}
	}
}

interface CharacterSystemData extends ActorSystemModel<CharacterGURPS, CharacterSystemSchema>,
	ModelPropsFromSchema<CharacterSystemSchema> { }

type CharacterSystemSchema = ActorSystemSchema & {
	type: fields.StringField<ActorType.Character, ActorType.Character, true, false, true>
	version: fields.NumberField
	settings: fields.SchemaField<SheetSettingsSchema>
	created_date: fields.StringField
	modified_date: fields.StringField
	profile: fields.SchemaField<CharacterProfileSchema>
	attributes: fields.ArrayField<fields.SchemaField<AttributeSchema>>
	resource_trackers: fields.ArrayField<fields.SchemaField<ResourceTrackerSchema>>
	move_types: fields.ArrayField<fields.SchemaField<MoveTypeSchema>>
	move: fields.SchemaField<CharacterMoveSchema>
	total_points: fields.NumberField<number, number, true, false>
	points_record: fields.ArrayField<fields.ObjectField<PointsRecord>>
}


type CharacterProfileSchema = {
	player_name: fields.StringField
	name: fields.StringField
	title: fields.StringField
	organization: fields.StringField
	age: fields.StringField
	birthday: fields.StringField
	eyes: fields.StringField
	hair: fields.StringField
	skin: fields.StringField
	handedness: fields.StringField
	height: fields.StringField
	weight: fields.StringField
	SM: fields.NumberField
	gender: fields.StringField
	tech_level: fields.StringField
	religion: fields.StringField
	portrait: fields.StringField
}

type CharacterMoveSchema = {
	maneuver: fields.ObjectField<CharacterManeuver>
	posture: fields.StringField
	type: fields.StringField
}

type CharacterProfile = ModelPropsFromSchema<CharacterProfileSchema>

type CharacterMove = ModelPropsFromSchema<CharacterMoveSchema>

type CharacterSystemSource = SourceFromSchema<CharacterSystemSchema>

type CharacterSource = BaseActorSourceGURPS<ActorType.Character, CharacterSystemSource>

export type { CharacterFlags, CharacterSource, CharacterSystemData, CharacterSystemSource, CharacterProfile, CharacterMove }

