import { ContainerSheetGURPS } from "@item/container/sheet.ts"
import { ItemGCS } from "./document.ts"
import { CharacterResolver, LocalizeGURPS, Weight } from "@util"
import { ItemType } from "@item/types.ts"
import { ItemGURPS } from "@item"
import { ItemSourceGURPS } from "@item/base/data/index.ts"
import { SETTINGS, SYSTEM_NAME } from "@module/data/index.ts"

export class ItemSheetGCS<IType extends ItemGCS = ItemGCS> extends ContainerSheetGURPS<IType> {
	override activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)
		html.find(".item").on("dblclick", event => this._openItemSheet(event))
		// html.find(".item").on("contextmenu", event => this._getItemContextMenu(event, html))
		// html.find(".item-list .header.desc").on("contextmenu", event => this._getAddItemMenu(event, html))

		html.find(".item").each((_index, element) => this._addItemContextMenu(element))
		html.find(".item-list .header.desc").each((_index, element) => this._addItemHeaderContextMenu(element))
	}

	protected _addItemHeaderContextMenu(element: HTMLElement): void {
		const type = $(element).parent(".item-list")[0].id
		// const ctx = new ContextMenu(html, ".menu", [])
		const menuItems = (function (self: ItemSheetGCS): ContextMenuEntry[] {
			switch (type) {
				case "trait-modifiers":
					return [
						{
							name: LocalizeGURPS.translations.gurps.context.new_trait_modifier,
							icon: "<i class='gcs-modifier'></i>",
							callback: () => self._newItem(ItemType.TraitModifier),
						},
						{
							name: LocalizeGURPS.translations.gurps.context.new_trait_modifier_container,
							icon: "<i class='gcs-modifier'></i>",
							callback: () => self._newItem(ItemType.TraitModifierContainer),
						},
					]
				case "equipment-modifiers":
					return [
						{
							name: LocalizeGURPS.translations.gurps.context.new_equipment_modifier,
							icon: "<i class='gcs-eqp-modifier'></i>",
							callback: () => self._newItem(ItemType.EquipmentModifier),
						},
						{
							name: LocalizeGURPS.translations.gurps.context.new_equipment_modifier_container,
							icon: "<i class='gcs-eqp-modifier'></i>",
							callback: () => self._newItem(ItemType.EquipmentModifierContainer),
						},
					]
				case "melee":
					return [
						{
							name: LocalizeGURPS.translations.gurps.context.new_melee_weapon,
							icon: "<i class='gcs-melee-weapon'></i>",
							callback: () => self._newItem(ItemType.MeleeWeapon),
						},
					]
				case "ranged":
					return [
						{
							name: LocalizeGURPS.translations.gurps.context.new_ranged_weapon,
							icon: "<i class='gcs-ranged-weapon'></i>",
							callback: () => self._newItem(ItemType.RangedWeapon),
						},
					]
				default:
					return []
			}
		})(this)
		ContextMenu.create(this, $(element), "*", menuItems)
		// await ctx.render(element)
	}

	protected _addItemContextMenu(element: HTMLElement): void {
		const id = $(element).data("item-id")
		const item = this.object.deepItems.get(id) as ItemGURPS
		if (!item) return
		// const ctx = new ContextMenu(html, ".menu", [])
		const menuItems = [
			{
				name: LocalizeGURPS.translations.gurps.context.duplicate,
				icon: "",
				callback: async () => {
					const itemData = {
						type: item.type,
						name: item.name,
						system: item.system,
						flags: item.flags,
						sort: (item.sort ?? 0) + 1,
					}
					if (!(item.container instanceof CompendiumCollection))
						await item.container?.createEmbeddedDocuments("Item", [itemData])
				},
			},
			{
				name: LocalizeGURPS.translations.gurps.context.delete,
				icon: "<i class='gcs-trash'></i>",
				callback: async () => {
					await item.delete()
					return this.render()
				},
			},
		]
		ContextMenu.create(this, $(element), "*", menuItems)
	}

	// async _getItemContextMenu(event: JQuery.ContextMenuEvent, html: JQuery<HTMLElement>) {
	// 	event.preventDefault()
	// 	const id = $(event.currentTarget).data("item-id")
	// 	const item = this.item.deepItems.get(id) as ItemGURPS
	// 	if (!item) return
	// 	const ctx = new ContextMenu(html, ".menu", [])
	// 	ctx.menuItems.push({
	// 		name: LocalizeGURPS.translations.gurps.context.duplicate,
	// 		icon: "",
	// 		callback: async () => {
	// 			const itemData = {
	// 				type: item.type,
	// 				name: item.name,
	// 				system: item.system,
	// 				flags: (item as any).flags,
	// 				sort: ((item as any).sort ?? 0) + 1,
	// 			}
	// 			await item.container?.createEmbeddedDocuments("Item", [itemData])
	// 		},
	// 	})
	// 	ctx.menuItems.push({
	// 		name: LocalizeGURPS.translations.gurps.context.delete,
	// 		icon: "<i class='gcs-trash'></i>",
	// 		callback: async () => {
	// 			await item.delete()
	// 			return this.render()
	// 		},
	// 	})
	// 	await ctx.render($(event.currentTarget))
	// }

	async _getAddItemMenu(event: JQuery.ContextMenuEvent, html: JQuery<HTMLElement>): Promise<void> {
		event.preventDefault()
		const element = $(event.currentTarget)
		const type = element.parent(".item-list")[0].id
		const ctx = new ContextMenu(html, ".menu", [])
		ctx.menuItems = (function (self: ItemSheetGCS): ContextMenuEntry[] {
			switch (type) {
				case "trait-modifiers":
					return [
						{
							name: LocalizeGURPS.translations.gurps.context.new_trait_modifier,
							icon: "<i class='gcs-modifier'></i>",
							callback: () => self._newItem(ItemType.TraitModifier),
						},
						{
							name: LocalizeGURPS.translations.gurps.context.new_trait_modifier_container,
							icon: "<i class='gcs-modifier'></i>",
							callback: () => self._newItem(ItemType.TraitModifierContainer),
						},
					]
				case "equipment-modifiers":
					return [
						{
							name: LocalizeGURPS.translations.gurps.context.new_equipment_modifier,
							icon: "<i class='gcs-eqp-modifier'></i>",
							callback: () => self._newItem(ItemType.EquipmentModifier),
						},
						{
							name: LocalizeGURPS.translations.gurps.context.new_equipment_modifier_container,
							icon: "<i class='gcs-eqp-modifier'></i>",
							callback: () => self._newItem(ItemType.EquipmentModifierContainer),
						},
					]
				case "melee":
					return [
						{
							name: LocalizeGURPS.translations.gurps.context.new_melee_weapon,
							icon: "<i class='gcs-melee-weapon'></i>",
							callback: () => self._newItem(ItemType.MeleeWeapon),
						},
					]
				case "ranged":
					return [
						{
							name: LocalizeGURPS.translations.gurps.context.new_ranged_weapon,
							icon: "<i class='gcs-ranged-weapon'></i>",
							callback: () => self._newItem(ItemType.RangedWeapon),
						},
					]
				default:
					return []
			}
		})(this)
		await ctx.render(element)
	}

	async _newItem(type: ItemType, other = false): Promise<this> {
		const itemData: DeepPartial<ItemSourceGURPS> = {
			// @ts-expect-error what
			type,
			name: LocalizeGURPS.translations.TYPES.Item[type],
			system: {},
		}
		// @ts-expect-error what
		if (other) itemData.system.other = true
		if ([ItemType.MeleeWeapon, ItemType.RangedWeapon].includes(type))
			// @ts-expect-error what
			itemData.system.usage = LocalizeGURPS.translations.TYPES.Item[type]
		await this.object.createEmbeddedDocuments("Item", [itemData], {
			temporary: false,
			renderSheet: true,
			substitutions: false,
		})
		return this.render()
	}

	protected async _openItemSheet(event: JQuery.DoubleClickEvent): Promise<void> {
		event.preventDefault()
		const id = $(event.currentTarget).data("item-id")
		const item = this.item.deepItems.get(id)
		item?.sheet?.render(true)
	}

	protected override async _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
		for (const k in formData) {
			if (k.endsWith("qualifier.qualifier_weight")) {
				const actor = this.actor as unknown as CharacterResolver
				const units =
					actor.settings.default_weight_units ??
					game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.settings`).default_weight_units
				const weight = Weight.format(Weight.fromString(formData[k] as string, units), units)
				formData[k.replace("_weight", "")] = weight
				delete formData[k]
			}
		}
		return super._updateObject(event, formData)
	}

	override render(force?: boolean, options?: RenderOptions): this | Promise<this> {
		if (this.object.container instanceof Item && this.object.container.sheet?.rendered)
			this.object.container.sheet.render(true)
		return super.render(force, options)
	}
}
