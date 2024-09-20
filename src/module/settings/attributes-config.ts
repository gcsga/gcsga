import { SETTINGS, SYSTEM_NAME } from "@module/data/constants.ts"
import fields = foundry.data.fields
import api = foundry.applications.api
import { AttributeDef, AttributeDefSchema } from "@module/data/attribute/attribute-definition.ts"
import {
	DEFAULT_ATTRIBUTE_SETTINGS,
	DEFAULT_MOVE_TYPE_SETTINGS,
	DEFAULT_RESOURCE_TRACKER_SETTINGS,
} from "./defaults/data.ts"
import { threshold } from "@util"
import { PoolThreshold } from "@module/data/attribute/pool-threshold.ts"
import { ResourceTrackerDef, ResourceTrackerDefSchema } from "@module/data/resource-tracker/index.ts"
import { MoveTypeDef, MoveTypeDefSchema } from "@module/data/move-type/move-type-definition.ts"
import { MoveTypeOverride } from "@module/data/move-type/move-type-override.ts"

class AttributeSettings extends foundry.abstract.DataModel<null, AttributeSettingsSchema> {
	static override defineSchema(): AttributeSettingsSchema {
		const fields = foundry.data.fields
		return {
			attributes: new fields.ArrayField(new fields.EmbeddedDataField(AttributeDef), {
				initial: DEFAULT_ATTRIBUTE_SETTINGS,
			}),
			resource_trackers: new fields.ArrayField(new fields.EmbeddedDataField(ResourceTrackerDef), {
				initial: DEFAULT_RESOURCE_TRACKER_SETTINGS,
			}),
			move_types: new fields.ArrayField(new fields.EmbeddedDataField(MoveTypeDef), {
				initial: DEFAULT_MOVE_TYPE_SETTINGS,
			}),
		}
	}
}

interface AttributeSettings extends ModelPropsFromSchema<AttributeSettingsSchema> {}

type AttributeSettingsSchema = {
	attributes: fields.ArrayField<
		fields.EmbeddedDataField<AttributeDef>,
		Partial<SourceFromSchema<AttributeDefSchema>>[]
	>
	resource_trackers: fields.ArrayField<
		fields.EmbeddedDataField<ResourceTrackerDef>,
		Partial<SourceFromSchema<ResourceTrackerDefSchema>>[]
	>
	move_types: fields.ArrayField<fields.EmbeddedDataField<MoveTypeDef>, Partial<SourceFromSchema<MoveTypeDefSchema>>[]>
}

class AttributesConfig extends api.HandlebarsApplicationMixin(api.ApplicationV2) {
	// Cached settings used for retaining progress without submitting changes
	private declare _cachedSettings: AttributeSettings

	// Set initial values for tabgroups
	override tabGroups: Record<string, string> = {
		primary: "attributes",
	}

	static override DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> & { dragDrop: DragDropConfiguration[] } = {
		id: "attributes-config",
		tag: "form",
		window: {
			contentClasses: ["standard-form"],
			icon: "gcs-attribute",
			title: "GURPS.Settings.AttributesConfig.Title",
		},
		position: {
			width: 660,
			height: "auto",
		},
		form: {
			submitOnChange: false,
			closeOnSubmit: false,
			handler: AttributesConfig.#onSubmit,
		},
		actions: {
			reset: AttributesConfig.#onReset,
			moveItemUp: this.#onMoveItemUp,
			moveItemDown: this.#onMoveItemDown,
			deleteItem: this.#onDeleteItem,
			addItem: this.#onAddItem,
		},
		dragDrop: [{ dragSelector: "[data-drag]", dropSelector: "" }],
	}

	static override PARTS = {
		tabs: {
			id: "tabs",
			template: "templates/generic/tab-navigation.hbs",
		},
		attributes: {
			id: "attributes",
			template: `systems/${SYSTEM_NAME}/templates/apps/attributes-config.hbs`,
			scrollable: [".attributes-list", ".thresholds-list"],
		},
		resourceTrackers: {
			id: "resource-trackers",
			template: `systems/${SYSTEM_NAME}/templates/apps/resource-trackers-config.hbs`,
			scrollable: [".attributes-list", ".thresholds-list"],
		},
		moveTypes: {
			id: "move-types",
			template: `systems/${SYSTEM_NAME}/templates/apps/move-types-config.hbs`,
			scrollable: [".attributes-list", ".thresholds-list"],
		},
		footer: {
			template: "templates/generic/form-footer.hbs",
		},
	}

	static registerSettings(): void {
		game.settings.register(SYSTEM_NAME, SETTINGS.DEFAULT_ATTRIBUTES, {
			name: "",
			scope: "world",
			type: AttributeSettings,
			default: new AttributeSettings(),
		})
	}

