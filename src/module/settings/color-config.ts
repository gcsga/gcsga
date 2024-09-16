import { SETTINGS, SYSTEM_NAME } from "@module/data/constants.ts"
import fields = foundry.data.fields
import api = foundry.applications.api

class ColorSettings extends foundry.abstract.DataModel<null, ColorSettingsSchema> {
	static override defineSchema(): ColorSettingsSchema {
		const fields = foundry.data.fields
		return {
			banding: new fields.SchemaField(ColorSettingsEntry.defineSchema(), {
				initial: { light: "#E8E8D8", dark: "#282820", lightForeground: "#000000", darkForeground: "#FFFFFF" },
			}),
			error: new fields.SchemaField(ColorSettingsEntry.defineSchema(), {
				initial: { light: "#851414", dark: "#851414", lightForeground: "#000000", darkForeground: "#FFFFFF" },
			}),
			focus: new fields.SchemaField(ColorSettingsEntry.defineSchema(), {
				initial: { light: "#006199", dark: "#0080CC", lightForeground: "#000000", darkForeground: "#FFFFFF" },
			}),
			header: new fields.SchemaField(ColorSettingsEntry.defineSchema(), {
				initial: { light: "#2B2B2B", dark: "#404040", lightForeground: "#000000", darkForeground: "#FFFFFF" },
			}),
			surface: new fields.SchemaField(ColorSettingsEntry.defineSchema(), {
				initial: { light: "#E8E8E8", dark: "#282828", lightForeground: "#000000", darkForeground: "#FFFFFF" },
			}),
			tooltip: new fields.SchemaField(ColorSettingsEntry.defineSchema(), {
				initial: { light: "#FFF4C6", dark: "#FFF299", lightForeground: "#000000", darkForeground: "#FFFFFF" },
			}),
			warning: new fields.SchemaField(ColorSettingsEntry.defineSchema(), {
				initial: { light: "#D94C00", dark: "#BF4300", lightForeground: "#000000", darkForeground: "#FFFFFF" },
			}),
		}
	}
}

interface ColorSettings extends ModelPropsFromSchema<ColorSettingsSchema> {}

type ColorSettingsSchema = {
	banding: fields.SchemaField<ColorSettingsEntrySchema>
	error: fields.SchemaField<ColorSettingsEntrySchema>
	focus: fields.SchemaField<ColorSettingsEntrySchema>
	header: fields.SchemaField<ColorSettingsEntrySchema>
	surface: fields.SchemaField<ColorSettingsEntrySchema>
	tooltip: fields.SchemaField<ColorSettingsEntrySchema>
	warning: fields.SchemaField<ColorSettingsEntrySchema>
}

class ColorSettingsEntry extends foundry.abstract.DataModel<ColorSettings, ColorSettingsEntrySchema> {
	static override defineSchema(): ColorSettingsEntrySchema {
		const fields = foundry.data.fields
		return {
			light: new fields.ColorField(),
			dark: new fields.ColorField(),
			lightForeground: new fields.ColorField(),
			darkForeground: new fields.ColorField(),
		}
	}
}

type ColorSettingsEntrySchema = {
	light: fields.ColorField<true, false, true>
	dark: fields.ColorField<true, false, true>
	lightForeground: fields.ColorField<true, false, true>
	darkForeground: fields.ColorField<true, false, true>
}

class ColorConfig extends api.HandlebarsApplicationMixin(api.ApplicationV2) {
	static override DEFAULT_OPTIONS = {
		id: "color-config",
		tag: "form",
		window: {
			contentClasses: ["standard-form"],
			icon: "fa-solid fa-palette",
			title: "GURPS.Settings.ColorConfig.Title",
		},
		position: {
			width: 660,
			height: "auto",
		},
		form: {
			handler: ColorConfig.#onSubmit,
			submitOnChange: false,
			closeOnSubmit: true,
		},
		actions: {
			reset: ColorConfig.#onReset,
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
			type: ColorSettings,
			default: new ColorSettings(),
		})
	}

	override async _prepareContext(_options = {}) {
		// const current = await game.settings.get(SYSTEM_NAME, SETTINGS.COLORS)
		const current = game.settings.get(SYSTEM_NAME, SETTINGS.COLORS)
		return {
			colors: this.#prepareColors(current),
			buttons: [
				{ type: "reset", action: "reset", icon: "fa-solid fa-sync", label: "GURPS.Settings.ColorConfig.Reset" },
				{ type: "submit", icon: "fa-solid fa-save", label: "GURPS.Settings.ColorConfig.Submit" },
			],
		}
	}

	#prepareColors(current: ColorSettings): Record<string, SourceFromSchema<ColorSettingsEntrySchema>> {
		const fields: Record<string, any> = {}

		for (const key of Object.keys(current.schema.fields)) {
			const light = current[key as keyof ColorSettingsSchema].light
			const dark = current[key as keyof ColorSettingsSchema].dark
			fields[key] = {
				name: key,
				label: `GURPS.Settings.ColorConfig.Fields.${key}.Label`,
				hint: `GURPS.Settings.ColorConfig.Fields.${key}.Hint`,
				light: light.toString(),
				dark: dark.toString(),
			}
		}
		return fields
	}

	// https://24ways.org/2010/calculating-color-contrast
	private static _getContrastingForeground(hexColor: HexColorString): HexColorString {
		const r = parseInt(hexColor.substring(1, 3), 16)
		const g = parseInt(hexColor.substring(3, 5), 16)
		const b = parseInt(hexColor.substring(5, 7), 16)
		const yiq = (r * 299 + g * 587 + b * 114) / 1000
		return yiq >= 128 ? "#000000" : "#FFFFFF"
	}

	static async #onSubmit(
		event: Event | SubmitEvent,
		_form: HTMLFormElement,
		formData: FormDataExtended,
	): Promise<void> {
		event.preventDefault()
		let current = game.settings.get(SYSTEM_NAME, SETTINGS.COLORS).toObject()
		current = fu.mergeObject(current, formData.object)
		for (const key of ColorSettings.schema.keys() as (keyof ColorSettingsSchema)[]) {
			current[key].lightForeground = ColorConfig._getContrastingForeground(current[key].light)
			current[key].darkForeground = ColorConfig._getContrastingForeground(current[key].dark)
		}
		await game.settings.set(SYSTEM_NAME, SETTINGS.COLORS, current)
		ui.notifications.info("GURPS.Settings.ColorConfig.MessageSubmit", { localize: true })
	}

	static async #onReset(event: Event): Promise<void> {
		event.preventDefault()
		const defaults = game.settings.settings.get(`${SYSTEM_NAME}.${SETTINGS.COLORS}`).default
		await game.settings.set(SYSTEM_NAME, SETTINGS.COLORS, defaults)
		ui.notifications.info("GURPS.Settings.ColorConfig.MessageReset", { localize: true })
		// HACK: to fix when types catch up
		await (this as unknown as api.ApplicationV2).render()
	}
}

export { ColorConfig, ColorSettings }
