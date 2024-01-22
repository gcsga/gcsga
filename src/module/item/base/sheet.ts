import { CharacterGURPS } from "@actor"
import { AttributeDefObj } from "@module/attribute"
import { gid, SETTINGS, SYSTEM_NAME } from "@module/data"
import { PDF } from "@module/pdf"
import { LocalizeGURPS, NumericCompareType, prepareFormData, StringCompareType } from "@util"
import { BaseItemGURPS } from "."
import { FeatureObj } from "@module/config"
import { feature, prereq, study } from "@util/enum"

// const weaponFeatures = [
// 	FeatureType.WeaponBonus,
// 	FeatureType.WeaponAccBonus,
// 	FeatureType.WeaponScopeAccBonus,
// 	FeatureType.WeaponDRDivisorBonus,
// 	FeatureType.WeaponMinSTBonus,
// 	FeatureType.WeaponMinReachBonus,
// 	FeatureType.WeaponMaxReachBonus,
// 	FeatureType.WeaponHalfDamageRangeBonus,
// 	FeatureType.WeaponMinRangeBonus,
// 	FeatureType.WeaponMaxRangeBonus,
// 	FeatureType.WeaponRecoilBonus,
// 	FeatureType.WeaponBulkBonus,
// 	FeatureType.WeaponParryBonus,
// 	FeatureType.WeaponBlockBonus,
// 	FeatureType.WeaponRofMode1ShotsBonus,
// 	FeatureType.WeaponRofMode1SecondaryBonus,
// 	FeatureType.WeaponRofMode2ShotsBonus,
// 	FeatureType.WeaponRofMode2SecondaryBonus,
// 	FeatureType.WeaponNonChamberShotsBonus,
// 	FeatureType.WeaponChamberShotsBonus,
// 	FeatureType.WeaponShotDurationBonus,
// 	FeatureType.WeaponReloadTimeBonus,
// 	FeatureType.WeaponSwitch,
// ]

export class ItemSheetGURPS<IType extends BaseItemGURPS = BaseItemGURPS> extends ItemSheet {
	declare object: IType

	static override get defaultOptions(): DocumentSheetOptions<Item> {
		const options = super.defaultOptions
		mergeObject(options, {
			width: 620,
			min_width: 620,
			height: 800,
			classes: options.classes.concat(["item", "gurps"]),
		})
		return options
	}

