import { MenuTemplateData, PartialSettingsData, SettingsMenuGURPS, settingsToSheetData } from "./menu.ts"
import { SETTINGS, SYSTEM_NAME } from "@data"
import { defaultSettings } from "./defaults.ts"
import { htmlQueryAll } from "@util/dom.ts"
import { DnD, prepareFormData } from "@util"
import { DropDataType } from "@module/apps/damage-calculator/damage-chat-message.ts"
import { DropDataContext } from "@module/util/settings-helpers.ts"
import { SettingsHelpers } from "@module/util/index.ts"
import { BodySchema, HitLocationSchema } from "@system/hit-location/data.ts"

type ConfigGURPSListName = (typeof HitLocationSettings.SETTINGS)[number]

export class HitLocationSettings extends SettingsMenuGURPS {
	static override readonly namespace = SETTINGS.DEFAULT_HIT_LOCATIONS

	static override readonly SETTINGS = ["name", "roll", "locations"] as const

	protected static override get settings(): Record<ConfigGURPSListName, PartialSettingsData> {
		return {
			name: {
				prefix: this.namespace,
				name: "bodytype name",
				hint: "bodytype name hint",
				default: "Humanoid",
				type: String,
			},
			roll: {
				prefix: this.namespace,
				name: "bodytype roll",
				hint: "bodytype roll hint",
				default: "3d6",
				type: String,
			},
			locations: {
				prefix: this.namespace,
				name: "bodtype locations ",
				hint: "bodytype locations hint",
				default: defaultSettings[SYSTEM_NAME][`${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`],
				type: Array<ModelPropsFromSchema<HitLocationSchema>>,
			},
		}
	}

	get bodyType(): ModelPropsFromSchema<BodySchema> {
		return {
			name: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.name`),
			roll: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.roll`),
			locations: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`),
		}
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
				case "add-location":
					button.addEventListener("click", () => SettingsHelpers.addHitLocation(context))
					break
				case "add-sub-table":
					button.addEventListener("click", () => SettingsHelpers.addSubTable(context))
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
				case "remove-location":
					button.addEventListener("click", () => SettingsHelpers.removeHitLocation(context))
					break
				case "remove-sub-table":
					button.addEventListener("click", () => SettingsHelpers.removeSubTable(context))
					break
			}
		}
	}

	override async getData(): Promise<MenuTemplateData & { path: string }> {
		const settings = (this.constructor as typeof SettingsMenuGURPS).settings
		const templateData = settingsToSheetData(settings, this.cache)

		// Ensure cache values are initialized
		for (const [key, value] of Object.entries(settings)) {
			if (!(key in this.cache)) {
				this.cache[key] = game.settings.get(SYSTEM_NAME, `${value.prefix ?? ""}.${key}`)
			}
		}

		return fu.mergeObject(await super.getData(), {
			config: CONFIG.GURPS,
			settings: templateData,
			instructions: `gurps.settings.${this.namespace}.hint`,
			path: "array.body_type",
		})
	}

	protected _onDataImport(_event: MouseEvent): void {}

	protected _onDataExport(_event: MouseEvent): void {}

	protected override _onDrop(event: DragEvent): void {
		const dragData = DnD.getDragData(event, DnD.TEXT_PLAIN)

		if (dragData.type !== DropDataType.HitLocation) return

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

		return SettingsHelpers.onDropHitLocation(dragData, context)
	}

	protected override async _updateObject(event: Event, data: Record<string, unknown>): Promise<void> {
		const body_type = {
			name: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.name`),
			roll: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.roll`),
			locations: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`),
		}
		data = prepareFormData(data, { body_type: body_type })
		Object.keys(data).forEach(k => {
			data[k.replace("body_type.", "")] = data[k]
			delete data[k]
		})
		await super._updateObject(event, data)
		this.render()
	}
}
