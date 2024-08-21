import { ActorDataModel } from "../abstract.ts"
import fields = foundry.data.fields
import { PointsRecord } from "@actor/character/data.ts"
import {
	SheetSettingsSchema,
	SheetSettings,
	AttributeGURPS,
	ResourceTracker,
	MoveType,
	AttributeSchema,
	ResourceTrackerSchema,
	MoveTypeSchema,
} from "@system"
import { CharacterManeuver } from "@system/maneuver-manager.ts"
import { ActorType } from "../constants.ts"

class CharacterData extends ActorDataModel {
	static override defineSchema(): CharacterSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			type: new fields.StringField<ActorType.Character, ActorType.Character, true, false, true>(),
			version: new fields.NumberField({ initial: 4 }),
			settings: new fields.SchemaField<SheetSettingsSchema>(SheetSettings.defineSchema()),
			created_date: new fields.StringField(),
			modified_date: new fields.StringField(),
			profile: new fields.SchemaField<CharacterProfileSchema>({
				player_name: new fields.StringField({ initial: game.user?.name }),
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
				type: new fields.StringField(),
			}),
			total_points: new fields.NumberField(),
			points_record: new fields.ArrayField(new fields.ObjectField<PointsRecord>()),
		}
	}
}

type CharacterSchema = {
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
	maneuver: fields.ObjectField<CharacterManeuver, CharacterManeuver, true, true>
	posture: fields.StringField
	type: fields.StringField
}

type PointBreakdownSchema = {
	overspent: fields.BooleanField
	ancestry: fields.NumberField<number, number, true, false, true>
	attributes: fields.NumberField<number, number, true, false, true>
	advantages: fields.NumberField<number, number, true, false, true>
	disadvantages: fields.NumberField<number, number, true, false, true>
	quirks: fields.NumberField<number, number, true, false, true>
	skills: fields.NumberField<number, number, true, false, true>
	spells: fields.NumberField<number, number, true, false, true>
	total: fields.NumberField<number, number, true, false, true>
	unspent: fields.NumberField<number, number, true, false, true>
}

export { CharacterData }
