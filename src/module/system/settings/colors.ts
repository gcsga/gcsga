import { htmlClosest, htmlQuery } from "@util"
import { PartialSettingsData, SettingsMenuGURPS } from "./menu.ts"
import { SETTINGS, SYSTEM_NAME } from "@module/data/index.ts"

type ConfigGURPSListName = (typeof ColorSettings.SETTINGS)[number]

export class ColorSettings extends SettingsMenuGURPS {
	static override readonly namespace = SETTINGS.COLORS

	static override readonly SETTINGS = ["modePreference", "colors"] as const

	static override get defaultOptions(): FormApplicationOptions {
		const options = super.defaultOptions
		options.classes.push("gurps")
		options.classes.push("settings-menu")

		return fu.mergeObject(options, {
			title: `gurps.settings.${SETTINGS.COLORS}.name`,
			id: `${SETTINGS.COLORS}-settings`,
			template: `systems/${SYSTEM_NAME}/templates/system/settings/${SETTINGS.COLORS}.hbs`,
			width: 480,
			height: "auto",
			submitOnClose: false,
			submitOnChange: true,
			closeOnSubmit: false,
			resizable: true,
		} as FormApplicationOptions)
	}

	protected static override get settings(): Record<ConfigGURPSListName, PartialSettingsData> {
		return {
			modePreference: {
				prefix: SETTINGS.COLORS,
				name: "gurps.settings.colors.modePreference.name",
				hint: "gurps.settings.colors.modePreference.hint",
				default: "auto",
				type: String,
				choices: {
					auto: "gurps.select.color_mode_preference.auto",
					dark: "gurps.select.color_mode_preference.dark",
					light: "gurps.select.color_mode_preference.light",
				},
			},
			colors: {
				prefix: SETTINGS.COLORS,
				name: "colors temp",
				hint: "colors hint temp",
				type: Object,
				default: {
					colorBackground: { light: "#eeeeee", dark: "#303030" },
					colorOnBackground: { light: "#000000", dark: "#dddddd" },
					colorContent: { light: "#ffffff", dark: "#202020" },
					colorOnContent: { light: "#000000", dark: "#dddddd" },
					colorBanding: { light: "#ebebdc", dark: "#2a2a2a" },
					colorOnBanding: { light: "#000000", dark: "#dddddd" },
					colorHeader: { light: "#2b2b2b", dark: "#404040" },
					colorOnHeader: { light: "#ffffff", dark: "#c0c0c0" },
					colorFocusedTab: { light: "#e0d4af", dark: "#446600" },
					colorOnFocusedTab: { light: "#000000", dark: "#dddddd" },
					colorCurrentTab: { light: "#d3cfc5", dark: "#293d00" },
					colorOnCurrentTab: { light: "#000000", dark: "#dddddd" },
					colorEditable: { light: "#ffffff", dark: "#101010" },
					colorOnEditable: { light: "#0000a0", dark: "#649999" },
					colorSelection: { light: "#0060a0", dark: "#0060a0" },
					colorOnSelection: { light: "#ffffff", dark: "#ffffff" },
					colorInactiveSelection: { light: "#004080", dark: "#004080" },
					colorOnInactiveSelection: { light: "#e4e4e4", dark: "#e4e4e4" },
					colorIndirectSelection: { light: "#e6f7ff", dark: "#002b40" },
					colorOnIndirectSelection: { light: "#000000", dark: "#e4e4e4" },
					colorScroll: { light: "#c0c0c0", dark: "#808080" },
					colorScrollRollover: { light: "#c0c0c0", dark: "#808080" },
					colorScrollEdge: { light: "#808080", dark: "#a0a0a0" },
					colorControlEdge: { light: "#606060", dark: "#606060" },
					colorControl: { light: "#f8f8ff", dark: "#404040" },
					colorOnControl: { light: "#000000", dark: "#dddddd" },
					colorPressedControl: { light: "#0060a0", dark: "#0060a0" },
					colorOnPressedControl: { light: "#ffffff", dark: "#ffffff" },
					colorDivider: { light: "#c0c0c0", dark: "#666666" },
					colorInteriorDivider: { light: "#d8d8d8", dark: "#353535" },
					colorIconButton: { light: "#606060", dark: "#808080" },
					colorIconButtonRollover: { light: "#000000", dark: "#c0c0c0" },
					colorPressedIconButton: { light: "#0060a0", dark: "#0060a0" },
					colorHint: { light: "#808080", dark: "#404040" },
					colorTooltip: { light: "#fcfcc4", dark: "#fcfcc4" },
					colorOnTooltip: { light: "#000000", dark: "#000000" },
					colorSearchList: { light: "#e0ffff", dark: "#002b2b" },
					colorOnSearchList: { light: "#000000", dark: "#cccccc" },
					colorMarker: { light: "#fcf2c4", dark: "#003300" },
					colorOnMarker: { light: "#000000", dark: "#dddddd" },
					colorError: { light: "#c04040", dark: "#732525" },
					colorOnError: { light: "#ffffff", dark: "#dddddd" },
					colorWarning: { light: "#e08000", dark: "#c06000" },
					colorOnWarning: { light: "#ffffff", dark: "#dddddd" },
					colorOverloaded: { light: "#c04040", dark: "#732525" },
					colorOnOverloaded: { light: "#ffffff", dark: "#dddddd" },
					colorPage: { light: "#ffffff", dark: "#101010" },
					colorOnPage: { light: "#000000", dark: "#a0a0a0" },
					colorPageStandout: { light: "#dddddd", dark: "#404040" },
					colorOnPageStandout: { light: "#404040", dark: "#a0a0a0" },
					colorPageVoid: { light: "#808080", dark: "#000000" },
					colorDropArea: { light: "#cc0033", dark: "#ff0000" },
					colorLink: { light: "#739925", dark: "#00cc66" },
					colorLinkPressed: { light: "#0080FF", dark: "#0060A0" },
					colorLinkRollover: { light: "#00C000", dark: "#00B300" },
					colorAccent: { light: "#006666", dark: "#649999" },
					colorTooltipMarker: { light: "#804080", dark: "#996499" },
					colorButtonRoll: { light: "#fff973", dark: "#55b6b9" },
					colorOnButtonRoll: { light: "#000000", dark: "#dddddd" },
					colorButtonRollRollover: { light: "#fff426", dark: "#48999c" },
					colorOnButtonRollRollover: { light: "#000000", dark: "#dddddd" },
					colorButtonMod: { light: "#f7954a", dark: "#598c15" },
					colorOnButtonMod: { light: "#000000", dark: "#dddddd" },
					colorButtonModRollover: { light: "#f56c00", dark: "#5ea600" },
					colorOnButtonModRollover: { light: "#000000", dark: "#dddddd" },
					colorSkill: { light: "#103060", dark: "#103060" },
					colorSuccess: { light: "#10a020", dark: "#10a020" },
					colorFailure: { light: "#a02010", dark: "#a02010" },
					colorCriticalSuccess: { light: "#00a010", dark: "#00a010" },
					colorCriticalFailure: { light: "#a01000", dark: "#a01000" },
					colorChatPublic: { light: "#ffffff", dark: "#202020" },
					colorChatWhisper: { light: "#e8e8ef", dark: "#6e6e7e" },
					colorChatBlind: { light: "#f5eaf5", dark: "#846c84" },
				},
			},
		}
	}