	getData(options?: Partial<DocumentSheetOptions<Item>>): any {
		const itemData = this.object.toObject(false)
		const attributes: Record<string, string> = {}
		const locations: Record<string, string> = {}
		const move_types: Record<string, string> = {}
		locations[gid.All] = LocalizeGURPS.translations.gurps.feature.all_locations
		const default_attributes = game.settings.get(
			SYSTEM_NAME,
			`${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`
		) as AttributeDefObj[]
		const default_hit_locations = {
			name: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.name`),
			roll: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.roll`),
			locations: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`),
		}
		const actor = this.item.actor as unknown as CharacterGURPS
		if (actor) {
			actor.attributes.forEach(e => {
				if (e.attribute_def.type.includes("_separator")) return
				attributes[e.id] = e.attribute_def.name
			})
			for (const e of actor.HitLocations) {
				locations[e.id] = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.field_prefix.dr, {
					location: e.choice_name,
				})
			}
			actor.move_types.forEach(e => {
				move_types[e.id] = e.move_type_def.name
			})
		} else {
			default_attributes.forEach(e => {
				if (e.type.includes("_separator")) return
				attributes[e.id] = e.name
			})
			default_hit_locations.locations.forEach(e => {
				locations[e.id] = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.field_prefix.dr, {
					location: e.choice_name,
				})
			})
		}
		attributes.dodge = LocalizeGURPS.translations.gurps.attributes.dodge
		attributes.parry = LocalizeGURPS.translations.gurps.attributes.parry
		attributes.block = LocalizeGURPS.translations.gurps.attributes.block
		const item = this.item

		const sheetData = {
			...super.getData(options),
			...{
				document: item,
				item: itemData,
				system: (itemData as any).system,
				config: CONFIG.GURPS,
				attributes: attributes,
				locations: locations,
				move_types: move_types,
				weaponFeatures: feature.WeaponBonusTypes,
				sysPrefix: "array.system.",
			},
		}

		return sheetData
	}

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

	protected async _updateObject(event: Event, formData: Record<string, any>): Promise<unknown> {
		formData = prepareFormData(formData, this.object)
		if (typeof formData["system.tags"] === "string")
			formData["system.tags"] = this.splitArray(formData["system.tags"])
		if (typeof formData["system.college"] === "string")
			formData["system.college"] = this.splitArray(formData["system.college"])
		return super._updateObject(event, formData)
	}

	protected async _addPrereqChild(event: JQuery.ClickEvent): Promise<any> {
		event.preventDefault()
		if (!this.isEditable) return
		const path = $(event.currentTarget).data("path").replace("array.", "")
		const prereqs = getProperty(this.item, `${path}.prereqs`)
		prereqs.push({
			type: prereq.Type.Trait,
			name: { compare: StringCompareType.IsString, qualifier: "" },
			notes: { compare: StringCompareType.AnyString, qualifier: "" },
			level: { compare: NumericCompareType.AtLeastNumber, qualifier: 0 },
			has: true,
		})
		const formData: any = {}
		formData[`array.${path}.prereqs`] = prereqs
		return this._updateObject(null as unknown as Event, formData)
	}

	protected async _addPrereqList(event: JQuery.ClickEvent): Promise<any> {
		event.preventDefault()
		if (!this.isEditable) return
		const path = $(event.currentTarget).data("path").replace("array.", "")
		const prereqs = getProperty(this.item, `${path}.prereqs`)
		prereqs.push({
			type: "prereq_list",
			prereqs: [],
			when_tl: { compare: NumericCompareType.AnyNumber },
		})
		const formData: any = {}
		formData[`array.${path}.prereqs`] = prereqs
		return this._updateObject(null as unknown as Event, formData)
	}

	protected async _removePrereq(event: JQuery.ClickEvent): Promise<any> {
		event.preventDefault()
		let path = $(event.currentTarget).data("path").replace("array.", "")
		const items = path.split(".")
		const index = items.pop()
		path = items.join(".")
		const prereqs = getProperty(this.item, `${path}`)
		prereqs.splice(index, 1)
		const formData: any = {}
		formData[`array.${path}`] = prereqs
		return this._updateObject(null as unknown as Event, formData)
	}

	protected async _onPrereqTypeChange(event: JQuery.ChangeEvent): Promise<any> {
		event.preventDefault()
		if (!this.isEditable) return
		const value = event.currentTarget.value
		const PrereqConstructor = CONFIG.GURPS.Prereq.classes[value as prereq.Type]
		let path = $(event.currentTarget).data("path").replace("array.", "")
		const items = path.split(".")
		const index = items.pop()
		path = items.join(".")
		const prereqs = getProperty(this.item, `${path}`)
		prereqs[index] = {
			type: value,
			...PrereqConstructor.defaults,
			has: prereqs[index].has,
		}
		const formData: any = {}
		formData[`array.${path}`] = prereqs
		return this._updateObject(null as unknown as Event, formData)
	}

	protected async _addFeature(event: JQuery.ClickEvent): Promise<any> {
		event.preventDefault()
		if (!this.isEditable) return
		const features = (this.item.system as any).features
		features.push({
			type: feature.Type.AttributeBonus,
			attribute: "st",
			limitation: "none",
			amount: 1,
			per_level: false,
			levels: 0,
		})
		const update: any = {}
		update["system.features"] = features
		return this.item.update(update)
	}

	protected async _removeFeature(event: JQuery.ClickEvent): Promise<any> {
		if (!this.isEditable) return
		const index = $(event.currentTarget).data("index")
		const features = (this.item.system as any).features
		features.splice(index, 1)
		const update: any = {}
		update["system.features"] = features
		return this.item.update(update)
	}

	protected async _addDefault(event: JQuery.ClickEvent): Promise<any> {
		event.preventDefault()
		if (!this.isEditable) return
		const defaults = (this.item.system as any).defaults ?? []
		defaults.push({
			type: gid.Skill,
			name: "",
			specialization: "",
			modifier: 0,
		})
		const update: any = {}
		update["system.defaults"] = defaults
		await this.item.update(update)
		this.render()
	}

	protected async _removeDefault(event: JQuery.ClickEvent): Promise<any> {
		if (!this.isEditable) return
		const index = $(event.currentTarget).data("index")
		const defaults = (this.item.system as any).defaults ?? []
		defaults.splice(index, 1)
		const update: any = {}
		update["system.defaults"] = defaults
		await this.item.update(update)
		this.render()
	}

	protected async _addStudy(event: JQuery.ClickEvent): Promise<any> {
		if (!this.isEditable) return
		event.preventDefault()
		const studyEntry = (this.item.system as any).study
		studyEntry.push({
			type: study.Type.Self,
			hours: 0,
			note: "",
		})
		const update: any = {}
		update["system.study"] = studyEntry
		return this.item.update(update)
	}

	protected async _removeStudy(event: JQuery.ClickEvent): Promise<any> {
		if (!this.isEditable) return
		const index = $(event.currentTarget).data("index")
		const studyEntry = (this.item.system as any).study
		studyEntry.splice(index, 1)
		const update: any = {}
		update["system.study"] = studyEntry
		return this.item.update(update)
	}

	protected async _onFeatureTypeChange(event: JQuery.ChangeEvent): Promise<any> {
		if (!this.isEditable) return
		const value = event.currentTarget.value
		const index = parseInt($(event.currentTarget).data("index"))
		const FeatureConstructor = CONFIG.GURPS.Feature.classes[value as feature.Type]
		let features = duplicate((this.item.system as any).features as FeatureObj[])
		let f = new FeatureConstructor().toObject()
		if (feature.WeaponBonusTypes.includes(value)) f = new FeatureConstructor(value).toObject()
		features.splice(index, 1, f)
		const update: any = {}
		await this.item.update(
			{ "system.-=features": null },
			// { render: false, performDeletions: true, noPrepare: true }
			{ render: false, performDeletions: true }
		)
		update["system.features"] = features
		return this.item.update(update, { render: true })
	}

	get item(): this["object"] {
		return this.object
	}

	protected override _getHeaderButtons(): Application.HeaderButton[] {
		const buttons: Application.HeaderButton[] = []
		const all_buttons = [...buttons, ...super._getHeaderButtons()]
		all_buttons.at(-1)!.label = ""
		all_buttons.at(-1)!.icon = "gcs-circled-x"
		return all_buttons
	}
}
