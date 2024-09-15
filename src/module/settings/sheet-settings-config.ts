import { SETTINGS, SYSTEM_NAME } from "@module/data/constants.ts"
import fields = foundry.data.fields
import api = foundry.applications.api
import { PageSettings, BlockLayoutString } from "@module/data/sheet-settings.ts"
import { progression, Length, Weight, display, paper } from "@util"

class DefaultSheetSettings extends foundry.abstract.DataModel<null, SheetSettingsSchema> {
	static override defineSchema(): SheetSettingsSchema {
		const fields = foundry.data.fields
		return {
			page: new fields.ObjectField<PageSettings>({
				initial: {
					paper_size: paper.Size.Letter,
					orientation: paper.Orientation.Portrait,
					top_margin: "0.25 in",
					left_margin: "0.25 in",
					bottom_margin: "0.25 in",
					right_margin: "0.25 in",
				},
			}),
			block_layout: new fields.ArrayField(new fields.StringField(), {
				initial: [
					"reactions conditional_modifiers",
					"traits skills",
					"spells",
					"equipment",
					"other_equipment",
					"notes",
				],
			}),
			damage_progression: new fields.StringField({ initial: progression.Option.BasicSet }),
			default_length_units: new fields.StringField({ initial: Length.Unit.FeetAndInches }),
			default_weight_units: new fields.StringField({ initial: Weight.Unit.Pound }),
			user_description_display: new fields.StringField({
				initial: display.Option.Tooltip,
			}),
			modifiers_display: new fields.StringField({ initial: display.Option.Inline }),
			notes_display: new fields.StringField({ initial: display.Option.Inline }),
			skill_level_adj_display: new fields.StringField({
				initial: display.Option.Tooltip,
			}),
			use_multiplicative_modifiers: new fields.BooleanField({ initial: false }),
			use_modifying_dice_plus_adds: new fields.BooleanField({ initial: false }),
			use_half_stat_defaults: new fields.BooleanField({ initial: false }),
			show_trait_modifier_adj: new fields.BooleanField({ initial: false }),
			show_equipment_modifier_adj: new fields.BooleanField({ initial: false }),
			show_spell_adj: new fields.BooleanField({ initial: true }),
			use_title_in_footer: new fields.BooleanField({ initial: false }),
			exclude_unspent_points_from_total: new fields.BooleanField({
				initial: false,
			}),
		}
	}
}

type SheetSettingsSchema = {
	page: fields.ObjectField<PageSettings>
	block_layout: fields.ArrayField<fields.StringField<BlockLayoutString>>
	damage_progression: fields.StringField<progression.Option, progression.Option, true, false, true>
	default_length_units: fields.StringField<Length.Unit, Length.Unit, true, false, true>
	default_weight_units: fields.StringField<Weight.Unit, Weight.Unit, true, false, true>
	user_description_display: fields.StringField<display.Option, display.Option, true, false, true>
	modifiers_display: fields.StringField<display.Option, display.Option, true, false, true>
	notes_display: fields.StringField<display.Option, display.Option, true, false, true>
	skill_level_adj_display: fields.StringField<display.Option, display.Option, true, false, true>
	use_multiplicative_modifiers: fields.BooleanField<boolean, boolean, true, false, true>
	use_modifying_dice_plus_adds: fields.BooleanField<boolean, boolean, true, false, true>
	use_half_stat_defaults: fields.BooleanField<boolean, boolean, true, false, true>
	show_trait_modifier_adj: fields.BooleanField<boolean, boolean, true, false, true>
	show_equipment_modifier_adj: fields.BooleanField<boolean, boolean, true, false, true>
	show_spell_adj: fields.BooleanField<boolean, boolean, true, false, true>
	use_title_in_footer: fields.BooleanField<boolean, boolean, true, false, true>
	exclude_unspent_points_from_total: fields.BooleanField<boolean, boolean, true, false, true>
}

class SheetSettingsConfig extends api.HandlebarsApplicationMixin(api.ApplicationV2) {
	constructor(object?: object, options?: Partial<ApplicationConfiguration>) {
		console.log(object, options)
		super(options ?? {})
	}

	static override DEFAULT_OPTIONS = {
		id: "color-config",
		tag: "form",
		window: {
			contentClasses: ["standard-form"],
			icon: "fa-solid fa-palette",
			title: "GURPS.Settings.SheetSettingsConfig.Title",
		},
		position: {
			width: 660,
			height: "auto",
		},
		form: {
			submitOnChange: false,
			closeOnSubmit: false,
			handler: SheetSettingsConfig.#onSubmit,
		},
		actions: {
			reset: SheetSettingsConfig.#onReset,
		},
	}

	static override PARTS = {
		colors: {
			id: "colors",
			template: `systems/${SYSTEM_NAME}/templates/apps/color-config.hbs`,
			scrollable: [".colors-list"],
		},
		footer: {
			template: "templates/generic/form-footer.hbs",
		},
	}

	static registerSettings(): void {
		game.settings.register(SYSTEM_NAME, SETTINGS.COLORS, {
			name: "",
			scope: "client",
			type: DefaultSheetSettings,
			default: new DefaultSheetSettings(),
		})
	}

	override async _prepareContext(_options = {}) {
		const current = await game.settings.get(SYSTEM_NAME, SETTINGS.DEFAULT_SHEET_SETTINGS)
		return {
			settings: current,
			buttons: [
				{
					type: "reset",
					action: "reset",
					icon: "fa-solid fa-sync",
					label: "GURPS.Settings.SheetSettingsConfig.Reset",
				},
				{ type: "submit", icon: "fa-solid fa-save", label: "GURPS.Settings.SheetSettingsConfig.Submit" },
			],
		}
	}

	static async #onSubmit(
		event: Event | SubmitEvent,
		form: HTMLFormElement,
		formData: FormDataExtended,
	): Promise<void> {
		console.log(event)
		console.log(form)
		console.log(formData)
	}

	static async #onReset(...args: any[]): Promise<void> {
		console.log(args)
	}
}

export { SheetSettingsConfig, DefaultSheetSettings, type SheetSettingsSchema }
