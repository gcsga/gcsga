import { ActorGURPS, CharacterGURPS } from "@actor"
import {
	CharacterFlagDefaults,
	CharacterFlags,
	CharacterMove,
	CharacterProfile,
	CharacterSource,
	CharacterSystemSource,
	PointsRecord,
} from "@actor/character/data.ts"
import {
	ImportedAttribute,
	ImportedAttributeDef,
	ImportedBody,
	ImportedCharacterProfile,
	ImportedCharacterSystemSource,
	ImportedHitLocation,
	ImportedMoveData,
	ImportedMoveType,
	ImportedMoveTypeDef,
	ImportedMoveTypeOverride,
	ImportedPageSettings,
	ImportedPointsRecord,
	ImportedResourceTracker,
	ImportedResourceTrackerDef,
	ImportedSheetSettings,
	ImportedThirdPartyData,
	ImportedThreshold,
} from "./data.ts"
import { BlockLayoutKey, PageSettings, SheetSettings } from "@module/data/sheet_settings.ts"
import { AttributeDefObj, AttributeObj, PoolThresholdDef } from "@sytem/attribute/data.ts"
import { HitLocationData, HitLocationTableData } from "@actor/character/hit_location.ts"
import { progression } from "@util/enum/progression.ts"
import { ItemImporter, LengthUnits, LocalizeGURPS, WeightUnits, getCurrentTime } from "@util"
import { display } from "@util/enum/display.ts"
import { ResourceTrackerDefObj, ResourceTrackerObj } from "@sytem/resource_tracker/data.ts"
import { MoveTypeDefObj, MoveTypeObj, MoveTypeOverrideObj } from "@sytem/move_type/data.ts"
import { ItemSourceGURPS } from "@item/base/data/index.ts"
import { ChatMessageGURPS } from "@module/chat-message/document.ts"
import { ActorFlags, ActorType, ManeuverID, SYSTEM_NAME } from "@data"

const GCS_FILE_VERSION = 4

export class CharacterImporter {
	static async throwError(text: string): Promise<void> {
		ui.notifications.error(text)

		await ChatMessageGURPS.create({
			content: await renderTemplate(`systems/${SYSTEM_NAME}/templates/chat/character-import-error.hbs`, {
				lines: [text],
			}),
			type: CONST.CHAT_MESSAGE_TYPES.WHISPER,
			whisper: [game.user.id],
		})
	}

	static async importCharacter<TActor extends ActorGURPS>(
		document: TActor,
		file: { text: string; name: string; path: string },
	): Promise<void> {
		const data = JSON.parse(file.text) as ImportedCharacterSystemSource

		if (data.version !== GCS_FILE_VERSION) {
			if (data.version < GCS_FILE_VERSION)
				return CharacterImporter.throwError(LocalizeGURPS.translations.gurps.error.import.format_old)
			else return CharacterImporter.throwError(LocalizeGURPS.translations.gurps.error.import.format_new)
		}

		const systemData: CharacterSystemSource = {
			_migration: { version: null, previous: null },
			type: "character",
			version: GCS_FILE_VERSION,
			total_points: data.total_points,
			points_record: CharacterImporter.importPointsRecord(data.points_record ?? []),
			profile: CharacterImporter.importProfile(data.profile),
			settings: CharacterImporter.importSettings(data.settings, data.third_party),
			attributes: CharacterImporter.importAttributes(data.attributes),
			resource_trackers: CharacterImporter.importResourceTrackers(data.third_party?.resource_trackers),
			move_types: CharacterImporter.importMoveTypes(data.third_party?.move_types),
			move: CharacterImporter.importMoveData(data.third_party?.move),
			created_date: data.created_date,
			modified_date: data.modified_date,
		}

		const image = CharacterImporter.importPortrait(data.profile?.portrait)

		const flags = CharacterImporter.importFlags(file)

		const items: ItemSourceGURPS[] = []
		items.push(...ItemImporter.importItems(data.traits))
		items.push(...ItemImporter.importItems(data.skills))
		items.push(...ItemImporter.importItems(data.spells))
		items.push(...ItemImporter.importItems(data.equipment))
		items.push(...ItemImporter.importItems(data.other_equipment, { other: true }))
		items.push(...ItemImporter.importItems(data.notes))

		console.log(items)

		const name = data.profile?.name ?? document.name ?? LocalizeGURPS.translations.TYPES.Actor[ActorType.Character]

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

		// Refresh the config sheet if it is rendered
		if (document instanceof CharacterGURPS) if (document.sheet.config?.rendered) document.sheet.config.render(true)
	}

	static importPointsRecord(data: ImportedPointsRecord[]): PointsRecord[] {
		return data.map(e => {
			e.reason ??= ""
			return e
		}) as PointsRecord[]
	}

	static importProfile(data?: ImportedCharacterProfile): CharacterProfile {
		return {
			name: data?.name ?? "",
			age: data?.age ?? "",
			birthday: data?.birthday ?? "",
			eyes: data?.eyes ?? "",
			hair: data?.hair ?? "",
			skin: data?.skin ?? "",
			handedness: data?.handedness ?? "",
			gender: data?.gender ?? "",
			height: data?.height ?? "",
			weight: data?.weight ?? "",
			player_name: data?.player_name ?? "",
			title: data?.title ?? "",
			organization: data?.organization ?? "",
			religion: data?.religion ?? "",
			tech_level: data?.tech_level ?? "",
			portrait: data?.portrait ?? "",
			SM: data?.SM ?? 0,
		}
	}