	override activateListeners($html: JQuery): void {
		super.activateListeners($html)
		const html = $html[0]

		htmlQuery(html, "a.reset")?.addEventListener("click", event => {
			this._onReset(event)
		})
	}

	protected _onDataImport(_event: MouseEvent): void {}

	protected _onDataExport(_event: MouseEvent): void {}

	async _onReset(event: MouseEvent): Promise<void> {
		const id = htmlClosest(event.target, "[data-id]")?.dataset.id
		if (!id) return
		const colors = game.settings.get(SYSTEM_NAME, `${SETTINGS.COLORS}.colors`)
		const defaults = game.settings.settings.get(`${SYSTEM_NAME}.${SETTINGS.COLORS}.colors`)?.default as Record<
			string,
			{ light: string; dark: string }
		>
		colors[id] = defaults[id]
		await game.settings.set(SYSTEM_NAME, `${SETTINGS.COLORS}.colors`, colors)
		ColorSettings.applyColors()
		this.render()
	}

	override async _onResetAll(event: Event): Promise<void> {
		event.preventDefault()
		game.settings.set(
			SYSTEM_NAME,
			`${SETTINGS.COLORS}.modePreference`,
			game.settings.settings.get(`${SYSTEM_NAME}.${SETTINGS.COLORS}.modePreference`).default,
		)
		// let currentColors = game.settings.get(SYSTEM_NAME, `${SETTINGS.COLORS}.colors`)
		// let defaultColors = game.settings.settings.get(`${SYSTEM_NAME}.${SETTINGS.COLORS}.colors`).default
		// console.log(currentColors["colorBackground"]["dark"])
		// console.log(defaultColors["colorBackground"]["dark"])
		game.settings.set(
			SYSTEM_NAME,
			`${SETTINGS.COLORS}.colors`,
			game.settings.settings.get(`${SYSTEM_NAME}.${SETTINGS.COLORS}.colors`).default,
		)
		// currentColors = game.settings.get(SYSTEM_NAME, `${SETTINGS.COLORS}.colors`)
		// defaultColors = game.settings.settings.get(`${SYSTEM_NAME}.${SETTINGS.COLORS}.colors`).default
		// console.log(currentColors["colorBackground"]["dark"])
		// console.log(defaultColors["colorBackground"]["dark"])
		ColorSettings.applyColors()
		this.render()
	}

