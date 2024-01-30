import {
	EquipmentContainerSystemData,
	EquipmentSystemData,
	NoteContainerSystemData,
	NoteSystemData,
	RitualMagicSpellSystemData,
	SkillContainerSystemData,
	SkillSystemData,
	SpellContainerSystemData,
	TechniqueSystemData,
	TraitContainerSystemData,
	TraitSystemData,
} from "@item"
import { CharacterSystemSource, CharacterThirdPartyData } from "./data.ts"
import { SpellSystemData } from "@item/spell/data.ts"
import { AttributeObj } from "@sytem/attribute/data.ts"
import { LengthUnits, LocalizeGURPS, WeightUnits } from "@util"
import { SETTINGS, SYSTEM_NAME } from "@module/data/misc.ts"
import { DialogGURPS } from "@ui"
import { ActorType, CharacterGURPS, LootGURPS } from "@actor"
import { CharacterSheetGURPS } from "./sheet.ts"
import { ActorFlags } from "@actor/base/data.ts"
import { ItemGURPS } from "@item/base/document.ts"
import { ImportUtils } from "@util/import.ts"
import { USER_PERMISSIONS } from "types/foundry/common/constants.js"
import { display } from "@util/enum/display.ts"
import { progression } from "@util/enum/progression.ts"

export interface CharacterImportedData extends Omit<CharacterSystemSource, "attributes"> {
	traits: (TraitSystemData | TraitContainerSystemData)[]
	skills: (SkillSystemData | TechniqueSystemData | SkillContainerSystemData)[]
	spells: (SpellSystemData | RitualMagicSpellSystemData | SpellContainerSystemData)[]
	equipment: (EquipmentSystemData | EquipmentContainerSystemData)[]
	other_equipment: (EquipmentSystemData | EquipmentContainerSystemData)[]
	notes: (NoteSystemData | NoteContainerSystemData)[]
	attributes: AttributeObj[]
	third_party: Partial<CharacterThirdPartyData>
}

export class CharacterImporter {
	version: number

	declare document: CharacterGURPS | LootGURPS

	constructor(document?: CharacterGURPS | LootGURPS) {
		this.version = 4
		if (document) this.document = document
	}

	static showDialog(): void {
		setTimeout(async () => {
			new DialogGURPS(
				{
					title: LocalizeGURPS.translations.gurps.system.library_import.title_character,
					content: await renderTemplate(`systems/${SYSTEM_NAME}/templates/character-library-import.hbs`, {}),
					buttons: {
						import: {
							icon: '<i class="fas fa-file-import"></i>',
							label: LocalizeGURPS.translations.gurps.system.library_import.import,
							callback: async (html: HTMLElement | JQuery<HTMLElement>) => {
								const form = $(html).find("form")[0]
								const files = form.data.files as FileList
								if (!files.length)
									return ui.notifications?.error(
										LocalizeGURPS.translations.gurps.error.import.no_file,
									)
								else {
									const actors: { text: string; name: string; path: string }[] = []
									for (const file of Array.from(files)) {
										const text = await fu.readTextFromFile(file)
										actors.push({
											text: text,
											name: file.name,
											// @ts-expect-error path DOES exist on File
											path: file.path,
										})
									}
									return CharacterImporter.importCompendium(actors)
								}
							},
						},
						no: {
							icon: '<i class="fas fa-times"></i>',
							label: LocalizeGURPS.translations.gurps.system.library_import.cancel,
						},
					},
					default: "import",
				},
				{
					width: 400,
				},
			).render(true)
		}, 200)
	}

