import { ActorSheetGURPS } from "@actor/base/sheet.ts"
import { LootGURPS } from "./document.ts"
import { LocalizeGURPS, PDF } from "@util"
import { EquipmentContainerGURPS, EquipmentGURPS, ItemGURPS } from "@item"
import { ItemFlags, ItemType, SYSTEM_NAME } from "@data"

class LootSheetGURPS<TActor extends LootGURPS = LootGURPS> extends ActorSheetGURPS<TActor> {
	editing!: boolean

	static override get defaultOptions(): ActorSheetOptions {
		return fu.mergeObject(super.defaultOptions, {
			classes: super.defaultOptions.classes.concat(["character"]),
			width: 800,
			height: 800,
		})
	}

	override get template(): string {
		return `/systems/${SYSTEM_NAME}/templates/actor/loot/sheet.hbs`
	}

	override activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)

		html.find(".dropdown-toggle").on("click", event => this._onCollapseToggle(event))
		html.find(".ref").on("click", event => PDF.handle(event))
		html.find(".item-list .header.desc").on("contextmenu", event => this._getAddItemMenu(event, html))
		html.find(".item").on("dblclick", event => this._openItemSheet(event))
		html.find(".item").on("contextmenu", event => this._getItemContextMenu(event, html))
		html.find(".equipped").on("click", event => this._onEquippedToggle(event))
		html.find(".item").on("dragover", event => this._onDragItem(event))
	}

	async _getAddItemMenu(event: JQuery.ContextMenuEvent, html: JQuery<HTMLElement>): Promise<void> {
		event.preventDefault()
		const element = $(event.currentTarget)
		const type = element.parent(".item-list")[0].id
		const ctx = new ContextMenu(html, ".menu", [])
		ctx.menuItems = (function (self: LootSheetGURPS): ContextMenuEntry[] {
			switch (type) {
				case "equipment":
					return [
						{
							name: LocalizeGURPS.translations.gurps.context.new_carried_equipment,
							icon: "<i class='gcs-equipment'></i>",
							callback: () => self._newItem(ItemType.Equipment),
						},
						{
							name: LocalizeGURPS.translations.gurps.context.new_carried_equipment_container,
							icon: "<i class='gcs-equipment'></i>",
							callback: () => self._newItem(ItemType.EquipmentContainer),
						},
					]
				default:
					return []
			}
		})(this)
		await ctx.render(element)
	}

	async _newItem(type: ItemType, other = false): Promise<void> {
		const itemName = `TYPES.Item.${type}`
		const itemData: { type: string; name: string; system: Record<string, unknown> } = {
			type,
			name: game.i18n.localize(itemName),
			system: {},
		}
		if (other) itemData.system.other = true
		await this.actor.createEmbeddedDocuments("Item", [itemData], {
			temporary: false,
			renderSheet: true,
			substitutions: false,
		})
	}

	async _newNaturalAttacks(): Promise<void> {
		const itemName = LocalizeGURPS.translations.gurps.item.natural_attacks
		const itemData = {
			type: ItemType.Trait,
			name: itemName,
			system: {
				reference: "B271",
			},
			flags: {
				[SYSTEM_NAME]: {
					contentsData: [
						{
							type: ItemType.MeleeWeapon,
							name: "Bite",
							_id: fu.randomID(),
							system: {
								usage: "Bite",
								reach: "C",
								parry: "No",
								block: "No",
								strength: "",
								damage: {
									type: "cr",
									st: "thr",
									base: "-1",
								},
								defaults: [{ type: "dx" }, { type: "skill", name: "Brawling" }],
							},
						},
						{
							type: ItemType.MeleeWeapon,
							name: "Punch",
							_id: fu.randomID(),
							system: {
								usage: "Punch",
								reach: "C",
								parry: "0",
								strength: "",
								damage: {
									type: "cr",
									st: "thr",
									base: "-1",
								},
								defaults: [
									{ type: "dx" },
									{ type: "skill", name: "Boxing" },
									{ type: "skill", name: "Brawling" },
									{ type: "skill", name: "Karate" },
								],
							},
						},
						{
							type: ItemType.MeleeWeapon,
							name: "Kick",
							_id: fu.randomID(),
							system: {
								usage: "Kick",
								reach: "C,1",
								parry: "No",
								strength: "",
								damage: {
									type: "cr",
									st: "thr",
								},
								defaults: [
									{ type: "dx", modifier: -2 },
									{ type: "skill", name: "Brawling", modifier: -2 },
									{ type: "skill", name: "Kicking" },
									{ type: "skill", name: "Karate", modifier: -2 },
								],
							},
						},
					],
				},
			},
		}
		await this.actor.createEmbeddedDocuments("Item", [itemData], { temporary: false })
	}

	async _getItemContextMenu(event: JQuery.ContextMenuEvent, html: JQuery<HTMLElement>): Promise<void> {
		event.preventDefault()
		const id = $(event.currentTarget).data("item-id")
		const item = this.actor.equipment.get(id)
		if (!item) return
		const ctx = new ContextMenu(html, ".menu", [])
		ctx.menuItems.push({
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
					await item.container?.createEmbeddedDocuments("Item", [itemData], {})
			},
		})
		ctx.menuItems.push({
			name: LocalizeGURPS.translations.gurps.context.delete,
			icon: "<i class='gcs-trash'></i>",
			callback: () => {
				return item.delete()
			},
		})
		ctx.menuItems.push({
			name: LocalizeGURPS.translations.gurps.context.toggle_state,
			icon: "<i class='fas fa-sliders-simple'></i>",
			callback: () => {
				return item.update({ "system.equipped": !item.equipped })
			},
		})
		ctx.menuItems.push({
			name: LocalizeGURPS.translations.gurps.context.increment,
			icon: "<i class='fas fa-up'></i>",
			callback: () => {
				return item.update({ "system.quantity": item.system.quantity + 1 })
			},
		})
		if (item.system.quantity > 0)
			ctx.menuItems.push({
				name: LocalizeGURPS.translations.gurps.context.decrement,
				icon: "<i class='fas fa-down'></i>",
				callback: () => {
					return item.update({ "system.quantity": item.system.quantity - 1 })
				},
			})
		ctx.menuItems.push({
			name: LocalizeGURPS.translations.gurps.context.increase_tech_level,
			icon: "<i class='fas fa-gear'></i><i class='fas fa-up'></i>",
			callback: () => {
				let tl = item.system.tech_level
				const tlNumber = tl.match(/\d+/)?.[0]
				if (!tlNumber) return
				const newTLNumber = parseInt(tlNumber) + 1
				tl = tl.replace(tlNumber, `${newTLNumber}`)
				return item.update({ "system.tech_level": tl })
			},
		})
		if (parseInt(item.system.tech_level) > 0)
			ctx.menuItems.push({
				name: LocalizeGURPS.translations.gurps.context.decrease_tech_level,
				icon: "<i class='fas fa-gear'></i><i class='fas fa-down'></i>",
				callback: () => {
					let tl = item.system.tech_level
					const tlNumber = tl.match(/\d+/)?.[0]
					if (!tlNumber) return
					const newTLNumber = parseInt(tlNumber) - 1
					tl = tl.replace(tlNumber, `${newTLNumber}`)
					return item.update({ "system.tech_level": tl })
				},
			})
		if (item instanceof EquipmentGURPS)
			ctx.menuItems.push({
				name: LocalizeGURPS.translations.gurps.context.convert_to_container,
				icon: "",
				callback: async () => {
					const itemData = {
						type: ItemType.EquipmentContainer,
						name: item.name,
						system: item.system,
						flags: item.flags,
						sort: (item.sort ?? 0) + 1,
						_id: item._id,
					}
					await item.delete()
					if (!(item.container instanceof CompendiumCollection))
						await item.container?.createEmbeddedDocuments("Item", [itemData], {})
				},
			})
		if (item instanceof EquipmentContainerGURPS && item.children.size === 0)
			ctx.menuItems.push({
				name: LocalizeGURPS.translations.gurps.context.convert_to_non_container,
				icon: "",
				callback: async () => {
					const itemData = {
						type: ItemType.Equipment,
						name: item.name,
						system: item.system,
						flags: item.flags,
						sort: (item.sort ?? 0) + 1,
						_id: item._id,
					}
					await item.delete()
					if (!(item.container instanceof CompendiumCollection))
						await item.container?.createEmbeddedDocuments("Item", [itemData], {})
				},
			})
		await ctx.render($(event.currentTarget))
	}

	protected _resizeInput(event: JQuery.ChangeEvent): void {
		event.preventDefault()
		const field = event.currentTarget
		$(field).css("min-width", `${field.value.length}ch`)
	}

	protected _onCollapseToggle(event: JQuery.ClickEvent): void {
		event.preventDefault()
		const id: string = $(event.currentTarget).data("item-id")
		const open = !!$(event.currentTarget).attr("class")?.includes("closed")
		const item = this.actor.items.get(id)
		item?.update({ _id: id, "system.open": open })
	}

	protected async _openItemSheet(event: JQuery.DoubleClickEvent): Promise<void> {
		event.preventDefault()
		const id: string = $(event.currentTarget).data("item-id")
		const item = this.actor.items.get(id)
		item?.sheet?.render(true)
	}

	protected async _onEquippedToggle(event: JQuery.ClickEvent): Promise<void> {
		event.preventDefault()
		const id = $(event.currentTarget).data("item-id")
		const item = this.actor.items.get(id)
		item?.update({
			"system.equipped": !(item as EquipmentGURPS<TActor>).equipped,
		})
	}

	protected _onDragItem(event: JQuery.DragOverEvent): void {
		const element = $(event.currentTarget!).closest(".item.desc")
		if (!element.length) return
		const heightAcross = (event.pageY! - element.offset()!.top) / element.height()!
		const widthAcross = (event.pageX! - element.offset()!.left) / element.width()!
		const inContainer = widthAcross > 0.3 && element.hasClass("container")
		if (heightAcross > 0.5 && element.hasClass("border-bottom")) return
		if (heightAcross < 0.5 && element.hasClass("border-top")) return
		if (inContainer && element.hasClass("border-in")) return

		$(".border-bottom").removeClass("border-bottom")
		$(".border-top").removeClass("border-top")
		$(".border-in").removeClass("border-in")

		const parent = element.parent(".item-list")
		let selection = []
		if (parent.attr("id") === "equipment") {
			selection = [
				...Array.prototype.slice.call(element.prevUntil(".reference")),
				...Array.prototype.slice.call(element.nextUntil(".equipped")),
			]
		} else if (parent.attr("id") === "other-equipment") {
			selection = [
				...Array.prototype.slice.call(element.prevUntil(".reference")),
				...Array.prototype.slice.call(element.nextUntil(".quantity")),
			]
		} else selection = Array.prototype.slice.call(element.nextUntil(".item.desc"))
		selection.unshift(element)
		if (inContainer) {
			for (const e of selection) $(e).addClass("border-in")
		} else if (heightAcross > 0.5) {
			for (const e of selection) $(e).addClass("border-bottom")
		} else {
			for (const e of selection) $(e).addClass("border-top")
		}
	}

	override getData(options?: ActorSheetOptions): LootSheetData<TActor> | Promise<LootSheetData<TActor>> {
		this.actor.noPrepare = false
		this.actor.prepareData()

		return {
			...(super.getData(options) as ActorSheetData<TActor>),
			...this._prepareItems(),
			actor: this.actor,
			data: this.actor.system,
			config: CONFIG.GURPS,
			currentYear: new Date().getFullYear(),
		}
	}

	private _prepareItems(): {
		carriedEquipment: ItemGURPS[]
		otherEquipment: ItemGURPS[]
		carriedWeight: number
		carriedValue: number
		otherValue: number
	} {
		const items = this.object.items
		const processedItems: ItemGURPS[] = []
		for (const item of items.filter(
			e =>
				!e.flags[SYSTEM_NAME] ||
				!e.flags[SYSTEM_NAME][ItemFlags.Container] ||
				e.flags[SYSTEM_NAME][ItemFlags.Container] === null,
		)) {
			processedItems.push(item)
		}

		const [carriedEquipment, otherEquipment] = processedItems.reduce(
			(arr: ItemGURPS[][], item: ItemGURPS) => {
				if (item.flags[SYSTEM_NAME]![ItemFlags.Other]) arr[1].push(item)
				else arr[0].push(item)
				return arr
			},
			[[], []],
		)

		// const melee = items.filter(e => e.type === ItemType.MeleeWeapon && e.system.calc.equipped)
		// const ranged = items.filter(e => e.type === ItemType.RangedWeapon && e.system.calc.equipped)
		const carriedValue = this.actor.wealthCarried()
		const carriedWeight = this.actor.weightCarried(true)
		const otherValue = this.actor.wealthNotCarried()

		return {
			carriedEquipment,
			otherEquipment,
			carriedValue,
			carriedWeight,
			otherValue,
		}
	}

	protected override _getHeaderButtons(): ApplicationHeaderButton[] {
		// Const buttons: Application.HeaderButton[] = this.actor.canUserModify(game.user!, "update")
		// 	? [
		// 		{
		// 			label: "",
		// 			class: "gmenu",
		// 			icon: "gcs-all-seeing-eye",
		// 			onclick: event => this._openGMenu(event),
		// 		},
		// 	]
		// 	: []
		const buttons: ApplicationHeaderButton[] = []
		const all_buttons = [...buttons, ...super._getHeaderButtons()]
		return all_buttons
	}
}

interface LootSheetData<TActor extends LootGURPS> extends ActorSheetData<TActor> {
	actor: TActor
	data: TActor["system"]
	carriedEquipment: ItemGURPS[]
	otherEquipment: ItemGURPS[]
	carriedWeight: number
	carriedValue: number
	otherValue: number
	currentYear: number
	config: ConfigGURPS["GURPS"]
}

export { LootSheetGURPS }
