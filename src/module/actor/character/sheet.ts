import { CharacterGURPS } from "@actor"
import { ActorSheetDataGURPS, ActorSheetGURPS } from "@actor/base/sheet.ts"
import { ItemGURPS } from "@item"
import { AbstractAttribute } from "@system"
import { ItemFlags, ItemType, ManeuverID, SYSTEM_NAME } from "@module/data/constants.ts"
import { LocalizeGURPS, Weight, htmlQuery } from "@util"
import { sheetSettingsFor } from "@module/data/sheet-settings.ts"
import { CharacterEncumbrance } from "./encumbrance.ts"
import { CharacterConfigSheet } from "./config.ts"
import { SheetItem, SheetItemCollection } from "@item/helpers.ts"
import { CharacterMove } from "./data.ts"

class CharacterSheetGURPS<TActor extends CharacterGURPS> extends ActorSheetGURPS<TActor> {
	static override get defaultOptions(): ActorSheetOptions {
		const data = fu.mergeObject(super.defaultOptions, {
			width: 800,
			height: 800,
			tabs: [{ navSelector: ".tabs-navigation", contentSelector: ".tabs-content", initial: "lifting" }],
			dragDrop: [{ dragSelector: ".item-list .item:not(.placeholder)", dropSelector: null }],
		})
		data.classes.push("character")
		return data
	}

	override activateListeners($html: JQuery<HTMLElement>): void {
		super.activateListeners($html)
		const html = $html[0]

		htmlQuery(html, '.move-select[data-name="maneuver"]')?.addEventListener("change", ev => {
			const value = (ev.currentTarget as HTMLSelectElement).value as ManeuverID | "none"
			if (value === "none") return this.actor.setManeuver(null)
			return this.actor.setManeuver(value)
		})
	}

	override get template(): string {
		if (!game.user.isGM && this.actor.limited)
			return `/systems/${SYSTEM_NAME}/templates/actor/character/sheet-limited.hbs`
		return `/systems/${SYSTEM_NAME}/templates/actor/character/sheet.hbs`
	}

	override async getData(options?: ActorSheetOptions): Promise<CharacterSheetData<TActor>> {
		const sheetData = await super.getData(options)

		const actor = this.actor

		const attributes = Array.from(actor.attributes.values()).sort((a, b) => a.order - b.order)
		const primaryAttributes = attributes.filter(att => att.isPrimary)
		const secondaryAttributes = attributes.filter(att => att.isSecondary)
		const poolAttributes = attributes.filter(att => att.isPool)
		const resourceTrackers = Array.from(actor.resourceTrackers.values())
		const moveTypes = Array.from(actor.moveTypes.values())

		return {
			...sheetData,
			actor,
			system: actor.system,
			settings: actor.flags[SYSTEM_NAME],
			attributes: {
				primaryAttributes,
				secondaryAttributes,
				poolAttributes,
				resourceTrackers,
				moveTypes,
			},
			move: actor.system.move,
			itemCollections: this._prepareItemCollections(),
			config: CONFIG.GURPS,
			carriedValue: actor.wealthCarried(),
			carriedWeight: Weight.format(actor.weightCarried(false), sheetSettingsFor(actor).default_weight_units),
			uncarriedValue: actor.wealthNotCarried(),
			encumbrance: actor.encumbrance,
		}
	}