	// Cached settings used for retaining progress without submitting changes
	get cachedSettings(): AttributeSettings {
		return (this._cachedSettings ??= this._getInitialSettings())
	}

	set cachedSettings(value: unknown) {
		this._cachedSettings = new AttributeSettings(value as Partial<SourceFromSchema<AttributeSettingsSchema>>)
	}

	// Get the initial settings values for this menu.
	// This function can be overriden for e.g. Actors
	protected _getInitialSettings(): AttributeSettings {
		return game.settings.get(SYSTEM_NAME, SETTINGS.DEFAULT_ATTRIBUTES)
	}

	// Get the default settings values for this menu.
	// This can be overriden to instead get the current game settings value if on an Actor
	protected _getDefaultSettings(): AttributeSettings {
		return game.settings.settings.get(`${SYSTEM_NAME}.${SETTINGS.DEFAULT_ATTRIBUTES}`).default
	}

	// Write changes made in this menu to a permanent dataset.
	// This function can be overriden for e.g. Actors
	protected async _setDatabaseSettings(data: object): Promise<void> {
		await game.settings.set(SYSTEM_NAME, SETTINGS.DEFAULT_ATTRIBUTES, data)
	}

	override async _prepareContext(_options = {}): Promise<object> {
		const source = this.cachedSettings
		return {
			tabs: this._getTabs(),
			attributes: source.attributes,
			resourceTrackers: source.resource_trackers,
			moveTypes: source.move_types,
			ops: threshold.OpsChoices,
			buttons: [
				{
					type: "reset",
					action: "reset",
					icon: "fa-solid fa-sync",
					label: "GURPS.Settings.AttributesConfig.Reset",
				},
				{ type: "submit", icon: "fa-solid fa-save", label: "GURPS.Settings.AttributesConfig.Submit" },
			],
		}
	}

	protected _getTabs(): Record<string, Partial<ApplicationTab>> {
		return this._markTabs({
			attributes: {
				id: "attributes",
				group: "primary",
				icon: "gcs-attribute",
				label: "GURPS.Settings.AttributesConfig.TABS.Attributes",
			},
			resourceTrackers: {
				id: "resource-trackers",
				group: "primary",
				icon: "gcs-coins",
				label: "GURPS.Settings.AttributesConfig.TABS.ResourceTrackers",
			},
			moveTypes: {
				id: "move-types",
				group: "primary",
				icon: "fa-solid fa-person-running",
				label: "GURPS.Settings.AttributesConfig.TABS.MoveTypes",
			},
		})
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
		this: AttributesConfig,
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
		ui.notifications.info("GURPS.Settings.AttributesConfig.MessageSubmit", { localize: true })
	}

	static async #onReset(this: AttributesConfig, event: Event): Promise<void> {
		event.preventDefault()

