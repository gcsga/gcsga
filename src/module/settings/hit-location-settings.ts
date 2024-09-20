import { SETTINGS, SYSTEM_NAME } from "@module/data/constants.ts"
import fields = foundry.data.fields
import api = foundry.applications.api
import { threshold } from "@util"
import { BodyGURPS } from "@module/data/hit-location.ts"
import { DEFAULT_BODY_TYPE } from "./defaults/data.ts"

class HitLocationSettings extends foundry.abstract.DataModel<null, HitLocationSettingsSchema> {
	static override defineSchema(): HitLocationSettingsSchema {
		const fields = foundry.data.fields
		return {
			body_type: new fields.EmbeddedDataField(BodyGURPS, { initial: DEFAULT_BODY_TYPE }),
		}
	}
}

interface HitLocationSettings extends ModelPropsFromSchema<HitLocationSettingsSchema> {}

type HitLocationSettingsSchema = {
	body_type: fields.EmbeddedDataField<BodyGURPS, true, false, true>
}

class HitLocationsConfig extends api.HandlebarsApplicationMixin(api.ApplicationV2) {
	// Cached settings used for retaining progress without submitting changes
	private declare _cachedSettings: HitLocationSettings

	static override DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> & { dragDrop: DragDropConfiguration[] } = {
		id: "hit-locations-config",
		tag: "form",
		window: {
			contentClasses: ["standard-form"],
			icon: "gcs-body-type",
			title: "GURPS.Settings.HitLocationsConfig.Title",
		},
		position: {
			width: 660,
			height: "auto",
		},
		form: {
			submitOnChange: false,
			closeOnSubmit: false,
			handler: HitLocationsConfig.#onSubmit,
		},
		actions: {
			reset: HitLocationsConfig.#onReset,
			moveItemUp: this.#onMoveItemUp,
			moveItemDown: this.#onMoveItemDown,
			deleteItem: this.#onDeleteItem,
			addItem: this.#onAddItem,
		},
		dragDrop: [{ dragSelector: "[data-drag]", dropSelector: "" }],
	}

	static override PARTS = {
		hitLocations: {
			id: "attributes",
			template: `systems/${SYSTEM_NAME}/templates/apps/attributes-config.hbs`,
			scrollable: [".attributes-list", ".thresholds-list"],
		},
		footer: {
			template: "templates/generic/form-footer.hbs",
		},
	}

	static registerSettings(): void {
		game.settings.register(SYSTEM_NAME, SETTINGS.DEFAULT_HIT_LOCATIONS, {
			name: "",
			scope: "world",
			type: HitLocationSettings,
			default: new HitLocationSettings(),
		})
	}

	// Cached settings used for retaining progress without submitting changes
	get cachedSettings(): HitLocationSettings {
		return (this._cachedSettings ??= this._getInitialSettings())
	}

	set cachedSettings(value: unknown) {
		this._cachedSettings = new HitLocationSettings(value as Partial<SourceFromSchema<HitLocationSettingsSchema>>)
	}

	// Get the initial settings values for this menu.
	// This function can be overriden for e.g. Actors
	protected _getInitialSettings(): HitLocationSettings {
		return game.settings.get(SYSTEM_NAME, SETTINGS.DEFAULT_HIT_LOCATIONS)
	}

	// Write changes made in this menu to a permanent dataset.
	// This function can be overriden for e.g. Actors
	protected async _setDatabaseSettings(data: object): Promise<void> {
		await game.settings.set(SYSTEM_NAME, SETTINGS.DEFAULT_ATTRIBUTES, data)
	}

	override async _prepareContext(_options = {}): Promise<object> {
		const source = this.cachedSettings
		return {
			body: source.body_type,
			buttons: [
				{
					type: "reset",
					action: "reset",
					icon: "fa-solid fa-sync",
					label: "GURPS.Settings.HitLocationsConfig.Reset",
				},
				{ type: "submit", icon: "fa-solid fa-save", label: "GURPS.Settings.HitLocationsConfig.Submit" },
			],
		}
	}