	static async importCompendium(files: { text: string; name: string; path: string }[]): Promise<void> {
		const label = files[0].path.split(/\\|\//).at(-2)!
		const name = label?.slugify()

		let pack = game.packs.find(p => p.metadata.name === name)
		if (!pack) {
			pack = await CompendiumCollection.createCompendium({
				type: "Actor",
				label: label,
				name: name,
				id: name,
				package: "world",
				packageName: name,
				packageType: "world",
				system: SYSTEM_NAME,
				path: "",
				private: "true",
			})
		}
		ui.notifications?.info(
			LocalizeGURPS.format(LocalizeGURPS.translations.gurps.system.library_import.start, { name: name }),
		)
		const importer = new CharacterImporter()
		const actors: Partial<CharacterSystemSource>[] = []
		files.forEach(async file => {
			await importer.importData(file).then(actor => actors.push(actor))
		})

		const counter = files.length
		await CharacterGURPS.createDocuments(actors as CharacterGURPS["_source"][], {
			pack: pack.collection,
			keepId: true,
		})
		ui.notifications?.info(
			LocalizeGURPS.format(LocalizeGURPS.translations.gurps.system.library_import.finished, {
				number: counter,
			}),
		)
	}

	static import(
		document: CharacterGURPS | LootGURPS,
		file: { text: string; name: string; path: string },
	): Promise<boolean> {
		const importer = new CharacterImporter(document)
		return importer._import(file)
	}

	async _import(file: { text: string; name: string; path: string }): Promise<boolean> {
		const errorMessages: string[] = []
		// const json = file.text
		// let r: CharacterImportedData
		// const errorMessages: string[] = []
		// try {
		// 	r = JSON.parse(json)
		// } catch (err) {
		// 	console.error(err)
		// 	errorMessages.push(LocalizeGURPS.translations.gurps.error.import.no_json_detected)
		// 	return this.throwImportError(errorMessages)
		// }
		const commit: Partial<CharacterSystemSource> = await this.importData(file, this.document)

		// let commit: Partial<CharacterSystemSource> = {}
		// const imp = (document as any).importData
		// imp.name = file.name ?? imp.name
		// imp.path = file.path ?? imp.path
		// imp.last_import = new Date().toISOString()
		// try {
		// 	if (r.version < this.version)
		// 		return this.throwImportError([
		// 			...errorMessages,
		// 			LocalizeGURPS.translations.gurps.error.import.format_old,
		// 		])
		// 	else if (r.version > this.version)
		// 		return this.throwImportError([
		// 			...errorMessages,
		// 			LocalizeGURPS.translations.gurps.error.import.format_new,
		// 		])
		// 	if (this.document?.type === ActorType.LegacyCharacter) {
		// 		commit = { ...commit, ...{ type: ActorType.Character } }
		// 	}
		// 	commit = { ...commit, ...{ "system.import": imp } }
		// 	commit = { ...commit, ...{ name: r.profile.name, "prototypeToken.name": r.profile.name } }
		// 	commit = { ...commit, ...this.importMiscData(r) }
		// 	commit = { ...commit, ...(await this.importProfile(r.profile)) }
		// 	commit = { ...commit, ...this.importSettings(r.settings) }
		// 	commit = { ...commit, ...this.importAttributes(r.attributes) }
		// 	commit = { ...commit, ...this.importResourceTrackers(r.third_party) }

		// 	// Begin item import
		// 	const items: Array<ItemGURPS> = []
		// 	items.push(...ImportUtils.importItems(r.traits))
		// 	items.push(...ImportUtils.importItems(r.skills))
		// 	items.push(...ImportUtils.importItems(r.spells))
		// 	items.push(...ImportUtils.importItems(r.equipment))
		// 	items.push(...ImportUtils.importItems(r.other_equipment, { container: null, other: true, sort: 0 }))
		// 	items.push(...ImportUtils.importItems(r.notes))
		// 	commit = { ...commit, ...{ items: items } }
		// } catch (err) {
		// 	console.error(err)
		// 	errorMessages.push(
		// 		LocalizeGURPS.format(LocalizeGURPS.translations.gurps.error.import.generic, {
		// 			name: r.profile.name,
		// 			message: (err as Error).message,
		// 		})
		// 	)
		// 	return this.throwImportError(errorMessages)
		// }

		try {
			if (this.document?.isToken) {
				await this.document.deleteEmbeddedDocuments("Item", [...this.document.items.keys()], { render: false })
			}
			await this.document?.update(commit, {
				diff: false,
				recursive: false,
			})
			if ((this.document?.sheet as unknown as CharacterSheetGURPS)?.config !== null) {
				;(this.document?.sheet as unknown as CharacterSheetGURPS)?.config?.render(true)
			}
		} catch (err) {
			console.error(err)
			errorMessages.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.error.import.generic, {
					name: commit.profile?.name || LocalizeGURPS.translations.TYPES.Actor.character_gcs,
					message: (err as Error).message,
				}),
			)
			return this.throwImportError(errorMessages)
		}
		return true
	}

	async importData(
		file: { text: string; name: string; path: string },
		document?: CharacterGURPS | LootGURPS,
	): Promise<Partial<CharacterSystemSource>> {
		const json = file.text
		let r: CharacterImportedData
		const errorMessages: string[] = []
		try {
			r = JSON.parse(json)
		} catch (err) {
			console.error(err)
			errorMessages.push(LocalizeGURPS.translations.gurps.error.import.no_json_detected)
			await this.throwImportError(errorMessages)
			return {}
		}

		let commit: Partial<CharacterSystemSource> = {}
		const imp = document?.importData ?? { name: "", path: "", last_import: "" }
		imp.name = file.name ?? imp.name
		imp.path = file.path ?? imp.path
		imp.last_import = new Date().toISOString()
		try {
			if (r.version < this.version)
				this.throwImportError([...errorMessages, LocalizeGURPS.translations.gurps.error.import.format_old])
			else if (r.version > this.version)
				this.throwImportError([...errorMessages, LocalizeGURPS.translations.gurps.error.import.format_new])
			if ((this.document as Actor).type === ActorType.LegacyCharacter) {
				commit = { ...commit, ...{ type: ActorType.Character } }
			}
			commit = {
				...commit,
				...{
					"system.import": imp,
					type: ActorType.Character,
					flags: {
						[SYSTEM_NAME]: {
							[ActorFlags.AutoThreshold]: { active: true },
							[ActorFlags.AutoEncumbrance]: { active: true },
							[ActorFlags.MoveType]: this.document?.getFlag(SYSTEM_NAME, ActorFlags.MoveType),
							[ActorFlags.AutoDamage]: { active: true },
						},
					},
				},
			}
			commit = {
				...commit,
				...{
					name: r.profile.name ?? LocalizeGURPS.translations.TYPES.Actor.character_gcs,
					"prototypeToken.name": r.profile.name ?? LocalizeGURPS.translations.TYPES.Actor.character_gcs,
				},
			}
			commit = { ...commit, ...this.importMiscData(r) }
			commit = { ...commit, ...(await this.importProfile(r.profile)) }
			commit = { ...commit, ...this.importSettings(r.settings) }
			commit = { ...commit, ...this.importAttributes(r.attributes) }
			commit = { ...commit, ...this.importThirdPartyData(r.third_party) }

			// Begin item import
			const items: ItemGURPS[] = []
			items.push(...ImportUtils.importItems(r.traits))
			items.push(...ImportUtils.importItems(r.skills))
			items.push(...ImportUtils.importItems(r.spells))
			items.push(...ImportUtils.importItems(r.equipment))
			items.push(...ImportUtils.importItems(r.other_equipment, { container: null, other: true, sort: 0 }))
			items.push(...ImportUtils.importItems(r.notes))
			commit = { ...commit, ...{ items: items } }
		} catch (err) {
			console.error(err)
			errorMessages.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.error.import.generic, {
					name: r.profile.name,
					message: (err as Error).message,
				}),
			)
			await this.throwImportError(errorMessages)
			return {}
		}
		return commit
	}

	importMiscData(data: CharacterImportedData): Record<string, unknown> {
		return {
			"system.version": data.version,
			"system.id": data.id,
			"system.created_date": data.created_date,
			"system.modified_date": data.modified_date,
			"system.total_points": data.total_points,
			"system.points_record": data.points_record || [],
		}
	}

	async importProfile(profile: CharacterImportedData["profile"]): Promise<Record<string, unknown>> {
		const r: Record<string, unknown> = {
			"system.profile.player_name": profile.player_name || "",
			"system.profile.name": profile.name || this.document?.name,
			"system.profile.title": profile.title || "",
			"system.profile.organization": profile.organization || "",
			"system.profile.age": profile.age || "",
			"system.profile.birthday": profile.birthday || "",
			"system.profile.eyes": profile.eyes || "",
			"system.profile.hair": profile.hair || "",
			"system.profile.skin": profile.skin || "",
			"system.profile.handedness": profile.handedness || "",
			"system.profile.height": profile.height || "",
			"system.profile.weight": profile.weight,
			"system.profile.SM": profile.SM || 0,
			"system.profile.gender": profile.gender || "",
			"system.profile.tech_level": profile.tech_level || "",
			"system.profile.religion": profile.religion || "",
		}

		if (profile.portrait) {
			if (game.user?.hasPermission(USER_PERMISSIONS.FILES_UPLOAD)) {
				r.img = `data:image/png;base64,${profile.portrait}.png`
			} else {
				console.error(LocalizeGURPS.translations.gurps.error.import.portrait_permissions)
				ui.notifications?.error(LocalizeGURPS.translations.gurps.error.import.portrait_permissions)
			}
		}
		return r
	}

	importSettings(settings: CharacterImportedData["settings"]): Record<string, unknown> {
		return {
			"system.settings.default_length_units": settings.default_length_units ?? LengthUnits.FeetAndInches,
			"system.settings.default_weight_units": settings.default_weight_units ?? WeightUnits.Pound,
			"system.settings.user_description_display": settings.user_description_display ?? display.Option.Tooltip,
			"system.settings.modifiers_display": settings.modifiers_display ?? display.Option.Inline,
			"system.settings.notes_display": settings.notes_display ?? display.Option.Inline,
			"system.settings.skill_level_adj_display": settings.skill_level_adj_display ?? display.Option.Tooltip,
			"system.settings.use_multiplicative_modifiers": settings.use_multiplicative_modifiers ?? false,
			"system.settings.use_modifying_dice_plus_adds": settings.use_modifying_dice_plus_adds ?? false,
			"system.settings.damage_progression": settings.damage_progression ?? progression.Option.BasicSet,
			"system.settings.show_trait_modifier_adj": settings.show_trait_modifier_adj ?? false,
			"system.settings.show_equipment_modifier_adj": settings.show_equipment_modifier_adj ?? false,
			"system.settings.show_spell_adj": settings.show_spell_adj ?? false,
			"system.settings.use_title_in_footer": settings.use_title_in_footer ?? false,
			"system.settings.exclude_unspent_points_from_total": settings.exclude_unspent_points_from_total ?? false,
			"system.settings.page": settings.page,
			"system.settings.block_layout": settings.block_layout,
			"system.settings.attributes": settings.attributes,
			"system.settings.resource_trackers": [],
			"system.settings.body_type": settings.body_type,
		}
	}

	importAttributes(attributes: AttributeObj[]): Record<string, unknown> {
		return {
			"system.attributes": attributes,
		}
	}

	importThirdPartyData(tp: Partial<CharacterThirdPartyData>): Record<string, unknown> {
		if (tp)
			return {
				"system.settings.resource_trackers": tp.settings?.resource_trackers ?? [],
				"system.resource_trackers": tp.resource_trackers ?? [],
				"system.settings.move_types": tp.settings?.move_types ?? [],
				"system.move_types": tp.move_types ?? [],
			}
		let data: Record<string, unknown> = {}
		if (this.document instanceof CharacterGURPS) {
			if (this.document.system.settings.resource_trackers.length > 0)
				data = {
					...data,
					"system.settings.resource_trackers": this.document.system.settings.resource_trackers,
					"system.resource_trackers": this.document.system.resource_trackers,
				}
			else {
				const tracker_defs = game.settings.get(
					SYSTEM_NAME,
					`${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`,
				)
				data = {
					...data,
					"system.settings.resource_trackers": tracker_defs,
					"system.resource_trackers": this.document.newTrackers(tracker_defs),
				}
			}
			if (this.document.system.settings.move_types.length > 0)
				data = {
					...data,
					"system.settings.move_types": this.document.system.settings.move_types,
					"system.move_types": this.document.system.move_types,
				}
			else {
				const move_types = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`)
				data = {
					...data,
					"system.settings.move_types": move_types,
					"system.move_types": this.document.newMoveTypes(move_types),
				}
			}
		}
		return data
	}

	async throwImportError(msg: string[]): Promise<boolean> {
		ui.notifications?.error(msg.join("<br>"))

		await ChatMessage.create({
			content: await renderTemplate(`systems/${SYSTEM_NAME}/templates/chat/character-import-error.hbs`, {
				lines: msg,
			}),
			user: game.user!.id,
			type: CONST.CHAT_MESSAGE_TYPES.WHISPER,
			whisper: [game.user!.id],
		})
		return false
	}
}
