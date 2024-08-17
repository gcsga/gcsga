import { SETTINGS, SYSTEM_NAME } from "@module/data/index.ts"
import { PartialSettingsData, SettingsMenuGURPS } from "./menu.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { htmlQueryAll } from "@util/dom.ts"
import { defaultSettings } from "./defaults.ts"
import { DnD } from "@util"
import { DropDataType } from "@module/apps/damage-calculator/damage-chat-message.ts"
import { DropDataContext } from "@module/util/settings-helpers.ts"
import { SettingsHelpers } from "@module/util/index.ts"
import { AttributeDef } from "@system/attribute/definition.ts"

type ConfigGURPSListName = (typeof AttributeSettings.SETTINGS)[number]

export class AttributeSettings extends SettingsMenuGURPS {
	static override readonly namespace = SETTINGS.DEFAULT_ATTRIBUTES

	static override readonly SETTINGS = ["attributes", "effects"] as const

	protected static override get settings(): Record<ConfigGURPSListName, PartialSettingsData> {
		return {
			attributes: {
				prefix: SETTINGS.DEFAULT_ATTRIBUTES,
				name: "attributes temp",
				hint: "attributes hint temp",
				default: defaultSettings[SYSTEM_NAME][`${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`],
				type: Object,
				onChange: () => {},
			},
			effects: {
				prefix: SETTINGS.DEFAULT_ATTRIBUTES,
				name: "effects temp",
				hint: "effects hint temp",
				default: defaultSettings[SYSTEM_NAME][`${SETTINGS.DEFAULT_ATTRIBUTES}.effects`],
				type: Object,
				onChange: () => {},
			},
		}
	}

	static override get defaultOptions(): FormApplicationOptions {
		const options = super.defaultOptions
		return {
			...options,
			tabs: [
				{
					navSelector: "nav",
					contentSelector: "section.content",
					initial: "attributes",
				},
			],
			dragDrop: [
				{
					dragSelector: ".item-list .item .controls .drag",
					dropSelector: null,
				},
			],
		}
	}

	get attributes(): AttributeDef[] {
		return game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`).map(e => new AttributeDef(e))
	}

	override activateListeners($html: JQuery<HTMLElement>): void {
		super.activateListeners($html)
		const html = $html[0]

		for (const button of htmlQueryAll(html, "a[data-action^=add-]")) {
			const context: DropDataContext = {
				element: button,
				app: this,
				targetIndex: 0,
			}

			switch (button.dataset.action) {
				case "add-attribute":
					button.addEventListener("click", () => SettingsHelpers.addAttribute(context))
					break
				case "add-attribute-threshold":
					button.addEventListener("click", () => SettingsHelpers.addAttributeThreshold(context))
					break
			}
		}

		for (const button of htmlQueryAll(html, "a[data-action^=remove-]")) {
			const context: DropDataContext = {
				element: button,
				app: this,
				targetIndex: 0,
			}

			switch (button.dataset.action) {
				case "remove-attribute":
					button.addEventListener("click", () => SettingsHelpers.removeAttribute(context))
					break
				case "remove-attribute-threshold":
					button.addEventListener("click", () => SettingsHelpers.removeAttributeThreshold(context))
					break
			}
		}
	}

	protected _onDataImport(_event: MouseEvent): void {}

	protected _onDataExport(_event: MouseEvent): void {
		const extension = "attr"
		const data = {
			type: "attribute_settings",
			version: 4,
			rows: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`),
		}
		saveDataToFile(
			JSON.stringify(data, null, "\t"),
			extension,
			`${LocalizeGURPS.translations.gurps.settings.default_attributes.name}.${extension}`,
		)
	}

	protected override _onDrop(event: DragEvent): void {
		const dragData = DnD.getDragData(event, DnD.TEXT_PLAIN)

		if (dragData.type === DropDataType.Damage) return
		if (dragData.type === DropDataType.Item) return
		if (dragData.type === DropDataType.HitLocation) return
		if (dragData.type === DropDataType.SubTable) return
		if (dragData.type === DropDataType.ResourceTracker) return
		if (dragData.type === DropDataType.ResourceTrackerThreshold) return
		if (dragData.type === DropDataType.MoveType) return
		if (dragData.type === DropDataType.MoveTypeOverride) return

		let element = event.currentTarget
		if (!(element instanceof HTMLElement)) return console.error("Drop event target is not valid.")
		while (!element.classList.contains("item")) {
			element = element.parentElement
			if (!(element instanceof HTMLElement)) return console.error("Drop event target is not valid.")
		}

		const targetIndex = parseInt(element.dataset.index ?? "")
		if (isNaN(targetIndex)) return console.error("Drop target index is not valid", element)

		const above = element.classList.contains("border-top")
		if (above && dragData.order === targetIndex - 1) return
		if (!above && dragData.order === targetIndex + 1) return

		const context: DropDataContext = {
			element,
			app: this,
			targetIndex,
		}

		switch (dragData.type) {
			case DropDataType.Attribute:
				return SettingsHelpers.onDropAttribute(dragData, context)
			case DropDataType.AttributeThreshold:
				return SettingsHelpers.onDropAttributeThreshold(dragData, context)
			case DropDataType.Effect: {
				const effects = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`)
				const index = parseInt(element.dataset.index ?? "")
				if (isNaN(index)) return console.error("Invalid index")

				const item = effects.splice(dragData.index, 1)[0]
				effects.splice(index, 0, item)
			}
		}
	}

	// protected override async _updateObject(_event: Event, data: Record<string, unknown>): Promise<void> {
	// 	const attributes = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`)
	// 	const effects = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`)
	// 	// data = prepareFormData(data, { system: { settings: { attributes } }, effects })
	// 	game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`, attributes)
	// 	game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`, effects)
	// }
}
