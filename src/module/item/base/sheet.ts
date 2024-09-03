import { ErrorGURPS, LocalizeGURPS, feature, generateId, htmlQuery, htmlQueryAll, prereq, study } from "@util"
import { ItemGURPS } from "./document.ts"
import { AttributeDefSchema, AttributeGURPS, Feature, SkillDefault, TraitPrereq, WeaponBonus } from "@system"
import { ActorType, ItemType, SETTINGS, SYSTEM_NAME } from "@module/data/constants.ts"
// import { ItemSubstitutionSheet } from "../../util/nameable.ts"
import { PrereqList } from "@system/prereq/prereq-list.ts"

class ItemSheetGURPS<TItem extends ItemGURPS> extends ItemSheet<TItem, ItemSheetOptions> {
	static override get defaultOptions(): ItemSheetOptions {
		const options = super.defaultOptions
		return {
			...options,
			submitOnChange: true,
			classes: [...options.classes, "gurps", "item"],
		}
	}

	override activateListeners($html: JQuery): void {
		super.activateListeners($html)
		const html = $html[0]

		for (const button of htmlQueryAll(html, "a[data-action=add-prereq]")) {
			button.addEventListener("click", async event => {
				await this._onSubmit(event) // Submit any unsaved changes

				if (!this.item.canContainPrereqs()) return

				const parentId = button.dataset.id
				if (!parentId) return console.error("No id provided for:", button)

				const prereqs = this.item.system.prereqs
				const newId = generateId()
				const parentPrereq = prereqs.find(e => e.id === parentId)
				if (parentPrereq) {
					if (parentPrereq.type === prereq.Type.List) {
						parentPrereq.updateSource({ prereqs: [newId, ...parentPrereq.prereqs] })
					}
					prereqs.push(new TraitPrereq({ id: newId }, { parent: this.item }))
				}
				return this._updateObject(event, { "system.prereqs": prereqs.map(e => e.toObject()) })
			})
		}

		for (const button of htmlQueryAll(html, "a[data-action=add-prereq-list]")) {
			button.addEventListener("click", async event => {
				await this._onSubmit(event) // Submit any unsaved changes

				if (!this.item.canContainPrereqs()) return

				const parentId = button.dataset.id
				if (!parentId) return console.error("No id provided for:", button)

				const prereqs = this.item.system.prereqs
				const newId = generateId()
				const parentPrereq = prereqs.find(e => e.id === parentId)
				if (parentPrereq) {
					if (parentPrereq.type === prereq.Type.List) {
						parentPrereq.updateSource({ prereqs: [newId, ...parentPrereq.prereqs] })
					}
					prereqs.push(new PrereqList({ id: newId }, { parent: this.item }))
				}
				return this._updateObject(event, { "system.prereqs": prereqs.map(e => e.toObject()) })
			})
		}

		for (const button of htmlQueryAll(html, "a[data-action=remove-prereq]")) {
			button.addEventListener("click", async event => {
				await this._onSubmit(event) // Submit any unsaved changes

				if (!this.item.canContainPrereqs()) return

				const deleteId = button.dataset.id
				if (!deleteId) return console.error("No id provided for:", button)
				const ids = [deleteId]

				let prereqs = this.item.system.prereqs
				const prereqToDelete = prereqs.find(e => e.id === deleteId)
				if (!prereqToDelete) throw ErrorGURPS(`Unable to find prereq with ID "${deleteId}"`)
				if (prereqToDelete.type === prereq.Type.List) ids.push(...prereqToDelete.deepPrereqs)
				prereqs = prereqs.filter(e => !ids.includes(e.id))
				for (const prereqList of prereqs) {
					if (prereqList.type !== prereq.Type.List) continue
					prereqList.updateSource({ prereqs: prereqList.prereqs.filter(e => !ids.includes(e)) })
				}
				return this._updateObject(event, { "system.prereqs": prereqs.map(e => e.toObject()) })
			})
		}

		htmlQuery(html, "a[data-action=add-feature]")?.addEventListener("click", async event => {
			await this._onSubmit(event) // Submit any unsaved changes

			if (!this.item.canContainFeatures()) return

			const features = (this.item.system.features ?? []) as Feature[]
			// const att = new AttributeBonus({ type: feature.Type.AttributeBonus }, { parent: this.item })
			// features.push(att)
			return this._updateObject(event, { ["system.features"]: features.map(e => e.toObject()) })
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
						ItemType.Effect,
						ItemType.Condition,
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

		for (const field of htmlQueryAll(html, 'select.type[name^="system.features"]')) {
			if (!(field instanceof HTMLSelectElement)) return
			field.addEventListener("change", async event => {
				event.preventDefault()
				// await this._onSubmit(event) // Submit any unsaved changes

				const index = parseInt(field.dataset.index ?? "")
				if (isNaN(index)) return console.error("No valid index provided for:", field)

				const features = (fu.getProperty(this.item, "system.features") as Feature[]) ?? []
				const value = field.value as feature.Type

				if (!features[index]) return
				const FeatureClass = CONFIG.GURPS.Feature.classes[value]
				if (feature.Type.isWeaponType(value)) {
					features[index] = new WeaponBonus({ type: value }, { parent: this.item })
				} else {
					features[index] = new FeatureClass({}, { parent: this.item })
				}

				return this._updateObject(event, { "system.features": features.map(e => e.toObject()) })
			})
		}

		htmlQuery(html, "a[data-action=add-default]")?.addEventListener("click", async event => {
			await this._onSubmit(event) // Submit any unsaved changes

			if (!this.item.isOfType(ItemType.Skill, ItemType.Technique, ItemType.WeaponMelee, ItemType.WeaponRanged))
				return

			const defaults = this.item.system.defaults ?? []
			defaults.push(new SkillDefault({}).toObject())
			return this._updateObject(event, { ["system.defaults"]: defaults })
		})

		for (const button of htmlQueryAll(html, "a[data-action=remove-default]")) {
			button.addEventListener("click", async event => {
				await this._onSubmit(event) // Submit any unsaved changes

				if (
					!this.item.isOfType(ItemType.Skill, ItemType.Technique, ItemType.WeaponMelee, ItemType.WeaponRanged)
				)
					return

				const index = parseInt(button.dataset.index ?? "")
				if (isNaN(index)) return console.error("No valid index provided for:", button)

				const defaults = this.item.system.defaults ?? []
				defaults.splice(index, 1)
				return this._updateObject(event, { ["system.defaults"]: defaults })
			})
		}

		htmlQuery(html, "a[data-action=add-study]")?.addEventListener("click", async event => {
			await this._onSubmit(event) // Submit any unsaved changes

			if (
				!this.item.isOfType(
					ItemType.Trait,
					ItemType.Skill,
					ItemType.Technique,
					ItemType.Spell,
					ItemType.RitualMagicSpell,
				)
			)
				return

			const studyEntries = this.item.system.study
			studyEntries.push({
				type: study.Type.Self,
				hours: 0,
				note: "",
			})
			return this._updateObject(event, { ["system.study"]: studyEntries })
		})

		for (const button of htmlQueryAll(html, "a[data-action=remove-study]")) {
			button.addEventListener("click", async event => {
				await this._onSubmit(event) // Submit any unsaved changes

				if (
					!this.item.isOfType(
						ItemType.Trait,
						ItemType.Skill,
						ItemType.Technique,
						ItemType.Spell,
						ItemType.RitualMagicSpell,
					)
				)
					return

				const index = parseInt(button.dataset.index ?? "")
				if (isNaN(index)) return console.error("No valid index provided for:", button)

				const study = this.item.system.study ?? []
				study.splice(index, 1)
				return this._updateObject(event, { ["system.study"]: study })
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
				.reduce((acc: Record<string, string>, att: SourceFromSchema<AttributeDefSchema>) => {
					acc[att.id] = att.name
					return acc
				}, {})
		}

		return {
			...sheetData,
			item,
			system: item.system,
			attributes,
			config: CONFIG.GURPS,
			weaponBonusTypes: feature.WeaponBonusTypes,
		}
	}

	protected _openSubstitutionPrompt(event: Event): void {
		event.preventDefault()
		new ItemSubstitutionSheet(this.document, {
			top: (this.position.top ?? 0) + 40,
			left:
				(this.position.left ?? 0) +
				((this.position.width ?? 0) - Number(DocumentSheet.defaultOptions.width)) / 2,
		}).render(true)
	}

	protected override async _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
		function splitArray(s: string): string[] {
			const a: string[] = s.split(",").map(e => e.trim())
			if (a.length === 1 && a[0] === "") return []
			return a
		}

		if (typeof formData["system.tags"] === "string") formData["system.tags"] = splitArray(formData["system.tags"])
		if (typeof formData["system.college"] === "string")
			formData["system.college"] = splitArray(formData["system.college"])
		for (const [key, value] of Object.entries(formData)) {
			if (key.match(/^system\.prereqs.*\.prereqs$/) && typeof value === "string") {
				formData[key] = splitArray(value)
			}
		}
		return super._updateObject(event, formData)
	}

	protected override _getHeaderButtons(): ApplicationHeaderButton[] {
		const buttons = super._getHeaderButtons()
		const substitutionButton: ApplicationHeaderButton = {
			label: LocalizeGURPS.translations.gurps.item.substitution.tooltip,
			class: "set-substitutions",
			icon: "",
			onclick: ev => this._openSubstitutionPrompt(ev),
		}
		if ([ItemType.WeaponMelee, ItemType.WeaponRanged].includes(this.item.type)) return buttons

		return [substitutionButton, ...buttons]
	}
}
interface ItemSheetDataGURPS<TItem extends ItemGURPS> extends ItemSheetData<TItem> {
	item: TItem
	system: TItem["system"]
	attributes: Record<string, string>
	config: ConfigGURPS["GURPS"]
	weaponBonusTypes: readonly feature.Type[]
}

interface ItemSheetOptions extends DocumentSheetOptions {}

export { ItemSheetGURPS }
export type { ItemSheetDataGURPS, ItemSheetOptions }
