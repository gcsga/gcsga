import { SYSTEM_NAME } from "@module/data/misc.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { mergeObject } from "types/foundry/common/utils/helpers.js"

export abstract class SettingsMenuGURPS extends FormApplication {
	static readonly namespace: string

	declare object: object

	static override get defaultOptions(): FormApplicationOptions {
		const options = super.defaultOptions
		options.classes.push("gurps")
		options.classes.push("settings-menu")

		return mergeObject(options, {
			title: `gurps.settings.${this.namespace}.name`,
			id: `${this.namespace}-settings`,
			template: `systems/${SYSTEM_NAME}/templates/system/settings/${this.namespace}.hbs`,
			width: 480,
			height: 600,
			submitOnClose: true,
			submitOnChange: true,
			closeOnSubmit: false,
			resizable: true,
		} as FormApplicationOptions)
	}

	get namespace(): string {
		return (this.constructor as typeof SettingsMenuGURPS).namespace
	}

	static readonly SETTINGS: readonly string[]

	protected static get settings(): Record<string, any> {
		return {}
	}

	override activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)
		html.find(".data-import").on("click", event => this._onDataImport(event))
		html.find(".data-export").on("click", event => this._onDataExport(event))
	}

	abstract _onDataImport(_event: JQuery.ClickEvent): void

	abstract _onDataExport(_event: JQuery.ClickEvent): void

	static registerSettings(): void {
		const settings = this.settings
		for (const setting of this.SETTINGS) {
			game.settings.register(SYSTEM_NAME, `${this.namespace}.${setting}`, {
				...settings[setting],
				config: false,
			})
		}
	}

	override async getData(): Promise<any> {
		const settings = (this.constructor as typeof SettingsMenuGURPS).settings
		const templateData: any[] = Object.entries(settings).map(([key, setting]) => {
			const value = game.settings.get(SYSTEM_NAME, `${this.namespace}.${key}`)
			return {
				...setting,
				key,
				value,
				isSelect: !!setting.choices,
				isCheckbox: setting.type === Boolean,
			}
		})
		return mergeObject(await super.getData(), {
			settings: templateData,
			instructions: `gurps.settings.${this.namespace}.hint`,
		})
	}

	protected override async _updateObject(_event: Event, formData: any): Promise<void> {
		for await (const key of (this.constructor as typeof SettingsMenuGURPS).SETTINGS) {
			const settingKey = `${this.namespace}.${key}`
			await game.settings.set(SYSTEM_NAME, settingKey, formData[key])
		}
	}

	async _onResetAll(event: Event) {
		event.preventDefault()
		const constructor = this.constructor
		for (const setting of (constructor as typeof SettingsMenuGURPS).SETTINGS) {
			const defaults = game.settings.settings.get(`${SYSTEM_NAME}.${this.namespace}.${setting}`)?.default
			await game.settings.set(SYSTEM_NAME, `${this.namespace}.${setting}`, defaults)
		}
		this.render()
	}

	protected override _getHeaderButtons(): ApplicationHeaderButton[] {
		const buttons: ApplicationHeaderButton[] = [
			{
				label: LocalizeGURPS.translations.gurps.settings.reset_all,
				icon: "gcs-reset",
				class: "reset-all",
				onclick: event => this._onResetAll(event),
			},
		]
		const all_buttons = [...buttons, ...super._getHeaderButtons()]
		all_buttons.at(-1)!.label = ""
		all_buttons.at(-1)!.icon = "gcs-circled-x"
		return all_buttons
	}
}