	static importSettings(data?: ImportedSheetSettings, third_party?: ImportedThirdPartyData): SheetSettings {
		return {
			page: CharacterImporter.importPage(data?.page),
			block_layout: (data?.block_layout as BlockLayoutKey[]) ?? [],
			attributes: CharacterImporter.importAttributeSettings(data?.attributes),
			resource_trackers: CharacterImporter.importResourceTrackerSettings(
				third_party?.settings?.resource_trackers,
			),
			move_types: CharacterImporter.importMoveTypeSettings(third_party?.settings?.move_types),
			body_type: CharacterImporter.importBody(data?.body_type),
			damage_progression: data?.damage_progression ?? progression.Option.BasicSet,
			default_length_units: data?.default_length_units ?? LengthUnits.FeetAndInches,
			default_weight_units: data?.default_weight_units ?? WeightUnits.Pound,
			user_description_display: data?.user_description_display ?? display.Option.Tooltip,
			modifiers_display: data?.modifiers_display ?? display.Option.Inline,
			notes_display: data?.notes_display ?? display.Option.Inline,
			skill_level_adj_display: data?.skill_level_adj_display ?? display.Option.Tooltip,
			use_multiplicative_modifiers: data?.use_multiplicative_modifiers ?? false,
			use_modifying_dice_plus_adds: data?.use_modifying_dice_plus_adds ?? false,
			use_half_stat_defaults: data?.use_half_stat_defaults ?? false,
			show_trait_modifier_adj: data?.show_trait_modifier_adj ?? false,
			show_equipment_modifier_adj: data?.show_equipment_modifier_adj ?? false,
			show_spell_adj: data?.show_spell_adj ?? true,
			use_title_in_footer: data?.use_title_in_footer ?? false,
			exclude_unspent_points_from_total: data?.exclude_unspent_points_from_total ?? false,
		}
	}

	static importPage(data?: ImportedPageSettings): PageSettings {
		return data as PageSettings
	}

	static importAttributeSettings(data?: ImportedAttributeDef[]): AttributeDefObj[] {
		return (
			data?.map(e => {
				return {
					id: e.id,
					type: e.type,
					name: e.name,
					full_name: e.full_name ?? "",
					attribute_base: e.attribute_base ?? "",
					cost_per_point: e.cost_per_point ?? 0,
					cost_adj_percent_per_sm: e.cost_adj_percent_per_sm ?? 0,
					thresholds: CharacterImporter.importThresholds(e.thresholds),
				}
			}) ?? []
		)
	}

	static importResourceTrackerSettings(data?: ImportedResourceTrackerDef[]): ResourceTrackerDefObj[] {
		return (
			data?.map(e => {
				return {
					id: e.id,
					name: e.name,
					full_name: e.full_name ?? "",
					min: e.min ?? 0,
					max: e.max ?? 0,
					isMinEnforced: e.isMinEnforced ?? false,
					isMaxEnforced: e.isMaxEnforced ?? false,
					thresholds: CharacterImporter.importThresholds(e.thresholds),
				}
			}) ?? []
		)
	}

	static importMoveTypeSettings(data?: ImportedMoveTypeDef[]): MoveTypeDefObj[] {
		return (
			data?.map(e => {
				return {
					id: e.id,
					name: e.name,
					move_type_base: e.move_type_base ?? "",
					overrides: CharacterImporter.importMoveTypeOverrides(e.overrides),
				}
			}) ?? []
		)
	}

	static importMoveTypeOverrides(data?: ImportedMoveTypeOverride[]): MoveTypeOverrideObj[] {
		return data ?? []
	}

	static importThresholds(data?: ImportedThreshold[]): PoolThresholdDef[] {
		return data ?? []
	}

	static importBody(data?: ImportedBody): HitLocationTableData {
		return {
			name: data?.name ?? "",
			roll: data?.roll ?? "",
			locations: CharacterImporter.importHitLocations(data?.locations),
		}
	}

	static importHitLocations(data?: ImportedHitLocation[]): HitLocationData[] {
		return (
			data?.map(e => {
				const location: HitLocationData = {
					id: e.id,
					choice_name: e.choice_name,
					table_name: e.table_name,
					slots: e.slots ?? 0,
					hit_penalty: e.hit_penalty ?? 0,
					dr_bonus: e.dr_bonus ?? 0,
					description: e.description ?? "",
				}
				if (e.sub_table) location.sub_table = CharacterImporter.importBody(e.sub_table)
				return location
			}) ?? []
		)
	}

	static importAttributes(data?: ImportedAttribute[]): AttributeObj[] {
		return data ?? []
	}

	static importResourceTrackers(data?: ImportedResourceTracker[]): ResourceTrackerObj[] {
		return data ?? []
	}

	static importMoveTypes(data?: ImportedMoveType[]): MoveTypeObj[] {
		return (
			data?.map(e => {
				return {
					move_type_id: e.move_type_id,
					adj: e.adj ?? 0,
				}
			}) ?? []
		)
	}

	static importMoveData(data?: ImportedMoveData): CharacterMove {
		return data ?? { maneuver: ManeuverID.DoNothing, posture: "standing", type: "ground" }
	}

	static importPortrait(data?: string): ImageFilePath {
		if (game.user?.hasPermission(foundry.CONST.USER_PERMISSIONS.FILES_UPLOAD))
			return `data:image/png,base64,${data}.png`
		return `/systems/${SYSTEM_NAME}/assets/icons/character.svg`
	}

	static importFlags(file: { text: string; path: string; name: string }): CharacterFlags {
		const flags = CharacterFlagDefaults

		const time = getCurrentTime()

		flags[SYSTEM_NAME][ActorFlags.Import] = { name: file.name, path: file.path, last_import: time }

		return flags
	}
}
