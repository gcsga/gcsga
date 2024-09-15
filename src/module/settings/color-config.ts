import { SETTINGS, SYSTEM_NAME } from "@module/data/constants.ts"
import fields = foundry.data.fields
import api = foundry.applications.api

class ColorSettings extends foundry.abstract.DataModel<null, ColorSettingsSchema> {
	static override defineSchema(): ColorSettingsSchema {
		const fields = foundry.data.fields
		return {
			banding: new fields.SchemaField(ColorSettingsEntry.defineSchema(), {
				initial: { light: "#E8E8D8", dark: "#282820" },
			}),
			error: new fields.SchemaField(ColorSettingsEntry.defineSchema(), {
				initial: { light: "#851414", dark: "#851414" },
			}),
			focus: new fields.SchemaField(ColorSettingsEntry.defineSchema(), {
				initial: { light: "#006199", dark: "#0080CC" },
			}),
			header: new fields.SchemaField(ColorSettingsEntry.defineSchema(), {
				initial: { light: "#2B2B2B", dark: "#404040" },
			}),
			surface: new fields.SchemaField(ColorSettingsEntry.defineSchema(), {
				initial: { light: "#E8E8E8", dark: "#282828" },
			}),
			tooltip: new fields.SchemaField(ColorSettingsEntry.defineSchema(), {
				initial: { light: "#FFF4C6", dark: "#FFF299" },
			}),
			warning: new fields.SchemaField(ColorSettingsEntry.defineSchema(), {
				initial: { light: "#D94C00", dark: "#BF4300" },
			}),
		}
	}
}

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
		}
	}
}

type ColorSettingsEntrySchema = {
	light: fields.ColorField<true, false, true>
	dark: fields.ColorField<true, false, true>
}

class ColorConfig extends api.HandlebarsApplicationMixin(api.ApplicationV2) {
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
			title: "GURPS.Settings.ColorConfig.Title",
		},
		position: {
			width: 660,
			height: "auto",
		},
		form: {
			submitOnChange: false,
			closeOnSubmit: false,
			handler: ColorConfig.#onSubmit,
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
		const current = await game.settings.get(SYSTEM_NAME, SETTINGS.COLORS)
		return {
			colors: this.#prepareColors(current),
			buttons: [
				{ type: "reset", action: "reset", icon: "fa-solid fa-sync", label: "GURPS.Settings.ColorConfig.Reset" },
				{ type: "submit", icon: "fa-solid fa-save", label: "GURPS.Settings.ColorConfig.Submit" },
			],
		}
	}

	#prepareColors(current: ColorSettings): Record<string, SourceFromSchema<ColorSettingsEntrySchema>> {
		const colors: Record<string, SourceFromSchema<ColorSettingsEntrySchema>> = {}

		for (const key in current) {
			if (
				typeof current[key] === "object" &&
				current[key] !== null &&
				"light" in current[key] &&
				"dark" in current[key] &&
				typeof (current[key] as SourceFromSchema<ColorSettingsEntrySchema>)["light"] === "string" &&
				typeof (current[key] as SourceFromSchema<ColorSettingsEntrySchema>)["dark"] === "string"
			) {
				colors[key] = current[key] as SourceFromSchema<ColorSettingsEntrySchema>
			}
		}
		return colors
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

export { ColorConfig, ColorSettings }
