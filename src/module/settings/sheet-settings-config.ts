import { SETTINGS, SYSTEM_NAME } from "@module/data/constants.ts"
import fields = foundry.data.fields
import api = foundry.applications.api
import { progression, Length, Weight, display } from "@util"
import { SheetSettings } from "@module/data/sheet-settings.ts"

class DefaultSheetSettings extends foundry.abstract.DataModel<null, SheetSettingsSchema> {
	static override defineSchema(): SheetSettingsSchema {
		const fields = foundry.data.fields
		return {
			damage_progression: new fields.StringField({
				required: true,
				nullable: false,
				choices: progression.OptionsChoices,
				initial: progression.Option.BasicSet,
				label: "GURPS.Settings.SheetSettings.FIELDS.damage_progression.Name",
				hint: "test hint",
			}),
			default_length_units: new fields.StringField({
				required: true,
				nullable: false,
				choices: Length.UnitChoices,
				initial: Length.Unit.FeetAndInches,
				label: "GURPS.Settings.SheetSettings.FIELDS.default_length_units.Name",
			}),
			default_weight_units: new fields.StringField({
				required: true,
				nullable: false,
				choices: Weight.UnitChoices,
				initial: Weight.Unit.Pound,
				label: "GURPS.Settings.SheetSettings.FIELDS.default_weight_units.Name",
			}),
			user_description_display: new fields.StringField({
				required: true,
				nullable: false,
				choices: display.OptionsChoices,
				initial: display.Option.Tooltip,
				label: "GURPS.Settings.SheetSettings.FIELDS.user_description_display.Name",
			}),
			modifiers_display: new fields.StringField({
				required: true,
				nullable: false,
				choices: display.OptionsChoices,
				initial: display.Option.Inline,
				label: "GURPS.Settings.SheetSettings.FIELDS.modifiers_display.Name",
			}),
			notes_display: new fields.StringField({
				required: true,
				nullable: false,
				choices: display.OptionsChoices,
				initial: display.Option.Inline,
				label: "GURPS.Settings.SheetSettings.FIELDS.notes_display.Name",
			}),
			skill_level_adj_display: new fields.StringField({
				required: true,
				nullable: false,
				choices: display.OptionsChoices,
				initial: display.Option.Tooltip,
				label: "GURPS.Settings.SheetSettings.FIELDS.skill_level_adj_display.Name",
			}),
			use_multiplicative_modifiers: new fields.BooleanField({
				required: true,
				nullable: false,
				initial: false,
				label: "GURPS.Settings.SheetSettings.FIELDS.use_multiplicative_modifiers.Name",
			}),
			use_modifying_dice_plus_adds: new fields.BooleanField({
				required: true,
				nullable: false,
				initial: false,
				label: "GURPS.Settings.SheetSettings.FIELDS.use_modifying_dice_plus_adds.Name",
			}),
			use_half_stat_defaults: new fields.BooleanField({
				required: true,
				nullable: false,
				initial: false,
				label: "GURPS.Settings.SheetSettings.FIELDS.use_half_stat_defaults.Name",
			}),
			show_trait_modifier_adj: new fields.BooleanField({
				required: true,
				nullable: false,
				initial: false,
				label: "GURPS.Settings.SheetSettings.FIELDS.show_trait_modifier_adj.Name",
			}),
			show_equipment_modifier_adj: new fields.BooleanField({
				required: true,
				nullable: false,
				initial: false,
				label: "GURPS.Settings.SheetSettings.FIELDS.show_equipment_modifier_adj.Name",
			}),
			show_spell_adj: new fields.BooleanField({
				required: true,
				nullable: false,
				initial: true,
				label: "GURPS.Settings.SheetSettings.FIELDS.show_spell_adj.Name",
			}),
			exclude_unspent_points_from_total: new fields.BooleanField({
				required: true,
				nullable: false,
				initial: false,
				label: "GURPS.Settings.SheetSettings.FIELDS.exclude_unspent_points_from_total.Name",
			}),
		}
	}
}

