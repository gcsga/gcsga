import { MookGeneratorSheet } from "@sytem/mook/sheet.ts"
import { GURPS_COMMANDS, RollModifier, RollType, gid } from "./data/misc.ts"
import { UserGURPS } from "./user/document.ts"
import { duplicate } from "types/foundry/common/utils/helpers.js"
import { ActorGURPS } from "@actor/base.ts"
import { LastActor } from "@util/last_actor.ts"
import { LootGURPS } from "@actor/loot/document.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { RollGURPS } from "./roll/index.ts"
import { SpellGURPS } from "@item/spell/document.ts"
import { CharacterGURPS } from "@actor"
import { BaseWeaponGURPS, RitualMagicSpellGURPS } from "@item"

export function parse(message: string): [string, string[]] {
	for (const [rule, rgx] of Object.entries(GURPS_COMMANDS)) {
		// For multi-line matches, the first line must match
		const match = message.match(rgx)
		if (match) return [rule, match]
	}
	return ["none", [message, "", message]]
}

export function procesMessage(message: string): boolean {
	const [command, _match] = parse(message)
	if (command === "none") return true
	switch (command) {
		case "mook":
			MookGeneratorSheet.init()
			return false
	}
	return true
}

// /**
//  *
//  * @param command
//  * @param matches
//  * @param chatData
//  * @param createOptions
//  */
// export async function _processDiceCommand(
// 	command: string,
// 	matches: RegExpMatchArray[],
// 	chatData: DeepPartial<foundry.documents.ChatMessageSource>,
// 	createOptions: ChatMessageModificationContext,
// ): Promise<void> {
// 	let actor = game.user.character
// 	if (chatData.speaker) actor = ChatMessage.getSpeakerActor(chatData.speaker) as ActorGURPS<null>
// 	const rollData: Record<string, unknown> = actor ? actor.getRollData() : {}
// 	const rolls = []
// 	for (const match of matches) {
// 		if (!match) continue
// 		const [formula, flavor] = match.slice(2, 4)
// 		if (flavor && !chatData.flavor) chatData.flavor = flavor
// 		const roll = Roll.create(formula, rollData)
// 		await roll.evaluate({ async: true })
// 		rolls.push(roll)
// 	}
// 	chatData.type = CONST.CHAT_MESSAGE_TYPES.ROLL
// 	chatData.rolls = rolls
// 	chatData.sound = CONFIG.sounds.dice
// 	chatData.content = rolls.reduce((t, r) => t + r.total!, 0)
// 	createOptions.rollMode = command
// }

/**
 *
 * @param html
 */
export function addChatListeners(html: JQuery<HTMLElement>): void {
	html.find(".rollable:not(.damage)").on("click", event => _onRollClick(event))
	html.find(".rollable.damage").on("click", event => _onDamageRoll(event))
	html.find(".damage.hits > .roll").on("click", event => _onMultiDamageRoll(event))
	html.find(".damage.hits > .minus").on("click", event => _onMinusHits(event))
	html.find(".damage.hits > .plus").on("click", event => _onPlusHits(event))
	html.find(".rollable").on("mouseover", event => _onRollableHover(event, true))
	html.find(".rollable").on("mouseout", event => _onRollableHover(event, false))
	html.find(".mod").on("click", event => _onModClick(event))
	html.find(".mod").on("contextmenu", event => _onModRClick(event))
}

async function _onMinusHits(event: JQuery.ClickEvent): Promise<void> {
	await _onHitsChange(event, -1)
}

async function _onPlusHits(event: JQuery.ClickEvent): Promise<void> {
	await _onHitsChange(event, 1)
}

async function _onHitsChange(event: JQuery.ClickEvent, delta: number): Promise<void> {
	event.preventDefault()
	event.stopPropagation()

	// Get the parent HTML element of target
	const parent = event.currentTarget.closest(".damage.hits") as HTMLElement
	if (!parent) return

	// Get the data-times attribute from the parent element
	parent.dataset.times = `${Math.max(1, parseInt(parent.dataset.times!) + delta)}`
	$(parent).find(".roll").text(`${parent.dataset.times}`)
}

/**
 *
 * @param event
 */
async function _onModClick(event: JQuery.ClickEvent): Promise<void> {
	event.preventDefault()
	event.stopPropagation()
	const mod: RollModifier = $(event.currentTarget).data("mod")
	return (game.user as UserGURPS).addModifier(mod)
	// return game.ModifierBucket.addModifier(mod)
}

/**
 *
 * @param event
 */
async function _onModRClick(event: JQuery.ContextMenuEvent): Promise<void> {
	event.preventDefault()
	event.stopPropagation()
	const mod: RollModifier = duplicate($(event.currentTarget).data("mod"))
	mod.modifier = -mod.modifier
	// return game.ModifierBucket.addModifier(mod)
	return (game.user as UserGURPS).addModifier(mod)
}

