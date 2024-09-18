import { SETTINGS, SYSTEM_NAME } from "@module/data/constants.ts"
import fields = foundry.data.fields
import api = foundry.applications.api
import { AttributeDef, AttributeDefSchema } from "@module/data/attribute/attribute-definition.ts"
import { DEFAULT_ATTRIBUTE_SETTINGS } from "./defaults/data.ts"
import { threshold } from "@util"
import { PoolThreshold } from "@module/data/attribute/pool-threshold.ts"

class AttributeSettings extends foundry.abstract.DataModel<null, AttributeSettingsSchema> {
	static override defineSchema(): AttributeSettingsSchema {
		const fields = foundry.data.fields
		return {
			attributes: new fields.ArrayField(new fields.EmbeddedDataField(AttributeDef), {
				initial: DEFAULT_ATTRIBUTE_SETTINGS,
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
}

class AttributesConfig extends api.HandlebarsApplicationMixin(api.ApplicationV2) {
	static override DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration> & { dragDrop: DragDropConfiguration[] } = {
		id: "attributes-config",
		tag: "form",
		window: {
			contentClasses: ["standard-form"],
			icon: "fa-solid fa-palette",
			title: "GURPS.Settings.AttributesConfig.Title",
		},
		position: {
			width: 660,
			height: "auto",
		},
		form: {
			submitOnChange: true,
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
		attributes: {
			id: "attributes",
			template: `systems/${SYSTEM_NAME}/templates/apps/attributes-config.hbs`,
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

	override async _prepareContext(_options = {}) {
		const current = game.settings.get(SYSTEM_NAME, SETTINGS.DEFAULT_ATTRIBUTES)
		const data = this.#prepareAttributes(current)
		return {
			attributes: data.attributes,
			ops: threshold.OpsChoices,
			source: current,
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

	#prepareAttributes(current: AttributeSettings): AttributeSettings {
		return current
	}

	static async #onSubmit(
		event: Event | SubmitEvent,
		_form: HTMLFormElement,
		formData: FormDataExtended,
	): Promise<void> {
		event.preventDefault()
		const data = fu.expandObject(formData.object)
		// console.log(new AttributeSettings(data as any))

		await game.settings.set(SYSTEM_NAME, SETTINGS.DEFAULT_ATTRIBUTES, data)
		await (this as unknown as api.ApplicationV2).render()
		ui.notifications.info("GURPS.Settings.AttributesConfig.MessageSubmit", { localize: true })
	}

	static async #onReset(event: Event): Promise<void> {
		event.preventDefault()

		const defaults = game.settings.settings.get(`${SYSTEM_NAME}.${SETTINGS.DEFAULT_ATTRIBUTES}`).default
		await game.settings.set(SYSTEM_NAME, SETTINGS.DEFAULT_ATTRIBUTES, defaults)
		ui.notifications.info("GURPS.Settings.AttributesConfig.MessageReset", { localize: true })
		// HACK: to fix when types catch up
		await (this as unknown as api.ApplicationV2).render()
	}

	static async #onMoveItemUp(event: Event): Promise<void> {
		event.preventDefault()
		const current = game.settings.get(SYSTEM_NAME, SETTINGS.DEFAULT_ATTRIBUTES).toObject()
		const el = event.target as HTMLElement
		const type = el.dataset.itemType

		switch (type) {
			case "attribute": {
				const index = parseInt(el.dataset.itemIndex ?? "")
				if (isNaN(index)) return
				const [attribute] = current.attributes.splice(index, 1)
				if (!attribute) return
				current.attributes.splice(index - 1, 0, attribute)
				break
			}
			case "threshold": {
				const index = parseInt(el.dataset.itemIndex ?? "")
				const parentIndex = parseInt(el.dataset.parentIndex ?? "")
				if (isNaN(index) || isNaN(parentIndex)) return
				const thresholds = current.attributes[parentIndex].thresholds
				if (!thresholds) return
				const [threshold] = thresholds.splice(index, 1)
				if (!threshold) return
				thresholds.splice(index - 1, 0, threshold)
				current.attributes[parentIndex].thresholds = thresholds
			}
		}

		await game.settings.set(SYSTEM_NAME, SETTINGS.DEFAULT_ATTRIBUTES, current)
		// HACK: to fix when types catch up
		await (this as unknown as api.ApplicationV2).render()
	}
	static async #onMoveItemDown(event: Event): Promise<void> {
		event.preventDefault()
		const current = game.settings.get(SYSTEM_NAME, SETTINGS.DEFAULT_ATTRIBUTES).toObject()
		const el = event.target as HTMLElement
		const type = el.dataset.itemType

		switch (type) {
			case "attribute": {
				const index = parseInt(el.dataset.itemIndex ?? "")
				if (isNaN(index)) return
				const [attribute] = current.attributes.splice(index, 1)
				if (!attribute) return
				current.attributes.splice(index + 1, 0, attribute)
				break
			}
			case "threshold": {
				const index = parseInt(el.dataset.itemIndex ?? "")
				const parentIndex = parseInt(el.dataset.parentIndex ?? "")
				if (isNaN(index) || isNaN(parentIndex)) return
				const thresholds = current.attributes[parentIndex].thresholds
				if (!thresholds) return
				const [threshold] = thresholds.splice(index, 1)
				if (!threshold) return
				thresholds.splice(index + 1, 0, threshold)
				current.attributes[parentIndex].thresholds = thresholds
			}
		}

		await game.settings.set(SYSTEM_NAME, SETTINGS.DEFAULT_ATTRIBUTES, current)
		// HACK: to fix when types catch up
		await (this as unknown as api.ApplicationV2).render()
	}

	static async #onAddItem(event: Event): Promise<void> {
		event.preventDefault()

		const current = game.settings.get(SYSTEM_NAME, SETTINGS.DEFAULT_ATTRIBUTES).toObject()
		const el = event.target as HTMLElement
		const type = el.dataset.itemType

		switch (type) {
			case "attribute": {
				current.attributes.push(new AttributeDef({}).toObject())
				break
			}
			case "threshold": {
				const index = parseInt(el.dataset.itemIndex ?? "")
				if (isNaN(index)) return
				const thresholds = current.attributes[index].thresholds
				if (!thresholds) return
				thresholds.push(new PoolThreshold({}).toObject())
				current.attributes[index].thresholds = thresholds
			}
		}

		await game.settings.set(SYSTEM_NAME, SETTINGS.DEFAULT_ATTRIBUTES, current)
		// HACK: to fix when types catch up
		await (this as unknown as api.ApplicationV2).render()
	}

	static async #onDeleteItem(event: Event): Promise<void> {
		event.preventDefault()
		const current = game.settings.get(SYSTEM_NAME, SETTINGS.DEFAULT_ATTRIBUTES).toObject()
		const el = event.target as HTMLElement
		const type = el.dataset.itemType

		switch (type) {
			case "attribute": {
				const index = parseInt(el.dataset.itemIndex ?? "")
				if (isNaN(index)) return
				current.attributes.splice(index, 1)
				break
			}
			case "threshold": {
				const index = parseInt(el.dataset.itemIndex ?? "")
				const parentIndex = parseInt(el.dataset.parentIndex ?? "")
				if (isNaN(index) || isNaN(parentIndex)) return
				const thresholds = current.attributes[parentIndex].thresholds
				if (!thresholds) return
				thresholds.splice(index, 1)
			}
		}

		await game.settings.set(SYSTEM_NAME, SETTINGS.DEFAULT_ATTRIBUTES, current)
		// HACK: to fix when types catch up
		await (this as unknown as api.ApplicationV2).render()
	}
}

export { AttributesConfig, AttributeSettings }
