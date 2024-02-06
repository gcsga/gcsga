import { PartialSettingsData, SettingsMenuGURPS } from "./menu.ts"
import { SETTINGS, SYSTEM_NAME } from "@data"
import { defaultSettings } from "./defaults.ts"
import { HitLocationData } from "@actor/character/hit_location.ts"
import { htmlClosest, htmlQuery } from "@util/dom.ts"
import { LocalizeGURPS, prepareFormData } from "@util"
import { DnD } from "@util/drag_drop.ts"
import { DropDataType } from "@module/apps/damage_calculator/damage_chat_message.ts"

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
				type: Array<HitLocationData>,
			},
		}
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
				locations = (fu.getProperty(this.object, `${path}`) as HitLocationData[]) ?? []
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

	protected override async _updateObject(_event: Event, data: Record<string, unknown>): Promise<void> {
		const attributes = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`)
		const effects = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`)
		data = prepareFormData(data, { system: { settings: { attributes } }, effects })
		game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`, attributes)
		game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.effects`, effects)
	}
}

// export class DefaultHitLocationSettings extends SettingsMenuGURPS {
// 	static override readonly namespace = "default_hit_locations"
//
// 	static override readonly SETTINGS = ["name", "roll", "locations"]
//
// 	protected static override get settings() {
// 		return {
// 			name: {
// 				name: "",
// 				hint: "",
// 				type: String,
// 				default: "Humanoid",
// 			},
// 			roll: {
// 				name: "",
// 				hint: "",
// 				type: String,
// 				default: "3d",
// 			},
// 			locations: {
// 				name: "",
// 				hint: "",
// 				type: Array,
// 				default: [
// 					{
// 						id: "eye",
// 						choice_name: "Eyes",
// 						table_name: "Eyes",
// 						slots: 0,
// 						hit_penalty: -9,
// 						dr_bonus: 0,
// 						description:
// 							"An attack that misses by 1 hits the torso instead. Only impaling (imp), piercing (pi-, pi, pi+, pi++), and tight-beam burning (burn) attacks can target the eye – and only from the front or sides. Injury over HP÷10 blinds the eye. Otherwise, treat as skull, but without the extra DR!",
// 						calc: {
// 							roll_range: "-",
// 							dr: {
// 								all: 0,
// 							},
// 						},
// 					},
// 					{
// 						id: "skull",
// 						choice_name: "Skull",
// 						table_name: "Skull",
// 						slots: 2,
// 						hit_penalty: -7,
// 						dr_bonus: 2,
// 						description:
// 							"An attack that misses by 1 hits the torso instead. Wounding modifier is x4. Knockdown rolls are at -10. Critical hits use the Critical Head Blow Table (B556). Exception: These special effects do not apply to toxic (tox) damage.",
// 						calc: {
// 							roll_range: "3-4",
// 							dr: {
// 								all: 2,
// 							},
// 						},
// 					},
// 					{
// 						id: "face",
// 						choice_name: "Face",
// 						table_name: "Face",
// 						slots: 1,
// 						hit_penalty: -5,
// 						dr_bonus: 0,
// 						description:
// 							"An attack that misses by 1 hits the torso instead. Jaw, cheeks, nose, ears, etc. If the target has an open-faced helmet, ignore its DR. Knockdown rolls are at -5. Critical hits use the Critical Head Blow Table (B556). Corrosion (cor) damage gets a x1½ wounding modifier, and if it inflicts a major wound, it also blinds one eye (both eyes on damage over full HP). Random attacks from behind hit the skull instead.",
// 						calc: {
// 							roll_range: "5",
// 							dr: {
// 								all: 0,
// 							},
// 						},
// 					},
// 					{
// 						id: "leg",
// 						choice_name: "Leg",
// 						table_name: "Right Leg",
// 						slots: 2,
// 						hit_penalty: -2,
// 						dr_bonus: 0,
// 						description:
// 							"Reduce the wounding multiplier of large piercing (pi+), huge piercing (pi++), and impaling (imp) damage to x1. Any major wound (loss of over ½ HP from one blow) cripples the limb. Damage beyond that threshold is lost.",
// 						calc: {
// 							roll_range: "6-7",
// 							dr: {
// 								all: 0,
// 							},
// 						},
// 					},
// 					{
// 						id: "arm",
// 						choice_name: "Arm",
// 						table_name: "Right Arm",
// 						slots: 1,
// 						hit_penalty: -2,
// 						dr_bonus: 0,
// 						description:
// 							"Reduce the wounding multiplier of large piercing (pi+), huge piercing (pi++), and impaling (imp) damage to x1. Any major wound (loss of over ½ HP from one blow) cripples the limb. Damage beyond that threshold is lost. If holding a shield, double the penalty to hit: -4 for shield arm instead of -2.",
// 						calc: {
// 							roll_range: "8",
// 							dr: {
// 								all: 0,
// 							},
// 						},
// 					},
// 					{
// 						id: "torso",
// 						choice_name: "Torso",
// 						table_name: "Torso",
// 						slots: 2,
// 						hit_penalty: 0,
// 						dr_bonus: 0,
// 						description: "",
// 						calc: {
// 							roll_range: "9-10",
// 							dr: {
// 								all: 0,
// 							},
// 						},
// 					},
// 					{
// 						id: "groin",
// 						choice_name: "Groin",
// 						table_name: "Groin",
// 						slots: 1,
// 						hit_penalty: -3,
// 						dr_bonus: 0,
// 						description:
// 							"An attack that misses by 1 hits the torso instead. Human males and the males of similar species suffer double shock from crushing (cr) damage, and get -5 to knockdown rolls. Otherwise, treat as a torso hit.",
// 						calc: {
// 							roll_range: "11",
// 							dr: {
// 								all: 0,
// 							},
// 						},
// 					},
// 					{
// 						id: "arm",
// 						choice_name: "Arm",
// 						table_name: "Left Arm",
// 						slots: 1,
// 						hit_penalty: -2,
// 						dr_bonus: 0,
// 						description:
// 							"Reduce the wounding multiplier of large piercing (pi+), huge piercing (pi++), and impaling (imp) damage to x1. Any major wound (loss of over ½ HP from one blow) cripples the limb. Damage beyond that threshold is lost. If holding a shield, double the penalty to hit: -4 for shield arm instead of -2.",
// 						calc: {
// 							roll_range: "12",
// 							dr: {
// 								all: 0,
// 							},
// 						},
// 					},
// 					{
// 						id: "leg",
// 						choice_name: "Leg",
// 						table_name: "Left Leg",
// 						slots: 2,
// 						hit_penalty: -2,
// 						dr_bonus: 0,
// 						description:
// 							"Reduce the wounding multiplier of large piercing (pi+), huge piercing (pi++), and impaling (imp) damage to x1. Any major wound (loss of over ½ HP from one blow) cripples the limb. Damage beyond that threshold is lost.",
// 						calc: {
// 							roll_range: "13-14",
// 							dr: {
// 								all: 0,
// 							},
// 						},
// 					},
// 					{
// 						id: "hand",
// 						choice_name: "Hand",
// 						table_name: "Hand",
// 						slots: 1,
// 						hit_penalty: -4,
// 						dr_bonus: 0,
// 						description:
// 							"If holding a shield, double the penalty to hit: -8 for shield hand instead of -4. Reduce the wounding multiplier of large piercing (pi+), huge piercing (pi++), and impaling (imp) damage to x1. Any major wound (loss of over ⅓ HP from one blow) cripples the extremity. Damage beyond that threshold is lost.",
// 						calc: {
// 							roll_range: "15",
// 							dr: {
// 								all: 0,
// 							},
// 						},
// 					},
// 					{
// 						id: "foot",
// 						choice_name: "Foot",
// 						table_name: "Foot",
// 						slots: 1,
// 						hit_penalty: -4,
// 						dr_bonus: 0,
// 						description:
// 							"Reduce the wounding multiplier of large piercing (pi+), huge piercing (pi++), and impaling (imp) damage to x1. Any major wound (loss of over ⅓ HP from one blow) cripples the extremity. Damage beyond that threshold is lost.",
// 						calc: {
// 							roll_range: "16",
// 							dr: {
// 								all: 0,
// 							},
// 						},
// 					},
// 					{
// 						id: "neck",
// 						choice_name: "Neck",
// 						table_name: "Neck",
// 						slots: 2,
// 						hit_penalty: -5,
// 						dr_bonus: 0,
// 						description:
// 							"An attack that misses by 1 hits the torso instead. Neck and throat. Increase the wounding multiplier of crushing (cr) and corrosion (cor) attacks to x1½, and that of cutting (cut) damage to x2. At the GM’s option, anyone killed by a cutting (cut) blow to the neck is decapitated!",
// 						calc: {
// 							roll_range: "17-18",
// 							dr: {
// 								all: 0,
// 							},
// 						},
// 					},
// 					{
// 						id: "vitals",
// 						choice_name: "Vitals",
// 						table_name: "Vitals",
// 						slots: 0,
// 						hit_penalty: -3,
// 						dr_bonus: 0,
// 						description:
// 							"An attack that misses by 1 hits the torso instead. Heart, lungs, kidneys, etc. Increase the wounding modifier for an impaling (imp) or any piercing (pi-, pi, pi+, pi++) attack to x3. Increase the wounding modifier for a tight-beam burning (burn) attack to x2. Other attacks cannot target the vitals.",
// 						calc: {
// 							roll_range: "-",
// 							dr: {
// 								all: 0,
// 							},
// 						},
// 					},
// 				],
// 			},
// 		}
// 	}
//
// 	override async getData(): Promise<any> {
// 		const name = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.name`)
// 		const roll = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.roll`)
// 		const locations = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`)
// 		return {
// 			body_type: {
// 				name: name,
// 				roll: roll,
// 				locations: locations,
// 			},
// 			actor: null,
// 			path: "array.body_type",
// 			config: CONFIG.GURPS,
// 		}
// 	}
//
// 	activateListeners(html: JQuery<HTMLElement>): void {
// 		super.activateListeners(html)
// 		html.find(".item").on("dragover", event => this._onDragItem(event))
// 		html.find(".add").on("click", event => this._onAddItem(event))
// 		html.find(".delete").on("click", event => this._onDeleteItem(event))
// 	}
//
// 	_onDataImport(event: JQuery.ClickEvent) {
// 		event.preventDefault()
// 	}
//
// 	_onDataExport(event: JQuery.ClickEvent) {
// 		event.preventDefault()
// 		const extension = "body"
// 		const data = {
// 			type: "body_type",
// 			version: 4,
// 			name: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.name`),
// 			roll: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.roll`),
// 			locations: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`),
// 		}
// 		return foundry.utils.saveDataToFile(
// 			JSON.stringify(data, null, "\t"),
// 			extension,
// 			`${LocalizeGURPS.translations.gurps.settings.default_hit_locations.name}.${extension}`,
// 		)
// 	}
//
// async _onAddItem(event: JQuery.ClickEvent) {
// 	event.preventDefault()
// 	event.stopPropagation()
// 	let path = ""
// 	let locations = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`)
// 	const type: "locations" | "sub_table" = $(event.currentTarget).data("type")
// 	let formData: any = {}
// 	switch (type) {
// 		case "locations":
// 			path = $(event.currentTarget).data("path").replace("array.", "")
// 			locations.push({
// 				id: LocalizeGURPS.translations.gurps.placeholder.hit_location.id,
// 				choice_name: LocalizeGURPS.translations.gurps.placeholder.hit_location.choice_name,
// 				table_name: LocalizeGURPS.translations.gurps.placeholder.hit_location.table_name,
// 				slots: 0,
// 				hit_penalty: 0,
// 				dr_bonus: 0,
// 				description: "",
// 			})
// 			formData ??= {}
// 			formData[`array.${path}.locations`] = locations
// 			await this._updateObject(event as unknown as Event, formData)
// 			return this.render()
// 		case "sub_table":
// 			path = $(event.currentTarget).data("path").replace("array.", "")
// 			const index = Number($(event.currentTarget).data("index"))
// 			locations = getProperty(this.object, `${path}`) ?? []
// 			locations[index].sub_table = {
// 				name: "",
// 				roll: "1d",
// 				locations: [
// 					{
// 						id: LocalizeGURPS.translations.gurps.placeholder.hit_location.id,
// 						choice_name: LocalizeGURPS.translations.gurps.placeholder.hit_location.choice_name,
// 						table_name: LocalizeGURPS.translations.gurps.placeholder.hit_location.table_name,
// 						slots: 0,
// 						hit_penalty: 0,
// 						dr_bonus: 0,
// 						description: "",
// 					},
// 				],
// 			}
// 			formData ??= {}
// 			formData[`array.${path}.locations`] = locations
// 			await this._updateObject(event as unknown as Event, formData)
// 			return this.render()
// 	}
// }
//
// 	private async _onDeleteItem(event: JQuery.ClickEvent) {
// 		event.preventDefault()
// 		event.stopPropagation()
// 		const path = $(event.currentTarget).data("path")?.replace("array.", "")
// 		const locations = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`)
// 		let formData: any = {}
// 		const type: "locations" | "sub_table" = $(event.currentTarget).data("type")
// 		const index = Number($(event.currentTarget).data("index")) || 0
// 		switch (type) {
// 			case "locations":
// 				// Locations = getProperty(this.object, `${path}`) ?? []
// 				locations.splice($(event.currentTarget).data("index"), 1)
// 				formData ??= {}
// 				formData[`array.${path}`] = locations
// 				await this._updateObject(event as unknown as Event, formData)
// 				return this.render()
// 			case "sub_table":
// 				// Locations = getProperty(this.object, `${path}`) ?? []
// 				delete locations[index].sub_table
// 				formData ??= {}
// 				formData[`array.${path}`] = locations
// 				await this._updateObject(event as unknown as Event, formData)
// 				return this.render()
// 		}
// 	}
//
// 	async _onDragStart(event: DragEvent) {
// 		// TODO:update
// 		const item = $(event.currentTarget!)
// 		const type: "locations" = item.data("type")
// 		const index = Number(item.data("index"))
// 		event.dataTransfer?.setData(
// 			"text/plain",
// 			JSON.stringify({
// 				type: type,
// 				index: index,
// 			}),
// 		)
// 		;(event as any).dragType = type
// 	}
//
// 	protected _onDragItem(event: JQuery.DragOverEvent): void {
// 		const element = $(event.currentTarget!)
// 		const heightAcross = (event.pageY! - element.offset()!.top) / element.height()!
// 		element.siblings(".item").removeClass("border-top").removeClass("border-bottom")
// 		if (heightAcross > 0.5) {
// 			element.removeClass("border-top")
// 			element.addClass("border-bottom")
// 		} else {
// 			element.removeClass("border-bottom")
// 			element.addClass("border-top")
// 		}
// 	}
//
// 	protected async _onDrop(event: DragEvent): Promise<unknown> {
// 		const dragData = DnD.getDragData(event, DnD.TEXT_PLAIN)
// 		let element = $(event.target!)
// 		if (!element.hasClass("item")) element = element.parent(".item")
//
// 		const target_index = element.data("index")
// 		const above = element.hasClass("border-top")
// 		if (dragData.order === target_index) return this.render()
// 		if (above && dragData.order === target_index - 1) return this.render()
// 		if (!above && dragData.order === target_index + 1) return this.render()
//
// 		let container: any[] = []
// 		const path = element.data("path")?.replace("array.", "")
// 		if (dragData.type === "locations") container = getProperty(this.object, path)
// 		if (!container) return
//
// 		let item
// 		item = container.splice(dragData.index, 1)[0]
// 		container.splice(target_index, 0, item as any)
//
// 		const formData: any = {}
// 		formData[`array.${path}`] = container
// 		return this._updateObject(event, formData)
// 	}
//
// 	protected override async _updateObject(event: Event, formData: any): Promise<void> {
// 		const body_type = {
// 			name: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.name`),
// 			roll: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.roll`),
// 			locations: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`),
// 		} as HitLocationTableData
// 		formData = prepareFormData(formData, { body_type: body_type })
// 		Object.keys(formData).forEach(k => {
// 			formData[k.replace("body_type.", "")] = formData[k]
// 			delete formData[k]
// 		})
// 		await super._updateObject(event, formData)
// 		await this.render()
// 	}
// }
