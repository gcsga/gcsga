import { LocalizeGURPS, feature, htmlQuery, htmlQueryAll, prepareFormData, prereq } from "@util"
import { ItemGURPS } from "./document.ts"
import {
	AttributeBonus,
	AttributeDefObj,
	AttributeGURPS,
	FeatureObj,
	PrereqList,
	PrereqObj,
	SkillDefault,
	TraitPrereq,
} from "@system"
import { ActorType, ItemType, SETTINGS, SYSTEM_NAME, gid } from "@module/data/constants.ts"

class ItemSheetGURPS<TItem extends ItemGURPS> extends ItemSheet<TItem, ItemSheetOptions> {
	static override get defaultOptions(): ItemSheetOptions {
		const options = super.defaultOptions
		return {
			...options,
			submitOnChange: true,
			closeOnSubmit: false,
			classes: [...options.classes, "gurps", "item"],
		}
	}

	override activateListeners($html: JQuery): void {
		const html = $html[0]

		for (const button of htmlQueryAll(html, "a[data-action=add-prereq]")) {
			button.addEventListener("click", async event => {
				await this._onSubmit(event) // Submit any unsaved changes

				const path = button.dataset.path?.replace(/^array\./, "")
				if (!path) return console.error("No data-path value provided for:", button)

				const prereqs = (fu.getProperty(this.item, `${path}.prereqs`) as PrereqObj[]) ?? []
				prereqs.push(new TraitPrereq().toObject())

				return this._updateObject(event, { [`array.${path}.prereqs`]: prereqs })
			})
		}

		for (const button of htmlQueryAll(html, "a[data-action=add-prereq-list]")) {
			button.addEventListener("click", async event => {
				await this._onSubmit(event) // Submit any unsaved changes

				const path = button.dataset.path?.replace(/^array\./, "")
				if (!path) return console.error("No data-path value provided for:", button)

				const prereqs = (fu.getProperty(this.item, `${path}.prereqs`) as PrereqObj[]) ?? []
				prereqs.push(new PrereqList().toObject())

				return this._updateObject(event, { [`array.${path}.prereqs`]: prereqs })
			})
		}

		for (const button of htmlQueryAll(html, "a[data-action=remove-prereq]")) {
			button.addEventListener("click", async event => {
				await this._onSubmit(event) // Submit any unsaved changes

				let path = button.dataset.path?.replace(/^array\./, "")
				if (!path) return console.error("No data-path value provided for:", button)

				const items = path.split(".")
				const index = parseInt(items.pop() ?? "")
				if (isNaN(index)) return console.error("No valid index provided for:", button)
				path = items.join(".")

				const prereqs = (fu.getProperty(this.item, path) as PrereqObj[]) ?? []
				prereqs.splice(index, 1)

				return this._updateObject(event, { [`array.${path}`]: prereqs })
			})
		}

		for (const field of htmlQueryAll(html, 'select.type[data-path^="array.system.prereqs"]')) {
			if (!(field instanceof HTMLSelectElement)) return
			field.addEventListener("change", async event => {
				event.preventDefault()
				await this._onSubmit(event) // Submit any unsaved changes

				let path = field.dataset.path?.replace(/^array\./, "")
				if (!path) return console.error("No data-path value provided for:", field)

				const items = path.split(".")
				const index = parseInt(items.pop() ?? "")
				if (isNaN(index)) return console.error("No valid index provided for:", field)
				path = items.join(".")

				const prereqs = (fu.getProperty(this.item, path) as PrereqObj[]) ?? []
				const value = field.value as prereq.Type

				if (!prereqs[index]) return
				const prereqClass = CONFIG.GURPS.Prereq.classes[value]
				prereqs[index] = new prereqClass(this.item.actor ?? null).toObject()

				return this._updateObject(event, { [`array.${path}`]: prereqs })
			})
		}

		htmlQuery(html, "a[data-action=add-feature]")?.addEventListener("click", async event => {
			await this._onSubmit(event) // Submit any unsaved changes

			if (
				!this.item.isOfType(
					ItemType.Trait,
					ItemType.TraitModifier,
					ItemType.Skill,
					ItemType.Technique,
					ItemType.Equipment,
					ItemType.EquipmentContainer,
					ItemType.EquipmentModifier,
				)
			)
				return

			const features = this.item.system.features ?? []
			features.push(new AttributeBonus().toObject())
			return this._updateObject(event, { ["system.features"]: features })
		})

		for (const button of htmlQueryAll(html, "a[data-action=remove-feature]")) {
			button.addEventListener("click", async event => {
				await this._onSubmit(event) // Submit any unsaved changes

				if (
					!this.item.isOfType(
						ItemType.Trait,
						ItemType.TraitModifier,
						ItemType.Skill,
						ItemType.Technique,
						ItemType.Equipment,
						ItemType.EquipmentContainer,
						ItemType.EquipmentModifier,
					)
				)
					return

				const index = parseInt(button.dataset.index ?? "")
				if (isNaN(index)) return console.error("No valid index provided for:", button)

				const features = this.item.system.features ?? []
				features.splice(index, 1)
				return this._updateObject(event, { ["system.features"]: features })
			})
		}

		for (const field of htmlQueryAll(html, 'select.type[name^="array.system.features"]')) {
			if (!(field instanceof HTMLSelectElement)) return
			field.addEventListener("change", async event => {
				event.preventDefault()
				await this._onSubmit(event) // Submit any unsaved changes

				const index = parseInt(field.dataset.index ?? "")
				if (isNaN(index)) return console.error("No valid index provided for:", field)

				const features = (fu.getProperty(this.item, "system.features") as FeatureObj[]) ?? []
				const value = field.value as feature.Type

				if (!features[index]) return
				const featureClass = CONFIG.GURPS.Feature.classes[value]
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				if (feature.WeaponBonusTypes.includes(value as any)) {
					features[index] = new featureClass(value as feature.WeaponBonusType).toObject()
				} else {
					// @ts-expect-error argument not needed
					features[index] = new featureClass().toObject()
				}

				return this._updateObject(event, { "system.features": features })
			})
		}

		htmlQuery(html, "a[data-action=add-default]")?.addEventListener("click", async event => {
			await this._onSubmit(event) // Submit any unsaved changes

			if (!this.item.isOfType(ItemType.Skill, ItemType.Technique, ItemType.MeleeWeapon, ItemType.RangedWeapon))
				return

			const defaults = this.item.system.defaults ?? []
			defaults.push(new SkillDefault().toObject())
			return this._updateObject(event, { ["system.defaults"]: defaults })
		})

		for (const button of htmlQueryAll(html, "a[data-action=remove-default]")) {
			button.addEventListener("click", async event => {
				await this._onSubmit(event) // Submit any unsaved changes

				if (
					!this.item.isOfType(ItemType.Skill, ItemType.Technique, ItemType.MeleeWeapon, ItemType.RangedWeapon)
				)
					return

				const index = parseInt(button.dataset.index ?? "")
				if (isNaN(index)) return console.error("No valid index provided for:", button)

				const defaults = this.item.system.defaults ?? []
				defaults.splice(index, 1)
				return this._updateObject(event, { ["system.defaults"]: defaults })
			})
		}
	}