	protected _prepareItemCollections(): Record<string, SheetItemCollection> {
		const collections = {
			traits: {
				name: "traits",
				items: this._prepareItemCollection(this.actor.itemCollections.traits),
				types: [ItemType.Trait, ItemType.TraitContainer],
			},
			skills: {
				name: "skills",
				items: this._prepareItemCollection(this.actor.itemCollections.skills),
				types: [ItemType.Skill, ItemType.Technique, ItemType.SkillContainer],
			},
			spells: {
				name: "spells",
				items: this._prepareItemCollection(this.actor.itemCollections.spells),
				types: [ItemType.Spell, ItemType.RitualMagicSpell, ItemType.SpellContainer],
			},
			equipment: {
				name: "carriedEquipment",
				items: this._prepareItemCollection(this.actor.itemCollections.carriedEquipment),
				types: [ItemType.Equipment, ItemType.EquipmentContainer],
			},
			other_equipment: {
				name: "otherEquipment",
				items: this._prepareItemCollection(this.actor.itemCollections.otherEquipment),
				types: [ItemType.Equipment, ItemType.EquipmentContainer],
			},
			notes: {
				name: "notes",
				items: this._prepareItemCollection(this.actor.itemCollections.notes),
				types: [ItemType.Note, ItemType.NoteContainer],
			},
			reactions: { items: this.actor.reactions, types: [] },
			conditional_modifiers: { items: this.actor.conditionalModifiers, types: [] },
			melee: {
				items: this._prepareItemCollection(
					this.actor.itemCollections.equippedWeapons(ItemType.MeleeWeapon),
					null,
					true,
				),
				types: [],
			},
			ranged: {
				items: this._prepareItemCollection(
					this.actor.itemCollections.equippedWeapons(ItemType.RangedWeapon),
					null,
					true,
				),
				types: [],
			},
			effects: {
				items: this._prepareItemCollection(this.actor.itemCollections.effects, null),
				types: [ItemType.Effect, ItemType.Condition],
			},
		}
		return collections
	}

	protected _prepareItemCollection(
		collection: Collection<ItemGURPS>,
		parent: string | null = null,
		ignoreParent = false,
	): SheetItem<ItemGURPS>[] {
		if (ignoreParent)
			return collection.contents.sort((a, b) => (a.sort || 0) - (b.sort || 0)).map(e => this._prepareSheetItem(e))
		return collection.contents
			.filter(item => item.flags[SYSTEM_NAME][ItemFlags.Container] === parent)
			.sort((a, b) => (a.sort || 0) - (b.sort || 0))
			.map(e => this._prepareSheetItem(e))
	}

	protected _prepareSheetItem<TItem extends ItemGURPS = ItemGURPS>(item: TItem): SheetItem<TItem> {
		return {
			item,
			indent: item.parents.length,
			isContainer: item.isOfType("container"),
			children: item.isOfType("container") ? this._prepareItemCollection(item.children, item._id) : [],
		}
	}

	private _onConfigureCharacter(event: Event): void {
		event.preventDefault()
		new CharacterConfigSheet(this.document, {
			top: (this.position.top ?? 0) + 40,
			left:
				(this.position.left ?? 0) +
				((this.position.width ?? 0) - Number(DocumentSheet.defaultOptions.width)) / 2,
		}).render(true)
	}

	protected override _getHeaderButtons(): ApplicationHeaderButton[] {
		const buttons = super._getHeaderButtons()
		const configButton: ApplicationHeaderButton = {
			label: LocalizeGURPS.translations.gurps.system.configure_character,
			class: "configure-character",
			icon: "fas fa-user-gear",
			onclick: ev => this._onConfigureCharacter(ev),
		}
		buttons.splice(
			buttons.findIndex(e => e.class === "configure-sheet"),
			1,
			configButton,
		)
		return buttons
	}
}

interface CharacterSheetData<TActor extends CharacterGURPS = CharacterGURPS> extends ActorSheetDataGURPS<TActor> {
	actor: TActor
	system: TActor["system"]
	settings: Record<string, unknown>
	attributes: Record<string, AbstractAttribute[]>
	move: CharacterMove
	itemCollections: Record<string, SheetItemCollection>
	config: ConfigGURPS["GURPS"]
	carriedValue: number
	carriedWeight: string
	uncarriedValue: number
	encumbrance: CharacterEncumbrance<TActor>
}

export { CharacterSheetGURPS }
export type { CharacterSheetData }
