import { ActorGURPS } from "@actor"
import { CharacterFlagDefaults, CharacterFlags, CharacterMove, CharacterProfile, CharacterSource, CharacterSystemSource, PointsRecord } from "@actor/character/data.ts"
import { ActorFlags, ActorType, ManeuverID, SETTINGS, SYSTEM_NAME } from "@data"
import { ItemSourceGURPS } from "@item/data/index.ts"
import { ChatMessageGURPS } from "@module/chat-message/document.ts"
import { LengthUnits, LocalizeGURPS, StringBuilder, WeightUnits, display, getCurrentTime, progression } from "@util"
import { GCABody, GCABodyItem, GCACharacter } from "./data-gca.ts"
import { GCAItemImporter } from "./item-gca.ts"
import { GCAParser } from "./parse-gca.ts"
import { ManeuverManager } from "@system/maneuver-manager.ts"
import {
	AttributeDefSchema,
	AttributeSchema,
	BlockLayoutString,
	BodySource,
	HitLocationSource,
	MoveTypeDefSchema,
	MoveTypeSchema,
	PageSettings,
	ResourceTrackerDefSchema,
	ResourceTrackerSchema,
	SheetSettingsSource,
} from "@system"

export class GCACharacterImporter {
	static async throwError(text: string): Promise<void> {
		ui.notifications.error(text)

		await ChatMessageGURPS.create({
			content: await renderTemplate(`systems/${SYSTEM_NAME}/templates/chat/character-import-error.hbs`, {
				lines: [text],
			}),
			whisper: [game.user.id],
		})
	}

	static async importCharacter<TActor extends ActorGURPS>(
		document: TActor,
		file: { text: string; name: string; path: string },
	): Promise<void> {
		const data = GCAParser.parseFile(file.text).character[0]

		const date = getCurrentTime()

		const systemData: CharacterSystemSource = {
			_migration: { version: null, previous: null },
			type: ActorType.Character,
			version: 4,
			total_points: data.campaign.totalpoints ?? 0,
			points_record: GCACharacterImporter.importPointsRecord(data),
			profile: GCACharacterImporter.importProfile(data),
			settings: GCACharacterImporter.importSettings(data),
			attributes: GCACharacterImporter.importAttributes(data),
			resource_trackers: GCACharacterImporter.importResourceTrackers(),
			move_types: GCACharacterImporter.importMoveTypes(),
			move: GCACharacterImporter.importMoveData(),
			created_date: date,
			modified_date: date,
		}

		const image = GCACharacterImporter.importPortrait()

		const flags = GCACharacterImporter.importFlags(file)

		const items: ItemSourceGURPS[] = []
		items.push(...GCAItemImporter.importAdvantages(data))
		items.push(...GCAItemImporter.importDisadvantages(data))
		items.push(...GCAItemImporter.importPerks(data))
		items.push(...GCAItemImporter.importQuirks(data))
		items.push(...GCAItemImporter.importLanguages(data))
		items.push(...GCAItemImporter.importCultures(data))
		items.push(...GCAItemImporter.importSkills(data))
		items.push(...GCAItemImporter.importSpells(data))
		items.push(...GCAItemImporter.importEquipments(data))
		items.push(...GCAItemImporter.importTemplates(data))

		const name =
			systemData.profile.name ?? document.name ?? LocalizeGURPS.translations.TYPES.Actor[ActorType.Character]

		const actorData: DeepPartial<CharacterSource> = {
			name,
			img: image,
			system: systemData,
			items,
			prototypeToken: {
				name,
			},
			flags,
		}

		// If the character is a token instance, imported items are duplicated as some exist for the token and others for the prototype.
		// This removes one of these duplicates.
		if (document.isToken) {
			await document.deleteEmbeddedDocuments("Item", [...document.items.keys()], { render: false })
		}

		await document.update(actorData, { diff: false, recursive: false })
	}

	static importPointsRecord(data: GCACharacter): PointsRecord[] {
		return data.campaign.logentries.logentry.map(e => {
			return {
				when: new Date(e.entrydate).toString(),
				points: e.charpoints,
				reason: e.caption,
			}
		})
	}

	static importProfile(data: GCACharacter): CharacterProfile {
		return {
			name: data.name ?? "",
			age: data.vitals?.age ?? "",
			birthday: "",
			eyes: "",
			hair: "",
			skin: "",
			handedness: "",
			gender: "",
			height: data.vitals?.height ?? "",
			weight: data.vitals?.weight ?? "",
			player_name: data.player ?? "",
			title: "",
			organization: "",
			religion: "",
			tech_level: `${data.campaign.basetl}`, // TODO: check
			portrait: "",
			SM: 0, // TODO: check
		}
	}

