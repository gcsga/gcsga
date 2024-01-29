import { attribute } from "@util/enum/attribute.ts"
import { ItemGURPS } from "./document.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { SETTINGS, SYSTEM_NAME, gid } from "@module/data/index.ts"
import { HitLocationData, HitLocationTableData } from "@actor/character/hit_location.ts"
import { PDF } from "@module/pdf/index.ts"
import { NumericCompareType, StringCompareType, prepareFormData } from "@util"
import { prereq } from "@util/enum/prereq.ts"
import { BasePrereqObj, PrereqListObj, TraitPrereqObj } from "@prereq/data.ts"
import { feature } from "@util/enum/feature.ts"
import { study } from "@util/enum/study.ts"
import { FeatureObj } from "@feature"
import { ActorGURPS } from "@actor"

class ItemSheetGURPS<TItem extends ItemGURPS> extends ItemSheet<TItem, ItemSheetOptions> {
	constructor(item: TItem, options: Partial<ItemSheetOptions> = {}) {
		super(item, options)
		this.options.classes.push(this.item.type)
	}

	static override get defaultOptions(): ItemSheetOptions {
		const options = super.defaultOptions
		options.classes.push("gurps", "item")

		return {
			...options,
			width: 620,
			// min_width: 620,
			height: 800,
		}
	}

	override async getData(options: Partial<ItemSheetOptions> = {}): Promise<ItemSheetDataGURPS<TItem>> {
		options.editable = this.isEditable
		const { item } = this
		const attributes = this.item.actor
			? Object.values(this.item.actor.attributes).reduce((acc, c) => {
					if (
						[
							attribute.Type.PrimarySeparator,
							attribute.Type.SecondarySeparator,
							attribute.Type.PoolSeparator,
						].includes(c.attribute_def.type)
					)
						return acc
					return { ...acc, [c.id]: c.attribute_def.name }
				}, {})
			: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`).reduce((acc, c) => {
					if (
						[
							attribute.Type.PrimarySeparator,
							attribute.Type.SecondarySeparator,
							attribute.Type.PoolSeparator,
						].includes(c.type)
					)
						return acc
					return { ...acc, [c.id]: c.name }
				})
		attributes.dodge = LocalizeGURPS.translations.gurps.attributes.dodge
		attributes.parry = LocalizeGURPS.translations.gurps.attributes.parry
		attributes.block = LocalizeGURPS.translations.gurps.attributes.block

		const locations = this._getHitLocations()

		const moveTypes = this.item.actor
			? Object.values(this.item.actor.moveTypes).reduce((acc, c) => {
					return { ...acc, [c.id]: c.move_type_def.name }
				}, {})
			: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`).reduce((acc, c) => {
					return { ...acc, [c.id]: c.name }
				})

