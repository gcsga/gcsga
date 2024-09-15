// import { SETTINGS, SYSTEM_NAME } from "@data"
// import { htmlQuery, htmlQueryAll } from "@util/dom.ts"
// import { LocalizeGURPS } from "@util/localize.ts"
// import * as R from "remeda"
//
// abstract class SettingsMenuGURPS extends FormApplication {
// 	static readonly namespace: string
//
// 	protected cache: Record<string, unknown> & { clear(): void } = (() => {
// 		const data: Record<string, unknown> & { clear(): void } = {
// 			clear(): void {
// 				for (const key of Object.keys(this)) {
// 					delete this[key]
// 				}
// 			},
// 		}
// 		Object.defineProperty(data, "clear", { enumerable: false })
// 		return data
// 	})()
//
// 	static override get defaultOptions(): FormApplicationOptions {
// 		const options = super.defaultOptions
// 		options.classes.push("gurps", "settings-menu", "sheet")
//
// 		return {
// 			...options,
// 			title: `gurps.settings.${this.namespace}.name`,
// 			id: `${this.namespace}-settings`,
// 			template: `systems/${SYSTEM_NAME}/templates/system/settings/${this.namespace}.hbs`,
// 			width: 480,
// 			height: 600,
// 			closeOnSubmit: false,
// 			submitOnChange: true,
// 			submitOnClose: true,
// 		}
// 	}
//
// 	static readonly SETTINGS: readonly string[]
//
// 	/** Settings to be registered and also later referenced during user updates */
// 	protected static get settings(): Record<string, PartialSettingsData> {
// 		return {}
// 	}
//
// 	get namespace(): string {
// 		return this.constructor.namespace
// 	}
//
// 	override async getData(): Promise<MenuTemplateData> {
// 		const settings = (this.constructor as typeof SettingsMenuGURPS).settings
// 		const templateData = settingsToSheetData(settings, this.cache)
//
// 		// Ensure cache values are initialized
// 		for (const [key, value] of Object.entries(settings)) {
// 			if (!(key in this.cache)) {
// 				this.cache[key] = game.settings.get(SYSTEM_NAME, `${value.prefix ?? ""}.${key}`)
// 			}
// 		}
//
// 		return fu.mergeObject(await super.getData(), {
// 			config: CONFIG.GURPS,
// 			settings: templateData,
// 			instructions: `gurps.settings.${this.namespace}.hint`,
// 		})
// 	}
//
// 	override close(options?: { force?: boolean }): Promise<void> {
// 		this.cache.clear()
// 		return super.close(options)
// 	}
//
// 	static registerSettings(): void {
// 		const settings = this.settings
// 		for (const key of this.SETTINGS) {
// 			const setting = settings[key]
// 			game.settings.register(SYSTEM_NAME, `${setting.prefix ?? ""}.${key}`, {
// 				...R.omit(setting, ["prefix"]),
// 				scope: "world",
// 				config: false,
// 			})
// 		}
// 	}
//
// 	public getReservedIds(): string[] {
// 		return [
// 			...game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`),
// 			...game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`),
// 			...game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`),
// 		].map(e => e.id)
// 	}
//
// 	/* -------------------------------------------- */
// 	/*  Event Listeners and Handlers                */
// 	/* -------------------------------------------- */
//
// 	override activateListeners($html: JQuery): void {
// 		super.activateListeners($html)
// 		const html = $html[0]
//
// 		htmlQuery(html, "button[type=reset]")?.addEventListener("click", () => {
// 			this.cache.clear()
// 			this.render()
// 		})
//
// 		htmlQuery(html, "button.data-import")?.addEventListener("click", event => this._onDataImport(event))
// 		htmlQuery(html, "button.data-export")?.addEventListener("click", event => this._onDataExport(event))
// 	}
//
// 	protected override async _updateObject(event: Event, data: Record<string, unknown>): Promise<void> {
// 		for (const key of this.constructor.SETTINGS) {
// 			const setting = this.constructor.settings[key]
// 			const settingKey = `${setting.prefix ?? ""}.${key}`
// 			const value = data[key]
// 			this.cache[key] = value
// 			if (event.type === "submit") {
// 				await game.settings.set(SYSTEM_NAME, settingKey, value)
// 			}
// 		}
//
// 		if (event.type === "submit") {
// 			this.close()
// 		} else {
// 			this.render()
// 		}
// 	}
//
// 	protected override _onDragOver(event: DragEvent): void {
// 		super._onDragOver(event)
// 		const element = event.currentTarget
// 		if (!(element instanceof HTMLElement)) return
// 		if (!element.classList.contains("item")) return
//
// 		const heightAcross = (event.offsetY - element.offsetTop) / element.offsetHeight
// 		for (const item of htmlQueryAll(element.parentElement, ".item")) {
// 			item.classList.remove("border-top")
// 			item.classList.remove("border-bottom")
// 		}
// 		if (heightAcross > 0.5) {
// 			element.classList.remove("border-top")
// 			element.classList.add("border-bottom")
// 		} else {
// 			element.classList.remove("border-bottom")
// 			element.classList.add("border-top")
// 		}
// 	}
//
// 	protected abstract _onDataImport(_event: MouseEvent): void
//
// 	protected abstract _onDataExport(_event: MouseEvent): void
//
// 	async _onResetAll(event: Event): Promise<void> {
// 		event.preventDefault()
// 		// const constructor = this.constructor as typeof SettingsMenuGURPS
// 		// for (const setting of constructor.SETTINGS) {
// 		// 	const defaults = game.settings.settings.get(`${SYSTEM_NAME}.${this.namespace}.${setting}`)?.default
// 		// 	await game.settings.set(SYSTEM_NAME, `${this.namespace}.${setting}`, defaults)
// 		// }
// 		this.render()
// 	}
//
// 	protected override _getHeaderButtons(): ApplicationHeaderButton[] {
// 		const buttons: ApplicationHeaderButton[] = [
// 			{
// 				label: LocalizeGURPS.translations.gurps.settings.reset_all,
// 				icon: "gcs-reset",
// 				class: "reset-all",
// 				onclick: event => this._onResetAll(event),
// 			},
// 		]
// 		const all_buttons = [...buttons, ...super._getHeaderButtons()]
// 		all_buttons.at(-1)!.label = ""
// 		all_buttons.at(-1)!.icon = "gcs-circled-x"
// 		return all_buttons
// 	}
// }
//
// interface SettingsMenuGURPS extends FormApplication {
// 	constructor: typeof SettingsMenuGURPS
// 	options: SettingsMenuOptions
// }
//
// interface PartialSettingsData extends Omit<SettingRegistration, "scope" | "config"> {
// 	prefix?: string
// }
//
// interface SettingsTemplateData extends PartialSettingsData {
// 	key: string
// 	value: unknown
// 	isSelect: boolean
// 	isCheckbox: boolean
// }
//
// interface MenuTemplateData extends FormApplicationData {
// 	settings: Record<string, SettingsTemplateData>
// }
//
// interface SettingsMenuOptions extends FormApplicationOptions {
// 	highlightSetting?: string
// }
//
// function settingsToSheetData(
// 	settings: Record<string, PartialSettingsData>,
// 	cache: Record<string, unknown>,
// ): Record<string, SettingsTemplateData> {
// 	return Object.entries(settings).reduce((result: Record<string, SettingsTemplateData>, [key, setting]) => {
// 		const lookupKey = `${setting.prefix ?? ""}.${key}`
// 		const value = key in cache ? cache[key] : game.settings.get(SYSTEM_NAME, lookupKey)
// 		result[key] = {
// 			...setting,
// 			key,
// 			value,
// 			isSelect: !!setting.choices,
// 			isCheckbox: setting.type === Boolean,
// 		}
//
// 		return result
// 	}, {})
// }
//
// export { SettingsMenuGURPS, settingsToSheetData }
// export type { MenuTemplateData, PartialSettingsData, SettingsMenuOptions, SettingsTemplateData }
//
// // export abstract class SettingsMenuGURPS extends FormApplication {
// // 	static readonly namespace: string
// //
// // 	declare object: object
// //
// // 	static override get defaultOptions(): FormApplicationOptions {
// // 		const options = super.defaultOptions
// // 		options.classes.push("gurps")
// // 		options.classes.push("settings-menu")
// //
// // 		return mergeObject(options, {
// // 			title: `gurps.settings.${this.namespace}.name`,
// // 			id: `${this.namespace}-settings`,
// // 			template: `systems/${SYSTEM_NAME}/templates/system/settings/${this.namespace}.hbs`,
// // 			width: 480,
// // 			height: 600,
// // 			submitOnClose: true,
// // 			submitOnChange: true,
// // 			closeOnSubmit: false,
// // 			resizable: true,
// // 		} as FormApplicationOptions)
// // 	}
// //
// // 	get namespace(): string {
// // 		return (this.constructor as typeof SettingsMenuGURPS).namespace
// // 	}
// //
// // 	static readonly SETTINGS: readonly string[]
// //
// // 	protected static get settings(): Record<string, any> {
// // 		return {}
// // 	}
// //
// // 	override activateListeners(html: JQuery<HTMLElement>): void {
// // 		super.activateListeners(html)
// // 		html.find(".data-import").on("click", event => this._onDataImport(event))
// // 		html.find(".data-export").on("click", event => this._onDataExport(event))
// // 	}
// //
// // 	abstract _onDataImport(_event: JQuery.ClickEvent): void
// //
// // 	abstract _onDataExport(_event: JQuery.ClickEvent): void
// //
// // 	static registerSettings(): void {
// // 		const settings = this.settings
// // 		for (const setting of this.SETTINGS) {
// // 			game.settings.register(SYSTEM_NAME, `${this.namespace}.${setting}`, {
// // 				...settings[setting],
// // 				config: false,
// // 			})
// // 		}
// // 	}
// //
// // 	override async getData(): Promise<any> {
// // 		const settings = (this.constructor as typeof SettingsMenuGURPS).settings
// // 		const templateData: any[] = Object.entries(settings).map(([key, setting]) => {
// // 			const value = game.settings.get(SYSTEM_NAME, `${this.namespace}.${key}`)
// // 			return {
// // 				...setting,
// // 				key,
// // 				value,
// // 				isSelect: !!setting.choices,
// // 				isCheckbox: setting.type === Boolean,
// // 			}
// // 		})
// // 		return mergeObject(await super.getData(), {
// // 			settings: templateData,
// // 			instructions: `gurps.settings.${this.namespace}.hint`,
// // 		})
// // 	}
// //
// // 	protected override async _updateObject(_event: Event, formData: any): Promise<void> {
// // 		for await (const key of (this.constructor as typeof SettingsMenuGURPS).SETTINGS) {
// // 			const settingKey = `${this.namespace}.${key}`
// // 			await game.settings.set(SYSTEM_NAME, settingKey, formData[key])
// // 		}
// // 	}
// //
// // 	async _onResetAll(event: Event) {
// // 		event.preventDefault()
// // 		const constructor = this.constructor
// // 		for (const setting of (constructor as typeof SettingsMenuGURPS).SETTINGS) {
// // 			const defaults = game.settings.settings.get(`${SYSTEM_NAME}.${this.namespace}.${setting}`)?.default
// // 			await game.settings.set(SYSTEM_NAME, `${this.namespace}.${setting}`, defaults)
// // 		}
// // 		this.render()
// // 	}
// //
// // 	protected override _getHeaderButtons(): ApplicationHeaderButton[] {
// // 		const buttons: ApplicationHeaderButton[] = [
// // 			{
// // 				label: LocalizeGURPS.translations.gurps.settings.reset_all,
// // 				icon: "gcs-reset",
// // 				class: "reset-all",
// // 				onclick: event => this._onResetAll(event),
// // 			},
// // 		]
// // 		const all_buttons = [...buttons, ...super._getHeaderButtons()]
// // 		all_buttons.at(-1)!.label = ""
// // 		all_buttons.at(-1)!.icon = "gcs-circled-x"
// // 		return all_buttons
// // 	}
// // }