/**
 *
 * @param event
 */
async function _onRollClick(event: JQuery.ClickEvent) {
	event.preventDefault()
	event.stopPropagation()
	const type: RollType = $(event.currentTarget).data("type")
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const data: any = { type: type, hidden: event.ctrlKey }
	let actor: ActorGURPS | null = await LastActor.get()
	if (actor instanceof LootGURPS) return

	if (type === RollType.Attribute) {
		const id = $(event.currentTarget).data("json").id
		if (id === gid.Dodge) data.attribute = actor?.dodgeAttribute
		else data.attribute = actor?.attributes.get(id)
	} else if ([RollType.Skill, RollType.SkillRelative].includes(type)) {
		if (actor instanceof CharacterGURPS) {
			const itemData = $(event.currentTarget).data("json")

			// Grab best skill or default
			data.item = actor.bestSkillNamed(itemData.name!, itemData.specialization || "", false, null)

			// Update level at least once to calculate default level
			data.item.updateLevel()
			if (!data.item || data.item.effectiveLevel === -Infinity) {
				ui.notifications?.warn(LocalizeGURPS.translations.gurps.notification.no_default_skill)
				return
			}
		}
	} else if ([RollType.Spell, RollType.SpellRelative].includes(type)) {
		if (actor instanceof CharacterGURPS) {
			const itemData = $(event.currentTarget).data("json")
			// @ts-expect-error idk
			data.item = actor.spells.find((e: SpellGURPS | RitualMagicSpellGURPS) => e.name === itemData.name)
		}
		if (!data.item || data.item.effectiveLevel === -Infinity) {
			ui.notifications?.warn(LocalizeGURPS.translations.gurps.notification.no_default_skill)
			return
		}
	} else if ([RollType.Attack].includes(type)) {
		if (actor instanceof CharacterGURPS) {
			const itemData = $(event.currentTarget).data("json")
			data.item = actor.weapons.find(
				(e: BaseWeaponGURPS) => e.itemName === itemData.itemName && e.usage === itemData.usage,
			)
		}
		if (!data.item || data.item.effectiveLevel === -Infinity) {
			ui.notifications?.warn(LocalizeGURPS.translations.gurps.notification.no_default_skill)
			return
		}
	}
	if (type === RollType.Modifier) {
		data.modifier = $(event.currentTarget).data("modifier")
		data.comment = $(event.currentTarget).data("comment")
	}
	if (type === RollType.Location) {
		actor = game.actors?.get($(event.currentTarget).data("actorId")) as ActorGURPS
	}
	if (type === RollType.Generic) data.formula = $(event.currentTarget).data("formula")

	return RollGURPS.handleRoll(game.user, actor, data)
}

/**
 *
 * @param event
 */
async function _onDamageRoll(event: JQuery.ClickEvent) {
	event.preventDefault()
	event.stopPropagation()
	event.stopImmediatePropagation()

	const eventData = $(event.currentTarget).data() as DamageRollEventData

	const rollData = getDamageRollData(eventData)
	const { actor, data } = rollData ?? {}

	return RollGURPS.handleRoll(game.user, actor, data)
}

type DamageRollEventData = {
	type: RollType
	actor: string
	weapon: string
}

function getDamageRollData(
	eventData: DamageRollEventData,
): { actor: ActorGURPS; data: Record<string, unknown> } | undefined {
	const type: RollType = eventData.type

	if (type !== RollType.Damage) {
		console.error(`Damage roll called with wrong type: ${type}`)
		return undefined
	}

	const actor = game.actors!.get(eventData.actor) as ActorGURPS
	const data: { [key: string]: unknown } = { type: type }
	data.item = actor.items.get(eventData.weapon)
	data.times = 1

	return { actor, data }
}

async function _onMultiDamageRoll(event: JQuery.ClickEvent): Promise<void> {
	event.preventDefault()
	event.stopPropagation()

	const damageButtons = $(event.currentTarget).closest(".damage-buttons")

	const damageRoll = $(damageButtons).find(".damage.rollable")
	const eventData = $(damageRoll).data() as DamageRollEventData
	const data = getDamageRollData(eventData)
	if (!data) return

	// const damageHits = $(damageButtons).find(".damage.hits")
	// let times = parseInt($(damageHits).data("times"))

	const times = parseInt(event.currentTarget.innerText)
	data.data.times = times
	await RollGURPS.handleRoll(game.user, data.actor, data.data)
}

/**
 *
 * @param event
 * @param hover
 */
async function _onRollableHover(event: JQuery.MouseOverEvent | JQuery.MouseOutEvent, hover: boolean) {
	event.preventDefault()
	if (hover) event.currentTarget.classList.add("hover")
	else event.currentTarget.classList.remove("hover")
}