	protected _markTabs(tabs: Record<string, Partial<ApplicationTab>>): Record<string, Partial<ApplicationTab>> {
		for (const v of Object.values(tabs)) {
			v.active = this.tabGroups[v.group!] === v.id
			v.cssClass = v.active ? "active" : ""
			if ("tabs" in v) this._markTabs(v.tabs as Record<string, Partial<ApplicationTab>>)
		}
		return tabs
	}

	protected override async _preparePartContext(partId: string, context: Record<string, any>): Promise<object> {
		context.partId = `${this.id}-${partId}`
		context.tab = context.tabs[partId]
		return context
	}

	override _onRender(_context: object, _options: ApplicationRenderOptions): void {
		const attributeTypeFields = this.element.querySelectorAll(`select[name$=".type"`)
		for (const field of attributeTypeFields) {
			field.addEventListener("change", async e => {
				e.preventDefault()
				e.stopImmediatePropagation()

				const formData = new FormDataExtended(this.element)
				const data = fu.expandObject(formData.object)
				this.cachedSettings = data
				await this.render()
			})
		}
	}

	static async #onSubmit(
		this: HitLocationsConfig,
		event: Event | SubmitEvent,
		_form: HTMLFormElement,
		formData: FormDataExtended,
	): Promise<void> {
		event.preventDefault()

		// Grab all fields pertaining to threshold ops
		const thresholdCheckboxData = Object.fromEntries(
			Object.entries(formData.object).filter(([key]) =>
				(threshold.Ops as string[]).includes(key.split(".").at(-1) ?? ""),
			),
		)
		// Transform all fields pertaining to threshold ops to fields of value type Array<threshold.Op>
		// and delete original fields
		const thresholdArrayData: Record<string, threshold.Op[]> = {}
		for (const [key, value] of Object.entries(thresholdCheckboxData) as [string, boolean][]) {
			const keyArray = key.split(".")
			const opValue = keyArray.pop() as threshold.Op
			const keyArrayString = keyArray.join(".")

			thresholdArrayData[keyArrayString] ??= []
			if (value) thresholdArrayData[keyArrayString].push(opValue)

			delete formData.object[key]
		}

		const data = fu.expandObject({ ...formData.object, ...thresholdArrayData })
		this.cachedSettings = data
		await this._setDatabaseSettings(data)
		await this.render()
		ui.notifications.info("GURPS.Settings.HitLocationsConfig.MessageSubmit", { localize: true })
	}

	static async #onReset(this: HitLocationsConfig, event: Event): Promise<void> {
		event.preventDefault()

		const defaults = game.settings.settings.get(`${SYSTEM_NAME}.${SETTINGS.DEFAULT_ATTRIBUTES}`).default
		this.cachedSettings = defaults
		await this._setDatabaseSettings(defaults)
		ui.notifications.info("GURPS.Settings.HitLocationsConfig.MessageReset", { localize: true })
		await this.render()
	}

	static async #onMoveItemUp(this: HitLocationsConfig, event: Event): Promise<void> {
		event.preventDefault()
		event.stopImmediatePropagation()

		const source = this.cachedSettings.toObject()

		this.cachedSettings = source
		await this.render()
	}

	static async #onMoveItemDown(this: HitLocationsConfig, event: Event): Promise<void> {
		event.preventDefault()
		event.stopImmediatePropagation()

		const source = this.cachedSettings.toObject()

		this.cachedSettings = source
		await this.render()
	}

	static async #onAddItem(this: HitLocationsConfig, event: Event): Promise<void> {
		event.preventDefault()

		const source = this.cachedSettings.toObject()
		this.cachedSettings = source
		await this.render()
	}

	static async #onDeleteItem(this: HitLocationsConfig, event: Event): Promise<void> {
		event.preventDefault()
		const source = this.cachedSettings.toObject()

		this.cachedSettings = source
		await this.render()
	}
}

export { HitLocationsConfig, HitLocationSettings }
export type { HitLocationSettingsSchema }