		const defaults = this._getDefaultSettings()
		this.cachedSettings = defaults
		await this._setDatabaseSettings(defaults)
		ui.notifications.info("GURPS.Settings.AttributesConfig.MessageReset", { localize: true })
		await this.render()
	}

	static async #onMoveItemUp(this: AttributesConfig, event: Event): Promise<void> {
		event.preventDefault()
		event.stopImmediatePropagation()

		const source = this.cachedSettings.toObject()
		const el = event.target as HTMLElement
		const type = el.dataset.itemType

		switch (type) {
			case "attributes":
			case "resource_trackers":
			case "move_types": {
				const index = parseInt(el.dataset.itemIndex ?? "")
				if (isNaN(index)) return
				const [attribute] = source[type].splice(index, 1)
				if (!attribute) return
				source[type].splice(index - 1, 0, attribute)
				break
			}
			case "attribute_thresholds":
			case "resource_tracker_thresholds": {
				const parentType = type === "attribute_thresholds" ? "attributes" : "resource_trackers"
				const index = parseInt(el.dataset.itemIndex ?? "")
				const parentIndex = parseInt(el.dataset.parentIndex ?? "")
				if (isNaN(index) || isNaN(parentIndex)) return
				const thresholds = source[parentType][parentIndex].thresholds
				if (!thresholds) return
				const [threshold] = thresholds.splice(index, 1)
				if (!threshold) return
				thresholds.splice(index - 1, 0, threshold)
				source[parentType][parentIndex].thresholds = thresholds
				break
			}
			case "move-type-override": {
				const index = parseInt(el.dataset.itemIndex ?? "")
				const parentIndex = parseInt(el.dataset.parentIndex ?? "")
				if (isNaN(index) || isNaN(parentIndex)) return
				const overrides = source.move_types[parentIndex].overrides
				if (!overrides) return
				const [override] = overrides.splice(index, 1)
				if (!override) return
				overrides.splice(index - 1, 0, override)
				source.move_types[parentIndex].overrides = overrides
			}
		}

		this.cachedSettings = source
		await this.render()
	}

	static async #onMoveItemDown(this: AttributesConfig, event: Event): Promise<void> {
		event.preventDefault()
		event.stopImmediatePropagation()

		const source = this.cachedSettings.toObject()
		const el = event.target as HTMLElement
		const type = el.dataset.itemType

		switch (type) {
			case "attributes":
			case "resource_trackers":
			case "move_types": {
				const index = parseInt(el.dataset.itemIndex ?? "")
				if (isNaN(index)) return
				const [attribute] = source[type].splice(index, 1)
				if (!attribute) return
				source[type].splice(index + 1, 0, attribute)
				break
			}
			case "attribute_thresholds":
			case "resource_tracker_thresholds": {
				const parentType = type === "attribute_thresholds" ? "attributes" : "resource_trackers"
				const index = parseInt(el.dataset.itemIndex ?? "")
				const parentIndex = parseInt(el.dataset.parentIndex ?? "")
				if (isNaN(index) || isNaN(parentIndex)) return
				const thresholds = source[parentType][parentIndex].thresholds
				if (!thresholds) return
				const [threshold] = thresholds.splice(index, 1)
				if (!threshold) return
				thresholds.splice(index + 1, 0, threshold)
				source[parentType][parentIndex].thresholds = thresholds
				break
			}
			case "move-type-override": {
				const index = parseInt(el.dataset.itemIndex ?? "")
				const parentIndex = parseInt(el.dataset.parentIndex ?? "")
				if (isNaN(index) || isNaN(parentIndex)) return
				const overrides = source.move_types[parentIndex].overrides
				if (!overrides) return
				const [override] = overrides.splice(index, 1)
				if (!override) return
				overrides.splice(index + 1, 0, override)
				source.move_types[parentIndex].overrides = overrides
			}
		}

		this.cachedSettings = source
		await this.render()
	}

	static async #onAddItem(this: AttributesConfig, event: Event): Promise<void> {
		event.preventDefault()

		const source = this.cachedSettings.toObject()
		const el = event.target as HTMLElement
		const type = el.dataset.itemType

		switch (type) {
			case "attributes": {
				source.attributes.push(new AttributeDef({}).toObject())
				break
			}
			case "resource_trackers": {
				source.resource_trackers.push(new ResourceTrackerDef({}).toObject())
				break
			}
			case "move_types": {
				source.move_types.push(new MoveTypeDef({}).toObject())
				break
			}
			case "attribute_thresholds":
			case "resource_tracker_thresholds": {
				const parentType = type === "attribute_thresholds" ? "attributes" : "resource_trackers"
				const index = parseInt(el.dataset.itemIndex ?? "")
				if (isNaN(index)) return
				const thresholds = source[parentType][index].thresholds
				if (!thresholds) return
				thresholds.push(new PoolThreshold({}).toObject())
				source[parentType][index].thresholds = thresholds
				break
			}
			case "move_type_overrides": {
				const index = parseInt(el.dataset.itemIndex ?? "")
				if (isNaN(index)) return
				const overrides = source.move_types[index].overrides
				if (!overrides) return
				overrides.push(new MoveTypeOverride({}).toObject())
				source.move_types[index].overrides = overrides
			}
		}

		this.cachedSettings = source
		await this.render()
	}

	static async #onDeleteItem(this: AttributesConfig, event: Event): Promise<void> {
		event.preventDefault()
		const source = this.cachedSettings.toObject()
		const el = event.target as HTMLElement
		const type = el.dataset.itemType

		switch (type) {
			case "attributes":
			case "resource_trackers":
			case "move_types": {
				const index = parseInt(el.dataset.itemIndex ?? "")
				if (isNaN(index)) return
				source[type].splice(index, 1)
				break
			}
			case "attribute_thresholds":
			case "resource_tracker_thresholds": {
				const parentType = type === "attribute_thresholds" ? "attributes" : "resource_trackers"
				const index = parseInt(el.dataset.itemIndex ?? "")
				const parentIndex = parseInt(el.dataset.parentIndex ?? "")
				if (isNaN(index) || isNaN(parentIndex)) return
				const thresholds = source[parentType][parentIndex].thresholds
				if (!thresholds) return
				thresholds.splice(index, 1)
				break
			}
			case "move_type_overrides": {
				const index = parseInt(el.dataset.itemIndex ?? "")
				const parentIndex = parseInt(el.dataset.parentIndex ?? "")
				if (isNaN(index) || isNaN(parentIndex)) return
				const overrides = source.move_types[parentIndex].overrides
				if (!overrides) return
				overrides.splice(index, 1)
			}
		}

		this.cachedSettings = source
		await this.render()
	}
}

export { AttributesConfig, AttributeSettings }
export type { AttributeSettingsSchema }