	static importSettings(data: GCACharacter): SheetSettingsSource {
		return {
			page: GCACharacterImporter.importPage(),
			block_layout: GCACharacterImporter.importBlockLayout(),
			attributes: GCACharacterImporter.importAttributeSettings(data),
			resource_trackers: GCACharacterImporter.importResourceTrackerSettings(),
			move_types: GCACharacterImporter.importMoveTypeSettings(),
			body_type: GCACharacterImporter.importBody(data.body, data),
			damage_progression: progression.Option.BasicSet,
			default_length_units: LengthUnits.FeetAndInches,
			default_weight_units: WeightUnits.Pound,
			user_description_display: display.Option.Tooltip,
			modifiers_display: display.Option.Inline,
			notes_display: display.Option.Inline,
			skill_level_adj_display: display.Option.Tooltip,
			use_multiplicative_modifiers: false,
			use_modifying_dice_plus_adds: false,
			use_half_stat_defaults: false,
			show_trait_modifier_adj: false,
			show_equipment_modifier_adj: false,
			show_spell_adj: true,
			use_title_in_footer: false,
			exclude_unspent_points_from_total: false,
		}
	}

	static importPage(): PageSettings {
		return game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.settings`).page
	}

	static importBlockLayout(): BlockLayoutString[] {
		return game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.settings`).block_layout
	}

	static importAttributeSettings(_data: GCACharacter): SourceFromSchema<AttributeDefSchema>[] {
		return game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`)
	}

	static importResourceTrackerSettings(): SourceFromSchema<ResourceTrackerDefSchema>[] {
		return game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`)
	}

	static importMoveTypeSettings(): SourceFromSchema<MoveTypeDefSchema>[] {
		return game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`)
	}

	static importBody(body: GCABody | undefined, char: GCACharacter): BodySource {
		if (!body)
			return {
				name: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.name`),
				roll: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.roll`),
				locations: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`),
			}
		return {
			name: body.name ?? "",
			roll: "3d6", // TODO: change
			locations: GCACharacterImporter.importHitLocations(body?.bodyitem ?? [], char),
		}
	}

	static importHitLocations(location: GCABodyItem[], char: GCACharacter): HitLocationSource[] {
		const hitLocationNotes = char.hitlocationtable?.hitlocationnote ?? []
		const hitLocationLines = char.hitlocationtable?.hitlocationline ?? []

		function getHitLocationNotes(name: string): string {
			const buffer = new StringBuilder()
			const noteNumbers = hitLocationLines.find(e => e.location === name)?.notes?.split(",") ?? []
			if (noteNumbers.length === 0) return buffer.toString()
			hitLocationNotes
				.filter(e => noteNumbers.includes(e.key))
				.forEach(e => {
					buffer.appendToNewLine(e.value)
				})
			return buffer.toString()
		}

		return (
			location?.map(e => {
				const location = {
					id: e.name.toLowerCase(),
					choice_name: e.name,
					table_name: e.name,
					slots: 0,
					hit_penalty: 0,
					dr_bonus: parseInt(e.basedr) ?? 0,
					description: getHitLocationNotes(e.name),
					sub_table: null
				}
				return location
			}) ?? []
		)
	}

	static importAttributes(data: GCACharacter): SourceFromSchema<AttributeSchema>[] {
		const settings = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`)
		const atts: SourceFromSchema<AttributeSchema>[] = []
		data.traits.attributes.trait?.forEach(e => {
			const id = (e.symbol || e.name).toLowerCase().replace(/ /g, "_")
			if (!settings.map(f => f.id).includes(id)) return
			atts.push({
				id,
				adj: (e.score ?? 0) - parseInt(e.calcs?.basescore ?? "0"),
				damage: 0,
				apply_ops: false,
			})
		})
		return atts
	}

	static importResourceTrackers(): SourceFromSchema<ResourceTrackerSchema>[] {
		return []
	}

	static importMoveTypes(): SourceFromSchema<MoveTypeSchema>[] {
		return []
	}

	static importMoveData(): CharacterMove {
		const maneuver = ManeuverManager.maneuvers.get(ManeuverID.DoNothing) ?? null
		return { maneuver, posture: "standing", type: "ground" }
	}

	static importPortrait(): ImageFilePath {
		return `/systems/${SYSTEM_NAME}/assets/icons/character.svg`
	}

	static importFlags(file: { text: string; path: string; name: string }): CharacterFlags {
		const flags = CharacterFlagDefaults

		const time = getCurrentTime()

		flags[SYSTEM_NAME][ActorFlags.Import] = { name: file.name, path: file.path, last_import: time }

		return flags
	}
}
