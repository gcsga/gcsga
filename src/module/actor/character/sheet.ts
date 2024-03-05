import { CharacterGURPS } from "@actor"
import { ActorSheetDataGURPS, ActorSheetGURPS } from "@actor/base/sheet.ts"
import { CharacterFlags } from "./data.ts"
import { ItemGURPS } from "@item"
import { AbstractAttribute, ConditionalModifier } from "@system"
import { ItemType, SYSTEM_NAME } from "@module/data/constants.ts"
import { Weight } from "@util"
import { sheetSettingsFor } from "@module/data/sheet-settings.ts"
import { CharacterEncumbrance } from "./encumbrance.ts"

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
			system: this.actor.system,
			flags: this.actor.flags,
			attributes: {
				primaryAttributes,
				secondaryAttributes,
				poolAttributes,
				resourceTrackers,
				moveTypes,
			},
			collections: {
				traits: actor.itemCollections.traits,
				skills: actor.itemCollections.skills,
				spells: actor.itemCollections.spells,
				equipment: actor.itemCollections.carriedEquipment,
				other_equipment: actor.itemCollections.otherEquipment,
				notes: actor.itemCollections.notes,
				reactions: actor.reactions,
				conditional_modifiers: actor.conditionalModifiers,
				melee_weapons: actor.itemCollections.equippedWeapons(ItemType.MeleeWeapon),
				ranged_weapons: actor.itemCollections.equippedWeapons(ItemType.RangedWeapon),
				effects: actor.itemCollections.effects,
			},
			config: CONFIG.GURPS,
			carriedValue: actor.wealthCarried(),
			carriedWeight: Weight.format(actor.weightCarried(false), sheetSettingsFor(actor).default_weight_units),
			uncarriedValue: actor.wealthNotCarried(),
			encumbrance: actor.encumbrance,
		}
	}
}

interface CharacterSheetData<TActor extends CharacterGURPS = CharacterGURPS> extends ActorSheetDataGURPS<TActor> {
	actor: TActor
	system: TActor["system"]
	flags: CharacterFlags
	attributes: Record<string, AbstractAttribute[]>
	collections: Record<string, Collection<ItemGURPS<TActor>> | ConditionalModifier[]>
	config: ConfigGURPS["GURPS"]
	carriedValue: number
	carriedWeight: string
	uncarriedValue: number
	encumbrance: CharacterEncumbrance<TActor>
}

export { CharacterSheetGURPS }
export type { CharacterSheetData }
