import { SETTINGS, SYSTEM_NAME } from "@data"
import { PartialSettingsData, SettingsMenuGURPS } from "./menu.ts"
import { LengthUnits, WeightUnits } from "@util"
import { display } from "@util/enum/display.ts"
import { progression } from "@util/enum/progression.ts"

type ConfigGURPSListName = (typeof DefaultSheetSettings.SETTINGS)[number]

export class DefaultSheetSettings extends SettingsMenuGURPS {
	static override readonly namespace = SETTINGS.DEFAULT_SHEET_SETTINGS

	static override readonly SETTINGS = ["settings", "initial_points", "tech_level", "populate_description"]

	static override get defaultOptions(): FormApplicationOptions {
		const options = super.defaultOptions
		options.classes.push("gurps")
		options.classes.push("settings-menu")

		return fu.mergeObject(options, {
			title: `gurps.settings.${this.namespace}.name`,
			id: `${this.namespace}-settings`,
			template: `systems/${SYSTEM_NAME}/templates/system/settings/${this.namespace}.hbs`,
			width: 480,
			height: "auto",
			submitOnClose: true,
			submitOnChange: true,
			closeOnSubmit: false,
			resizable: true,
		} as FormApplicationOptions)
	}

	protected static override get settings(): Record<ConfigGURPSListName, PartialSettingsData> {
		return {
			settings: {
				prefix: this.namespace,
				name: "",
				hint: "",
				type: Object,
				default: {
					default_length_units: LengthUnits.FeetAndInches,
					default_weight_units: WeightUnits.Pound,
					user_description_display: display.Option.Tooltip,
					modifiers_display: display.Option.Inline,
					notes_display: display.Option.Inline,
					skill_level_adj_display: display.Option.Tooltip,
					use_multiplicative_modifiers: false,
					use_modifying_dice_plus_adds: false,
					damage_progression: progression.Option.BasicSet,
					show_trait_modifier_adj: false,
					show_equipment_modifier_adj: false,
					show_spell_adj: true,
					use_title_in_footer: false,
					exclude_unspent_points_from_total: false,
					block_layout: [
						"reactions conditional_modifiers",
						"melee",
						"ranged",
						"traits skills",
						"spells",
						"equipment",
						"other_equipment",
						"notes",
					],
				},
			},
			initial_points: {
				prefix: this.namespace,
				name: "",
				hint: "",
				type: Number,
				default: 250,
			},
			tech_level: {
				prefix: this.namespace,
				name: "",
				hint: "",
				type: String,
				default: "3",
			},
			populate_description: {
				prefix: this.namespace,
				name: "",
				hint: "",
				type: Boolean,
				default: true,
			},
		}
	}

	protected _onDataImport(_event: MouseEvent): void {}

	protected _onDataExport(_event: MouseEvent): void {}

	override async _onResetAll(event: Event): Promise<void> {
		event.preventDefault()
		game.settings.set(
			SYSTEM_NAME,
			`${SETTINGS.DEFAULT_SHEET_SETTINGS}.settings`,
			game.settings.settings.get(`${SYSTEM_NAME}.${SETTINGS.DEFAULT_SHEET_SETTINGS}.settings`).default,
		)
		game.settings.set(
			SYSTEM_NAME,
			`${SETTINGS.DEFAULT_SHEET_SETTINGS}.initial_points`,
			game.settings.settings.get(`${SYSTEM_NAME}.${SETTINGS.DEFAULT_SHEET_SETTINGS}.initial_points`).default,
		)
		game.settings.set(
			SYSTEM_NAME,
			`${SETTINGS.DEFAULT_SHEET_SETTINGS}.tech_level`,
			game.settings.settings.get(`${SYSTEM_NAME}.${SETTINGS.DEFAULT_SHEET_SETTINGS}.tech_level`).default,
		)
		// game.settings.set(
		// 	SYSTEM_NAME,
		// 	`${SETTINGS.DEFAULT_SHEET_SETTINGS}.populate_description`,
		// 	game.settings.settings.get(`${SYSTEM_NAME}.${SETTINGS.DEFAULT_SHEET_SETTINGS}.populate_description`)
		// 		.default,
		// )
		this.render()
	}

	// override async getData(): Promise<any> {
	// 	const settings = game.settings.get(SYSTEM_NAME, `${this.namespace}.settings`)
	// 	const initial_points = game.settings.get(SYSTEM_NAME, `${this.namespace}.initial_points`)
	// 	const tech_level = game.settings.get(SYSTEM_NAME, `${this.namespace}.tech_level`)
	// 	const populate_description = game.settings.get(SYSTEM_NAME, `${this.namespace}.populate_description`)
	// 	return {
	// 		system: { settings: settings },
	// 		initial_points: initial_points,
	// 		tech_level: tech_level,
	// 		populate_description: populate_description,
	// 		actor: null,
	// 		config: CONFIG.GURPS,
	// 	}
	// }

	protected override async _updateObject(_event: Event, formData: Record<string, unknown>): Promise<void> {
		const settings: Record<string, unknown> = {}
		for (const k of ["initial_points", "tech_level", "populate_description"]) {
			await game.settings.set(SYSTEM_NAME, `${this.namespace}.${k}`, formData[k])
			delete formData[k]
		}
		if (typeof formData["system.settings.block_layout"] === "string")
			formData["system.settings.block_layout"] = formData["system.settings.block_layout"].split("\n")
		for (const k of Object.keys(formData)) {
			settings[k.replace(/^system\.settings\./g, "")] = formData[k]
		}
		await game.settings.set(SYSTEM_NAME, `${this.namespace}.settings`, settings)
	}
}
