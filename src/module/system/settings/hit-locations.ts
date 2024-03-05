import { MenuTemplateData, PartialSettingsData, SettingsMenuGURPS, settingsToSheetData } from "./menu.ts"
import { SETTINGS, SYSTEM_NAME } from "@data"
import { defaultSettings } from "./defaults.ts"
import { htmlClosest, htmlQuery } from "@util/dom.ts"
import { DnD, LocalizeGURPS, prepareFormData } from "@util"
import { HitLocationObj } from "@system"
import { DropDataType } from "@module/apps/damage-calculator/damage-chat-message.ts"

enum ListType {
	Locations = "locations",
	SubTable = "sub_table",
}

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
				type: Array<HitLocationObj>,
			},
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

	override activateListeners($html: JQuery<HTMLElement>): void {
		super.activateListeners($html)
		const html = $html[0]

		htmlQuery(html, ".item")?.addEventListener("dragover", event => this._onDragItem(event))
		htmlQuery(html, ".add")?.addEventListener("click", event => this._onAddItem(event))
		htmlQuery(html, ".delete")?.addEventListener("click", event => this._onDeleteItem(event))
	}

	protected _onDataImport(_event: MouseEvent): void {}

	protected _onDataExport(_event: MouseEvent): void {}

	protected _onDragItem(event: DragEvent): void {
		const element = $(event.currentTarget!)
		const heightAcross = (event.pageY! - element.offset()!.top) / element.height()!
		element.siblings(".item").removeClass("border-top").removeClass("border-bottom")
		if (heightAcross > 0.5) {
			element.removeClass("border-top")
			element.addClass("border-bottom")
		} else {
			element.removeClass("border-bottom")
			element.addClass("border-top")
		}
	}

	protected async _onAddItem(event: MouseEvent): Promise<this> {
		const path = htmlQuery(event.target, "[data-path]")?.dataset.path?.replace("array.", "") ?? ""
		let locations = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`)
		const type: ListType = htmlQuery(event.target, "[data-type]")?.dataset.type as ListType
		let formData: Record<string, unknown> = {}

		switch (type) {
			case ListType.Locations:
				locations.push({
					id: LocalizeGURPS.translations.gurps.placeholder.hit_location.id,
					choice_name: LocalizeGURPS.translations.gurps.placeholder.hit_location.choice_name,
					table_name: LocalizeGURPS.translations.gurps.placeholder.hit_location.table_name,
					slots: 0,
					hit_penalty: 0,
					dr_bonus: 0,
					description: "",
				})
				formData ??= {}
				formData[`array.${path}.locations`] = locations
				await this._updateObject(event as unknown as Event, formData)
				return this.render()
			case ListType.SubTable: {
				const index = Number(htmlQuery(event.target, "[data-index]")?.dataset.index)
				locations = (fu.getProperty(this.object, `${path}`) as HitLocationObj[]) ?? []
				locations[index].sub_table = {
					name: "",
					roll: "1d",
					locations: [
						{
							id: LocalizeGURPS.translations.gurps.placeholder.hit_location.id,
							choice_name: LocalizeGURPS.translations.gurps.placeholder.hit_location.choice_name,
							table_name: LocalizeGURPS.translations.gurps.placeholder.hit_location.table_name,
							slots: 0,
							hit_penalty: 0,
							dr_bonus: 0,
							description: "",
						},
					],
				}
				formData ??= {}
				formData[`array.${path}.locations`] = locations
				await this._updateObject(event as unknown as Event, formData)
				return this.render()
			}
		}
	}

	protected async _onDeleteItem(event: MouseEvent): Promise<this> {
		const path = htmlQuery(event.target, "[data-path]")?.dataset.path?.replace("array.", "") ?? ""
		const locations = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`)
		let formData: Record<string, unknown> = {}
		const type: ListType = htmlQuery(event.target, "[data-type]")?.dataset.type as ListType
		const index = Number(htmlQuery(event.target, "[data-index]")?.dataset.index)
		switch (type) {
			case ListType.Locations:
				locations.splice(index, 1)
				formData ??= {}
				formData[`array.${path}`] = locations
				await this._updateObject(event as unknown as Event, formData)
				return this.render()
			case ListType.SubTable:
				// Locations = getProperty(this.object, `${path}`) ?? []
				delete locations[index].sub_table
				formData ??= {}
				formData[`array.${path}`] = locations
				await this._updateObject(event as unknown as Event, formData)
				return this.render()
		}
	}

	protected override _onDrop(event: DragEvent): void {
		const dragData = DnD.getDragData(event, DnD.TEXT_PLAIN)
		const element = htmlClosest(event.target, ".item")
		if (!element) return

		const attributes = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`)
		const effects = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`)
		const index = parseInt(element.dataset.index ?? "-1")
		if (index === -1) return
		const above = element.classList.contains("border-top")

		if (dragData.type === DropDataType.Item || dragData.type === DropDataType.Damage) return
		if (dragData.order === index) return
		if (above && dragData.order === index - 1) return
		if (!above && dragData.order === index + 1) return

		switch (dragData.type) {
			case DropDataType.Attributes: {
				const item = attributes.splice(dragData.index, 1)[0]
				attributes.splice(index, 0, item)
				attributes.forEach((v, k) => (v.order = k))
				break
			}
			case DropDataType.Effects: {
				const item = effects.splice(dragData.index, 1)[0]
				effects.splice(index, 0, item)
				break
			}
			case DropDataType.AttributeThresholds: {
				const item = attributes[dragData.parent_index].thresholds?.splice(dragData.index, 1)[0]
				if (!item) break
				attributes[dragData.parent_index].thresholds?.splice(index, 0, item)
				break
			}
		}

		game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`, attributes)
		game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`, effects)
		this.render()
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
		console.log(data)
		await super._updateObject(event, data)
		this.render()
	}
}
