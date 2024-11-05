// import { ActorType, GURPS_COMMANDS, RollType, gid } from "@data"
// import { LastActor } from "./last-actor.ts"
// import { RollModifier } from "@module/data/roll-modifier.ts"
// import { ActorGURPS2 } from "@module/document/actor.ts"
//
// export function parse(message: string): [string, string[]] {
// 	for (const [rule, rgx] of Object.entries(GURPS_COMMANDS)) {
// 		// For multi-line matches, the first line must match
// 		const match = message.match(rgx)
// 		if (match) return [rule, match]
// 	}
// 	return ["none", [message, "", message]]
// }
//
// export function processMessage(message: string): boolean {
// 	const [command, _match] = parse(message)
// 	if (command === "none") return true
// 	switch (command) {
// 		// TODO: add back in
// 		case "mook":
// 			// MookGeneratorSheet.init()
// 			return false
// 	}
// 	return true
// }
//
// /**
//  *
//  * @param html
//  */
// export function addChatListeners(html: JQuery<HTMLElement>): void {
// 	html.find(".rollable:not(.damage)").on("click", event => _onRollClick(event))
// 	html.find(".rollable.damage").on("click", event => _onDamageRoll(event))
// 	html.find(".damage.hits > .roll").on("click", event => _onMultiDamageRoll(event))
// 	html.find(".damage.hits > .minus").on("click", event => _onMinusHits(event))
// 	html.find(".damage.hits > .plus").on("click", event => _onPlusHits(event))
// 	html.find(".rollable").on("mouseover", event => _onRollableHover(event, true))
// 	html.find(".rollable").on("mouseout", event => _onRollableHover(event, false))
// 	html.find(".mod").on("click", event => _onModClick(event))
// 	html.find(".mod").on("contextmenu", event => _onModRClick(event))
// }
//
// async function _onMinusHits(event: JQuery.ClickEvent): Promise<void> {
// 	await _onHitsChange(event, -1)
// }
//
// async function _onPlusHits(event: JQuery.ClickEvent): Promise<void> {
// 	await _onHitsChange(event, 1)
// }
//
// async function _onHitsChange(event: JQuery.ClickEvent, delta: number): Promise<void> {
// 	event.preventDefault()
// 	event.stopPropagation()
//
// 	// Get the parent HTML element of target
// 	const parent = event.currentTarget.closest(".damage.hits") as HTMLElement
// 	if (!parent) return
//
// 	// Get the data-times attribute from the parent element
// 	parent.dataset.times = `${Math.max(1, parseInt(parent.dataset.times!) + delta)}`
// 	$(parent).find(".roll").text(`${parent.dataset.times}`)
// }
//
// /**
//  *
//  * @param event
//  */
// async function _onModClick(event: JQuery.ClickEvent): Promise<void> {
// 	event.preventDefault()
// 	event.stopPropagation()
// 	const mod = new RollModifier($(event.currentTarget).data("mod"))
// 	return game.user.addModifier(mod)
// }
//
// /**
//  *
//  * @param event
//  */
// async function _onModRClick(event: JQuery.ContextMenuEvent): Promise<void> {
// 	event.preventDefault()
// 	event.stopPropagation()
// 	const mod: RollModifier = fu.duplicate($(event.currentTarget).data("mod"))
// 	mod.modifier = -mod.modifier
// 	return game.user.addModifier(mod)
// }
//
// /**
//  *
//  * @param event
//  */
// async function _onRollClick(event: JQuery.ClickEvent) {
// 	event.preventDefault()
// 	event.stopPropagation()
// 	const type: RollType = $(event.currentTarget).data("type")
// 	// eslint-disable-next-line @typescript-eslint/no-explicit-any
// 	const data: any = { type: type, hidden: event.ctrlKey }
// 	let actor: ActorGURPS2 | null = await LastActor.get()
// 	if (!actor?.isOfType(ActorType.Character)) return
//
// 	if (type === RollType.Attribute) {
// 		const id = $(event.currentTarget).data("json").id
// 		if (id === gid.Dodge) data.attribute = actor?.system.dodgeAttribute
// 		else data.attribute = actor?.system.attributeMap.get(id)
// 	} else if ([RollType.Skill, RollType.SkillRelative].includes(type)) {
// 		if (actor.isOfType(ActorType.Character)) {
// 			const itemData = $(event.currentTarget).data("json")
//
// 			// Grab best skill or default
// 			data.item = actor.system.bestSkillNamed(itemData.name!, itemData.specialization || "", false, new Set())
//
// 			// Update level at least once to calculate default level
// 			data.item.updateLevel()
// 			if (!data.item || data.item.effectiveLevel === Number.MIN_SAFE_INTEGER) {
// 				ui.notifications?.warn(translations.gurps.notification.no_default_skill)
// 				return
// 			}
// 		}
// 	} else if ([RollType.Spell, RollType.SpellRelative].includes(type)) {
// 		const itemData = $(event.currentTarget).data("json")
// 		data.item = actor.itemCollections.spells.find(e => e.name === itemData.name)
// 		if (!data.item || data.item.effectiveLevel === Number.MIN_SAFE_INTEGER) {
// 			ui.notifications?.warn(translations.gurps.notification.no_default_skill)
// 			return
// 		}
// 	} else if ([RollType.Attack].includes(type)) {
// 		const itemData = $(event.currentTarget).data("json")
// 		data.item = actor.itemCollections.weapons.find(
// 			e => e.system.processedName === itemData.itemName && e.usage === itemData.usage,
// 		)
// 		if (!data.item || data.item.effectiveLevel === Number.MIN_SAFE_INTEGER) {
// 			ui.notifications?.warn(translations.gurps.notification.no_default_skill)
// 			return
// 		}
// 	}
// 	if (type === RollType.Modifier) {
// 		data.modifier = $(event.currentTarget).data("modifier")
// 		data.comment = $(event.currentTarget).data("comment")
// 	}
// 	if (type === RollType.Location) {
// 		actor = (game.actors?.get($(event.currentTarget).data("actorId")) as ActorGURPS2) ?? null
// 	}
// 	if (type === RollType.Generic) data.formula = $(event.currentTarget).data("formula")
//
// 	if (actor !== null) return RollGURPS.handleRoll(game.user, actor as ActorGURPS2, data)
// }
//
// /**
//  *
//  * @param event
//  */
// async function _onDamageRoll(event: JQuery.ClickEvent) {
// 	event.preventDefault()
// 	event.stopPropagation()
// 	event.stopImmediatePropagation()
//
// 	const eventData = $(event.currentTarget).data() as DamageRollEventData
//
// 	const rollData = getDamageRollData(eventData)
// 	const { actor, data } = rollData ?? { actor: null }
//
// 	if (actor !== null) return RollGURPS.handleRoll(game.user, actor, data as RollTypeData)
// }
//
// type DamageRollEventData = {
// 	type: RollType
// 	actor: string
// 	weapon: string
// }
//
// function getDamageRollData(
// 	eventData: DamageRollEventData,
// ): { actor: ActorGURPS2; data: Partial<RollTypeData> } | undefined {
// 	const type: RollType = eventData.type
//
// 	if (type !== RollType.Damage) {
// 		console.error(`Damage roll called with wrong type: ${type}`)
// 		return undefined
// 	}
//
// 	const actor = game.actors.get(eventData.actor)
// 	if (!actor) {
// 		console.error(`Cannot find actor with id "${eventData.actor}"`)
// 		return undefined
// 	}
// 	const data: Partial<RollTypeData> = {
// 		type: RollType.Damage,
// 		item: actor.itemCollections.weapons.get(eventData.weapon) ?? null,
// 		times: 1,
// 	}
//
// 	return { actor, data }
// }
//
// async function _onMultiDamageRoll(event: JQuery.ClickEvent): Promise<void> {
// 	event.preventDefault()
// 	event.stopPropagation()
//
// 	const damageButtons = $(event.currentTarget).closest(".damage-buttons")
//
// 	const damageRoll = $(damageButtons).find(".damage.rollable")
// 	const eventData = $(damageRoll).data() as DamageRollEventData
// 	const data = getDamageRollData(eventData)
// 	if (!data) return
//
// 	// const damageHits = $(damageButtons).find(".damage.hits")
// 	// let times = parseInt($(damageHits).data("times"))
//
// 	const times = parseInt(event.currentTarget.innerText)
// 	if (data.data.type === RollType.Damage) data.data.times = times
// 	await RollGURPS.handleRoll(game.user, data.actor, data.data as RollTypeData)
// }
//
// /**
//  *
//  * @param event
//  * @param hover
//  */
// async function _onRollableHover(event: JQuery.MouseOverEvent | JQuery.MouseOutEvent, hover: boolean) {
// 	event.preventDefault()
// 	if (hover) event.currentTarget.classList.add("hover")
// 	else event.currentTarget.classList.remove("hover")
// }