	override async getData(options?: Partial<ItemSheetOptions>): Promise<ItemSheetDataGURPS<TItem>> {
		const sheetData = await super.getData(options)
		const item = this.item

		let attributes: Record<string, string> = {}
		if (this.item.actor) {
			if (this.item.actor.isOfType(ActorType.Character)) {
				attributes = Array.from(this.item.actor.attributes.values()).reduce(
					(acc: Record<string, string>, att: AttributeGURPS) => {
						acc[att.id] = att.definition?.name ?? ""
						return acc
					},
					{},
				)
			}
		} else {
			attributes = game.settings
				.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`)
				.reduce((acc: Record<string, string>, att: AttributeDefObj) => {
					acc[att.id] = att.name
					return acc
				}, {})
		}
		attributes[gid.SizeModifier] = LocalizeGURPS.translations.gurps.attributes.size
		attributes[gid.Dodge] = LocalizeGURPS.translations.gurps.attributes.dodge
		attributes[gid.Parry] = LocalizeGURPS.translations.gurps.attributes.parry
		attributes[gid.Block] = LocalizeGURPS.translations.gurps.attributes.block

		return {
			...sheetData,
			item,
			system: item.system,
			attributes,
			config: CONFIG.GURPS,
		}
	}

	protected override _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
		function splitArray(s: string): string[] {
			const a: string[] = s.split(",").map(e => e.trim())
			if (a.length === 1 && a[0] === "") return []
			return a
		}

		console.log(formData)

		formData = prepareFormData(formData, this.object)
		if (typeof formData["system.tags"] === "string") formData["system.tags"] = splitArray(formData["system.tags"])
		if (typeof formData["system.college"] === "string")
			formData["system.college"] = splitArray(formData["system.college"])
		return super._updateObject(event, formData)
	}
}
interface ItemSheetDataGURPS<TItem extends ItemGURPS> extends ItemSheetData<TItem> {
	item: TItem
	system: TItem["system"]
	attributes: Record<string, string>
	config: ConfigGURPS["GURPS"]
}

interface ItemSheetOptions extends DocumentSheetOptions {}

export { ItemSheetGURPS }
export type { ItemSheetDataGURPS, ItemSheetOptions }
