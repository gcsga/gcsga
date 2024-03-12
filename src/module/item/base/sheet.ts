import { htmlQuery, htmlQueryAll } from "@util"
import { ItemGURPS } from "./document.ts"
import { AttributeBonus, PrereqList, PrereqObj, SkillDefault, TraitPrereq } from "@system"
import { ItemType } from "@module/data/constants.ts"

class ItemSheetGURPS<TItem extends ItemGURPS> extends ItemSheet<TItem, ItemSheetOptions> {
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

				return this._updateObject(event, { [`array.${path}.prereqs`]: prereqs })
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
}
interface ItemSheetDataGURPS<TItem extends ItemGURPS> extends ItemSheetData<TItem> {}

interface ItemSheetOptions extends DocumentSheetOptions {}

export { ItemSheetGURPS }
export type { ItemSheetDataGURPS, ItemSheetOptions }