		return {
			attributes,
			moveTypes,
			locations,
			cssClass: this.isEditable ? "editable" : "locked",
			editable: this.isEditable,
			document: item,
			item,
			data: item.system,
			title: this.title,
			config: CONFIG.GURPS,
		}
	}

	private _getHitLocations(): Record<string, string> {
		if (this.item.actor)
			return this.item.actor.HitLocations.reduce(
				(acc, c) => {
					return { ...acc, [c.id]: c.choice_name }
				},
				{ [gid.All]: LocalizeGURPS.translations.gurps.feature.all_locations },
			)

		const recurseLocations = function (
			table: HitLocationTableData,
			locations: HitLocationData[] = [],
		): HitLocationData[] {
			table.locations.forEach(e => {
				locations.push(e)
				if (e.sub_table) locations = recurseLocations(e.sub_table, locations)
			})
			return locations
		}

		const table = {
			name: "",
			roll: "",
			locations: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`),
		}
		return recurseLocations(table, []).reduce(
			(acc, c) => {
				return { ...acc, [c.id]: c.choice_name }
			},
			{ [gid.All]: LocalizeGURPS.translations.gurps.feature.all_locations },
		)
	}

	// getData(options?: Partial<DocumentSheetOptions<Item>>): any {
	// 	const itemData = this.object.toObject(false)
	// 	const attributes: Record<string, string> = {}
	// 	const locations: Record<string, string> = {}
	// 	const move_types: Record<string, string> = {}
	// 	locations[gid.All] = LocalizeGURPS.translations.gurps.feature.all_locations
	// 	const default_attributes = game.settings.get(
	// 		SYSTEM_NAME,
	// 		`${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`,
	// 	) as AttributeDefObj[]
	// 	const default_hit_locations = {
	// 		name: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.name`),
	// 		roll: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.roll`),
	// 		locations: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`),
	// 	}
	// 	const actor = this.item.actor as unknown as CharacterGURPS
	// 	if (actor) {
	// 		actor.attributes.forEach(e => {
	// 			if (e.attribute_def.type.includes("_separator")) return
	// 			attributes[e.id] = e.attribute_def.name
	// 		})
	// 		for (const e of actor.HitLocations) {
	// 			locations[e.id] = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.field_prefix.dr, {
	// 				location: e.choice_name,
	// 			})
	// 		}
	// 		actor.move_types.forEach(e => {
	// 			move_types[e.id] = e.move_type_def.name
	// 		})
	// 	} else {
	// 		default_attributes.forEach(e => {
	// 			if (e.type.includes("_separator")) return
	// 			attributes[e.id] = e.name
	// 		})
	// 		default_hit_locations.locations.forEach(e => {
	// 			locations[e.id] = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.field_prefix.dr, {
	// 				location: e.choice_name,
	// 			})
	// 		})
	// 	}
	// 	attributes.dodge = LocalizeGURPS.translations.gurps.attributes.dodge
	// 	attributes.parry = LocalizeGURPS.translations.gurps.attributes.parry
	// 	attributes.block = LocalizeGURPS.translations.gurps.attributes.block
	// 	const item = this.item
	//
	// 	const sheetData = {
	// 		...super.getData(options),
	// 		...{
	// 			document: item,
	// 			item: itemData,
	// 			system: (itemData as any).system,
	// 			config: CONFIG.GURPS,
	// 			attributes: attributes,
	// 			locations: locations,
	// 			move_types: move_types,
	// 			weaponFeatures: feature.WeaponBonusTypes,
	// 			sysPrefix: "array.system.",
	// 		},
	// 	}
	//
	// 	return sheetData
	// }

	override get template(): string {
		return `/systems/${SYSTEM_NAME}/templates/item/${this.item.type}/sheet.hbs`
	}

	override activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)
		html.find("textarea")
			.each(function () {
				this.setAttribute("style", `height:${this.scrollHeight + 2}px;overflow-y:hidden;`)
			})
			.on("input", event => {
				const e = event.currentTarget
				e.style.height = "0px"
				e.style.height = `${e.scrollHeight + 2}px`
			})

		html.find(".ref").on("click", event => PDF.handle(event))
		html.find(".prereq .add-child").on("click", event => this._addPrereqChild(event))
		html.find(".prereq .add-list").on("click", event => this._addPrereqList(event))
		html.find(".prereq .remove").on("click", event => this._removePrereq(event))
		html.find(".prereq .type").on("change", event => this._onPrereqTypeChange(event))
		html.find("#features .add").on("click", event => this._addFeature(event))
		html.find(".feature .remove").on("click", event => this._removeFeature(event))
		html.find(".feature .type").on("change", event => this._onFeatureTypeChange(event))
		html.find("#defaults .add").on("click", event => this._addDefault(event))
		html.find(".default .remove").on("click", event => this._removeDefault(event))
		html.find("#study .add").on("click", event => this._addStudy(event))
		html.find(".study-entry .remove").on("click", event => this._removeStudy(event))
	}

	private splitArray(s: string): string[] {
		const a: string[] = s.split(",").map(e => e.trim())
		if (a.length === 1 && a[0] === "") return []
		return a
	}

	protected override async _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
		formData = prepareFormData(formData, this.object)
		if (typeof formData["system.tags"] === "string")
			formData["system.tags"] = this.splitArray(formData["system.tags"])
		if (typeof formData["system.college"] === "string")
			formData["system.college"] = this.splitArray(formData["system.college"])
		return super._updateObject(event, formData)
	}

	protected async _addPrereqChild(event: JQuery.ClickEvent): Promise<unknown> {
		event.preventDefault()
		if (!this.isEditable) return
		const path = $(event.currentTarget).data("path").replace("array.", "")
		const prereqs = fu.getProperty(this.item, `${path}.prereqs`) as PrereqListObj["prereqs"]
		prereqs.push({
			type: prereq.Type.Trait,
			name: { compare: StringCompareType.IsString, qualifier: "" },
			notes: { compare: StringCompareType.AnyString, qualifier: "" },
			level: { compare: NumericCompareType.AtLeastNumber, qualifier: 0 },
			has: true,
		} as TraitPrereqObj)
		const formData: Record<string, unknown> = {}
		formData[`array.${path}.prereqs`] = prereqs
		return this._updateObject(null as unknown as Event, formData)
	}

	protected async _addPrereqList(event: JQuery.ClickEvent): Promise<void> {
		event.preventDefault()
		if (!this.isEditable) return
		const path = $(event.currentTarget).data("path").replace("array.", "")
		const prereqs = fu.getProperty(this.item, `${path}.prereqs`) as PrereqListObj["prereqs"]
		prereqs.push({
			type: prereq.Type.List,
			all: true,
			when_tl: { compare: NumericCompareType.AnyNumber },
			prereqs: [] as BasePrereqObj[],
		} as PrereqListObj)
		const formData: Record<string, unknown> = {}
		formData[`array.${path}.prereqs`] = prereqs
		return this._updateObject(null as unknown as Event, formData)
	}

	protected async _removePrereq(event: JQuery.ClickEvent): Promise<void> {
		event.preventDefault()
		let path = $(event.currentTarget).data("path").replace("array.", "")
		const items = path.split(".")
		const index = items.pop()
		path = items.join(".")
		const prereqs = fu.getProperty(this.item, `${path}`) as PrereqListObj["prereqs"]
		prereqs.splice(index, 1)
		const formData: Record<string, unknown> = {}
		formData[`array.${path}`] = prereqs
		return this._updateObject(null as unknown as Event, formData)
	}

	protected async _onPrereqTypeChange(event: JQuery.ChangeEvent): Promise<void> {
		event.preventDefault()
		if (!this.isEditable) return
		const value = event.currentTarget.value
		const PrereqConstructor = CONFIG.GURPS.Prereq.classes[value as prereq.Type]
		let path = $(event.currentTarget).data("path").replace("array.", "")
		const items = path.split(".")
		const index = parseInt(items.pop())
		path = items.join(".")
		const prereqs = fu.getProperty(this.item, `${path}`) as PrereqListObj["prereqs"]
		prereqs[index] = PrereqConstructor.fromObject({ has: (prereqs[index] as BasePrereqObj).has })
		const formData: Record<string, unknown> = {}
		formData[`array.${path}`] = prereqs
		return this._updateObject(null as unknown as Event, formData)
	}

	protected async _addFeature(event: JQuery.ClickEvent): Promise<TItem | undefined> {
		event.preventDefault()
		if (!this.isEditable) return this.item
		const features = this.item.system.features
		features.push({
			type: feature.Type.AttributeBonus,
			attribute: "st",
			limitation: "none",
			amount: 1,
			per_level: false,
			levels: 0,
		})
		const update: Record<string, unknown> = {}
		update["system.features"] = features
		return this.item.update(update)
	}

	protected async _removeFeature(event: JQuery.ClickEvent): Promise<TItem | undefined> {
		if (!this.isEditable) return this.item
		const index = $(event.currentTarget).data("index")
		const features = this.item.system.features
		features.splice(index, 1)
		const update: Record<string, unknown> = {}
		update["system.features"] = features
		return this.item.update(update)
	}

	protected async _addDefault(event: JQuery.ClickEvent): Promise<TItem | undefined> {
		event.preventDefault()
		if (!this.isEditable) return this.item
		const defaults = this.item.system.defaults ?? []
		defaults.push({
			type: gid.Skill,
			name: "",
			specialization: "",
			modifier: 0,
		})
		const update: Record<string, unknown> = {}
		update["system.defaults"] = defaults
		return this.item.update(update)
	}

	protected async _removeDefault(event: JQuery.ClickEvent): Promise<TItem | undefined> {
		if (!this.isEditable) return this.item
		const index = $(event.currentTarget).data("index")
		const defaults = this.item.system.defaults ?? []
		defaults.splice(index, 1)
		const update: Record<string, unknown> = {}
		update["system.defaults"] = defaults
		return this.item.update(update)
	}

	protected async _addStudy(event: JQuery.ClickEvent): Promise<TItem | undefined> {
		if (!this.isEditable) return
		event.preventDefault()
		const studyEntry = this.item.system.study
		studyEntry.push({
			type: study.Type.Self,
			hours: 0,
			note: "",
		})
		const update: Record<string, unknown> = {}
		update["system.study"] = studyEntry
		return this.item.update(update)
	}

	protected async _removeStudy(event: JQuery.ClickEvent): Promise<TItem | undefined> {
		if (!this.isEditable) return
		const index = $(event.currentTarget).data("index")
		const studyEntry = this.item.system.study
		studyEntry.splice(index, 1)
		const update: Record<string, unknown> = {}
		update["system.study"] = studyEntry
		return this.item.update(update)
	}

	protected async _onFeatureTypeChange(event: JQuery.ChangeEvent): Promise<TItem | undefined> {
		if (!this.isEditable) return
		const value = event.currentTarget.value
		const index = parseInt($(event.currentTarget).data("index"))
		const FeatureConstructor = CONFIG.GURPS.Feature.classes[value as feature.Type]
		const features = fu.duplicate(this.item.system.features as FeatureObj[])
		let f = new FeatureConstructor(value).toObject()
		if (feature.WeaponBonusTypes.includes(value)) f = new FeatureConstructor(value).toObject()
		features.splice(index, 1, f)
		const update: Record<string, unknown> = {}
		await this.item.update({ "system.-=features": null }, {
			render: false,
			performDeletions: true,
		} as DocumentModificationContext<ActorGURPS>)
		update["system.features"] = features
		return this.item.update(update, { render: true })
	}

	protected override _getHeaderButtons(): ApplicationHeaderButton[] {
		const buttons: ApplicationHeaderButton[] = []
		const all_buttons = [...buttons, ...super._getHeaderButtons()]
		all_buttons.at(-1)!.label = ""
		all_buttons.at(-1)!.icon = "gcs-circled-x"
		return all_buttons
	}
}

interface ItemSheetDataGURPS<TItem extends ItemGURPS> extends ItemSheetData<TItem> {
	item: TItem
	data: TItem["system"]
	config: ConfigGURPS["GURPS"]
	attributes: Record<string, string>
	locations: Record<string, string>
	moveTypes: Record<string, string>
}

type ItemSheetOptions = DocumentSheetOptions

export { ItemSheetGURPS }
export type { ItemSheetDataGURPS, ItemSheetOptions }
