import { ActorFlags, ActorType, ManeuverID, SETTINGS, SYSTEM_NAME } from "@data"
import { ChatMessageGURPS } from "@module/chat-message/document.ts"
import { ManeuverManager } from "@system/maneuver-manager.ts"
import { Length, LocalizeGURPS, Weight, getCurrentTime } from "@util"
import { display } from "@util/enum/display.ts"
import { progression } from "@util/enum/progression.ts"
import { GCACharacterImporter } from "./character-gca.ts"
import {
	GCS_FILE_VERSIONS,
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
import { ItemImporter } from "./item.ts"
import { ActorGURPS2 } from "@module/document/actor.ts"
import { CharacterProfileSchema, CharacterSchema } from "@module/data/actor/character.ts"
import { ItemSource } from "types/foundry/common/documents/item.js"
import { ActorSource } from "types/foundry/common/documents/actor.js"
import { PointsRecord } from "@module/data/actor/fields/points-record.ts"
import { AttributeDefSchema, AttributeSchema, PoolThresholdSchema } from "@module/data/attribute/index.ts"
import { ResourceTrackerDefSchema, ResourceTrackerSchema } from "@module/data/resource-tracker/index.ts"
import { MoveTypeDefSchema, MoveTypeOverrideSchema, MoveTypeSchema } from "@module/data/move-type/index.ts"
import { BodySource, HitLocationSource } from "@module/data/hit-location.ts"
import { BlockLayoutKey, PageSettings, SheetSettingsSchema } from "@module/data/sheet-settings.ts"

export class CharacterImporter {
	static async throwError(text: string): Promise<void> {
		ui.notifications.error(text)

		await ChatMessageGURPS.create({
			content: await renderTemplate(`systems/${SYSTEM_NAME}/templates/chat/character-import-error.hbs`, {
				lines: [text],
			}),
			whisper: [game.user.id],
		})
	}

	static async importCharacter<TActor extends ActorGURPS2>(
		document: TActor,
		file: { text: string; name: string; path: string },
	): Promise<void> {
		// Redirect to GCA5 importer
		if (file.name.endsWith(".gca5")) return GCACharacterImporter.importCharacter(document, file)

		const data = JSON.parse(file.text) as ImportedCharacterSystemSource

		if (!GCS_FILE_VERSIONS.includes(data.version)) {
			if (data.version < Math.min(...GCS_FILE_VERSIONS))
				return CharacterImporter.throwError(LocalizeGURPS.translations.gurps.error.import.format_old)
			else return CharacterImporter.throwError(LocalizeGURPS.translations.gurps.error.import.format_new)
		}

		const systemData: Partial<SourceFromSchema<CharacterSchema>> = {
			version: data.version,
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

		if (systemData.settings?.resource_trackers.length === 0)
			systemData.settings.resource_trackers = game.settings.get(
				SYSTEM_NAME,
				`${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`,
			)

		if (systemData.settings?.move_types.length === 0)
			systemData.settings.move_types = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`)

		const image = CharacterImporter.importPortrait(data.profile?.portrait)

		const flags = CharacterImporter.importFlags(file)

		const items: ItemSource[] = []
		items.push(...ItemImporter.importItems(data.traits, { fileVersion: data.version }))
		items.push(...ItemImporter.importItems(data.skills, { fileVersion: data.version }))
		items.push(...ItemImporter.importItems(data.spells, { fileVersion: data.version }))
		items.push(...ItemImporter.importItems(data.equipment, { fileVersion: data.version }))
		items.push(...ItemImporter.importItems(data.other_equipment, { other: true, fileVersion: data.version }))
		items.push(...ItemImporter.importItems(data.notes, { fileVersion: data.version }))

		const name = data.profile?.name ?? document.name ?? LocalizeGURPS.translations.TYPES.Actor[ActorType.Character]

		const actorData: DeepPartial<ActorSource> = {
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

	static importPointsRecord(data: ImportedPointsRecord[]): PointsRecord[] {
		return data.map(e => {
			e.reason ??= ""
			return e
		}) as PointsRecord[]
	}

	static importProfile(data?: ImportedCharacterProfile): SourceFromSchema<CharacterProfileSchema> {
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

	static importSettings(
		data?: ImportedSheetSettings,
		third_party?: ImportedThirdPartyData,
	): SourceFromSchema<SheetSettingsSchema> {
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
			default_length_units: data?.default_length_units ?? Length.Unit.FeetAndInches,
			default_weight_units: data?.default_weight_units ?? Weight.Unit.Pound,
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

	static importAttributeSettings(data?: ImportedAttributeDef[]): SourceFromSchema<AttributeDefSchema>[] {
		return (
			data?.map((e, index) => {
				return {
					id: e.id,
					type: e.type,
					name: e.name,
					full_name: e.full_name ?? "",
					base: e.attribute_base ?? "",
					cost_per_point: e.cost_per_point ?? 0,
					cost_adj_percent_per_sm: e.cost_adj_percent_per_sm ?? 0,
					thresholds: CharacterImporter.importThresholds(e.thresholds),
					order: index,
				}
			}) ?? []
		)
	}

	static importResourceTrackerSettings(
		data?: ImportedResourceTrackerDef[],
	): SourceFromSchema<ResourceTrackerDefSchema>[] {
		return (
			data?.map((e, index) => {
				return {
					id: e.id,
					base: "",
					name: e.name,
					full_name: e.full_name ?? "",
					min: e.min ?? 0,
					max: e.max ?? 0,
					isMinEnforced: e.isMinEnforced ?? false,
					isMaxEnforced: e.isMaxEnforced ?? false,
					thresholds: CharacterImporter.importThresholds(e.thresholds),
					order: index,
				}
			}) ?? []
		)
	}

	static importMoveTypeSettings(data?: ImportedMoveTypeDef[]): SourceFromSchema<MoveTypeDefSchema>[] {
		return (
			data?.map((e, index) => {
				return {
					id: e.id,
					name: e.name,
					base: e.base ?? "",
					overrides: CharacterImporter.importMoveTypeOverrides(e.overrides),
					order: index,
					cost_per_point: e.cost_per_point ?? null,
				}
			}) ?? []
		)
	}

	static importMoveTypeOverrides(data?: ImportedMoveTypeOverride[]): SourceFromSchema<MoveTypeOverrideSchema>[] {
		return data ?? []
	}

	static importThresholds(data?: ImportedThreshold[]): SourceFromSchema<PoolThresholdSchema>[] {
		return (
			data?.map(e => {
				return {
					state: e.state,
					explanation: e.explanation ?? "",
					expression: e.expression,
					ops: e.ops ?? [],
				}
			}) ?? []
		)
	}

	static importBody(data?: ImportedBody): BodySource {
		return {
			name: data?.name ?? "",
			roll: data?.roll ?? "",
			locations: CharacterImporter.importHitLocations(data?.locations),
		}
	}

	static importHitLocations(data?: ImportedHitLocation[]): HitLocationSource[] {
		return (
			data?.map(e => {
				const location = {
					id: e.id,
					choice_name: e.choice_name,
					table_name: e.table_name,
					slots: e.slots ?? 0,
					hit_penalty: e.hit_penalty ?? 0,
					dr_bonus: e.dr_bonus ?? 0,
					description: e.description ?? "",
					sub_table: e.sub_table ? CharacterImporter.importBody(e.sub_table) : null,
				}
				return location
			}) ?? []
		)
	}

	static importAttributes(data?: ImportedAttribute[]): SourceFromSchema<AttributeSchema>[] {
		return (
			data?.map(att => {
				return {
					id: att.attr_id,
					adj: att.adj,
					damage: att.damage ?? 0,
					apply_ops: null,
				}
			}) ?? []
		)
	}

	static importResourceTrackers(data?: ImportedResourceTracker[]): SourceFromSchema<ResourceTrackerSchema>[] {
		return data ?? []
	}

	static importMoveTypes(data?: ImportedMoveType[]): SourceFromSchema<MoveTypeSchema>[] {
		return (
			data?.map(e => {
				return {
					id: e.id,
					adj: e.adj ?? 0,
				}
			}) ?? []
		)
	}

	static importMoveData(data?: ImportedMoveData): CharacterMove {
		const maneuver = ManeuverManager.maneuvers.get(ManeuverID.DoNothing) ?? null
		return data ?? { maneuver, posture: "standing", type: "ground" }
	}

	static importPortrait(data?: string): ImageFilePath {
		// if (game.user?.hasPermission(foundry.CONST.USER_PERMISSIONS.FILES_UPLOAD))
		if (game.user?.hasPermission("FILES_UPLOAD")) return `data:image/png;base64,${data}.png`
		return `/systems/${SYSTEM_NAME}/assets/icons/character.svg`
	}

	static importFlags(file: { text: string; path: string; name: string }): CharacterFlags {
		const flags = CharacterFlagDefaults

		const time = getCurrentTime()

		flags[SYSTEM_NAME][ActorFlags.Import] = { name: file.name, path: file.path, last_import: time }

		return flags
	}
}