type SheetSettingsSchema = {
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
	exclude_unspent_points_from_total: fields.BooleanField<boolean, boolean, true, false, true>
}

class SheetSettingsConfig extends api.HandlebarsApplicationMixin(api.ApplicationV2) {
	static override DEFAULT_OPTIONS = {
		id: "sheet-settings-config",
		tag: "form",
		window: {
			contentClasses: ["standard-form"],
			icon: "fa-solid fa-palette",
			title: "GURPS.Settings.SheetSettings.Title",
		},
		position: {
			width: 660,
			height: "auto",
		},
		form: {
			submitOnChange: false,
			closeOnSubmit: true,
			handler: SheetSettingsConfig.#onSubmit,
		},
		actions: {
			reset: SheetSettingsConfig.#onReset,
		},
	}

	static override PARTS = {
		sheetSettings: {
			id: "sheet-settings",
			template: `systems/${SYSTEM_NAME}/templates/apps/sheet-settings-config.hbs`,
		},
		footer: {
			template: "templates/generic/form-footer.hbs",
		},
	}

	static registerSettings(): void {
		game.settings.register(SYSTEM_NAME, SETTINGS.DEFAULT_SHEET_SETTINGS, {
			name: "",
			scope: "world",
			type: DefaultSheetSettings,
			default: new DefaultSheetSettings(),
		})
	}

	override async _prepareContext(_options = {}) {
		const current = game.settings.get(SYSTEM_NAME, SETTINGS.DEFAULT_SHEET_SETTINGS)
		return {
			fields: SheetSettings.schema.fields,
			source: current,
			buttons: [
				{
					type: "reset",
					action: "reset",
					icon: "fa-solid fa-sync",
					label: "GURPS.Settings.SheetSettings.Reset",
				},
				{ type: "submit", icon: "fa-solid fa-save", label: "GURPS.Settings.SheetSettings.Submit" },
			],
		}
	}

	protected override _onRender(context: object, options: ApplicationRenderOptions): void {
		// Set the initial value for the progression hint text
		const progressionField = this.element.querySelector(`select[name="damage_progression"]`) as HTMLSelectElement
		const hintElement = this.element.querySelector("div.form-group.damage-progression p.hint") as HTMLElement
		console.log(progressionField)
		console.log(hintElement)
		const progressionValue = progressionField?.value as progression.Option
		const hintText = game.i18n.localize(progression.Option.toAltString(progressionValue))
		if (hintElement) hintElement.innerHTML = hintText

		// Dynamically update the hint text wen the progression value is changed
		progressionField?.addEventListener("change", e => {
			e.preventDefault()
			e.stopImmediatePropagation()
			const newValue = (e.currentTarget as any).value
			const hintText = game.i18n.localize(progression.Option.toAltString(newValue))
			if (hintElement) hintElement.innerHTML = hintText
		})
		return super._onRender(context, options)
	}

	static async #onSubmit(
		event: Event | SubmitEvent,
		_form: HTMLFormElement,
		formData: FormDataExtended,
	): Promise<void> {
		event.preventDefault()

		const data = new DefaultSheetSettings(formData.object as SheetSettingsSchema)
		game.settings.set(SYSTEM_NAME, SETTINGS.DEFAULT_SHEET_SETTINGS, data)
		ui.notifications.info("GURPS.Settings.SheetSettings.MessageSubmit", { localize: true })
	}

	static async #onReset(event: Event): Promise<void> {
		event.preventDefault()

		const defaults = game.settings.settings.get(`${SYSTEM_NAME}.${SETTINGS.DEFAULT_SHEET_SETTINGS}`).default
		await game.settings.set(SYSTEM_NAME, SETTINGS.DEFAULT_SHEET_SETTINGS, defaults)
		ui.notifications.info("GURPS.Settings.SheetSettings.MessageReset", { localize: true })
		// HACK: to fix when types catch up
		await (this as unknown as api.ApplicationV2).render()
	}
}

export { SheetSettingsConfig, DefaultSheetSettings, type SheetSettingsSchema }