	protected override async _updateObject(
		_event: Event,
		formData: { colors: Record<string, { light?: string; dark?: string }> } & Record<string, string>,
	): Promise<void> {
		for (const k of Object.keys(formData)) {
			if (k === "modePreference") continue
			const key = k.replace(/\.light|\.dark/g, "")
			formData.colors ??= {}
			formData.colors[key] ??= {}
			if (k.endsWith("light")) formData.colors[key].light = formData[k]
			if (k.includes("dark")) formData.colors[key].dark = formData[k]
			delete formData[k]
		}
		for await (const key of this.constructor.SETTINGS) {
			const settingKey = `${SETTINGS.COLORS}.${key}`
			await game.settings.set(SYSTEM_NAME, settingKey, formData[key])
		}
		ColorSettings.applyColors()
	}

	static applyColors(): void {
		const modePreference = game.settings.get(SYSTEM_NAME, `${SETTINGS.COLORS}.modePreference`)
		const colors = game.settings.get(SYSTEM_NAME, `${SETTINGS.COLORS}.colors`)
		Object.keys(colors).forEach(e => {
			if (!e.startsWith("color")) return
			const name = `--${e.replace(/(\w)([A-Z])/g, "$1-$2").toLowerCase()}`
			const value = colors[e]
			// console.log(value)
			value.light = foundry.utils.Color.fromString(value.light)
				.rgb.map((i: number) => i * 255)
				.join(", ")
			value.dark = foundry.utils.Color.fromString(value.dark)
				.rgb.map((i: number) => i * 255)
				.join(", ")
			// console.log(value)
			if (modePreference === "light") $(":root").css(name, value.light)
			else if (modePreference === "dark") $(":root").css(name, value.dark)
			else if (window.matchMedia("(prefers-color-scheme: dark)").matches) $(":root").css(name, value.dark)
			else $(":root").css(name, value.light)
		})
	}
}
