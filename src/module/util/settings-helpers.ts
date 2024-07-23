import { CharacterConfigSheet } from "@actor/character/config.ts"
import {
	DropDataAttribute,
	DropDataAttributeThreshold,
	DropDataHitLocation,
	DropDataMoveType,
	DropDataMoveTypeOverride,
	DropDataResourceTracker,
	DropDataResourceTrackerThreshold,
} from "@module/apps/damage-calculator/damage-chat-message.ts"
import { SETTINGS, SYSTEM_NAME } from "@module/data/constants.ts"
import {
	AttributeDef,
	BodyGURPS,
	HitLocation,
	MoveTypeDef,
	PoolThreshold,
	RESERVED_IDS,
	ResourceTrackerDef,
} from "@system"
import { MoveTypeOverride } from "@system/move-type/override.ts"
import { AttributeSettings } from "@system/settings/attributes.ts"
import { HitLocationSettings } from "@system/settings/hit-locations.ts"
import { ResourceTrackerSettings } from "@system/settings/resource-trackers.ts"
import { MoveSettings } from "@system/settings/move-type.ts"
import { prepareFormData, sanitizeId } from "@util"

type DropDataContext = {
	element: HTMLElement
	app: CharacterConfigSheet | AttributeSettings | ResourceTrackerSettings | MoveSettings | HitLocationSettings
	targetIndex: number
}

function addAttribute(context: DropDataContext): void {
	if (!(context.app instanceof CharacterConfigSheet || context.app instanceof AttributeSettings)) return

	const attributes = context.app.attributes
	attributes.push(AttributeDef.createInstance(context.app.getReservedIds()))

	if (context.app instanceof CharacterConfigSheet)
		context.app.actor.update({ "system.settings.attributes": attributes })
	else game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`, attributes)
}

function removeAttribute(context: DropDataContext): void {
	if (!(context.app instanceof CharacterConfigSheet || context.app instanceof AttributeSettings)) return
	if (!(context.element instanceof HTMLAnchorElement)) return

	const index = Number(context.element.dataset.index) ?? null
	if (!(typeof index === "number")) return console.error("Invalid index")

	const attributes = context.app.attributes
	attributes.splice(index, 1)

	if (context.app instanceof CharacterConfigSheet)
		context.app.actor.update({ "system.settings.attributes": attributes })
	else game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`, attributes)
}

function addAttributeThreshold(context: DropDataContext): void {
	if (!(context.app instanceof CharacterConfigSheet || context.app instanceof AttributeSettings)) return

	const index = parseInt(context.element.dataset.index ?? "")
	if (isNaN(index)) return console.error("Invalid index")

	const attributes = context.app.attributes
	attributes[index].thresholds?.push(new PoolThreshold({}))

	if (context.app instanceof CharacterConfigSheet)
		context.app.actor.update({ "system.settings.attributes": attributes })
	else game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`, attributes)
}

function removeAttributeThreshold(context: DropDataContext): void {
	if (!(context.app instanceof CharacterConfigSheet || context.app instanceof AttributeSettings)) return
	if (!(context.element instanceof HTMLAnchorElement)) return

	const pindex = parseInt(context.element.dataset.pindex ?? "")
	if (isNaN(pindex)) return console.error("Invalid parent index")
	if (!(typeof pindex === "number")) return console.error("Invalid index")

	const index = parseInt(context.element.dataset.index ?? "")
	if (isNaN(index)) return console.error("Invalid index")

	const attributes = context.app.attributes
	attributes[pindex].thresholds?.splice(index, 1)

	if (context.app instanceof CharacterConfigSheet)
		context.app.actor.update({ "system.settings.attributes": attributes })
	else game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`, attributes)
}

function addResourceTracker(context: DropDataContext): void {
	if (!(context.app instanceof CharacterConfigSheet || context.app instanceof ResourceTrackerSettings)) return

	const resourceTrackers = context.app.resourceTrackers
	resourceTrackers.push(ResourceTrackerDef.createInstance(context.app.getReservedIds()))

	if (context.app instanceof CharacterConfigSheet)
		context.app.actor.update({ "system.settings.resource_trackers": resourceTrackers })
	else game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`, resourceTrackers)
}

function removeResourceTracker(context: DropDataContext): void {
	if (!(context.app instanceof CharacterConfigSheet || context.app instanceof ResourceTrackerSettings)) return
	if (!(context.element instanceof HTMLAnchorElement)) return

	const index = Number(context.element.dataset.index) ?? null
	if (!(typeof index === "number")) return console.error("Invalid index")

	const resourceTrackers = context.app.resourceTrackers
	resourceTrackers.splice(index, 1)

	if (context.app instanceof CharacterConfigSheet)
		context.app.actor.update({ "system.settings.resourceTrackers": resourceTrackers })
	else game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`, resourceTrackers)
}

function addResourceTrackerThreshold(context: DropDataContext): void {
	if (!(context.app instanceof CharacterConfigSheet || context.app instanceof ResourceTrackerSettings)) return

	const index = parseInt(context.element.dataset.index ?? "")
	if (isNaN(index)) return console.error("Invalid index")

	const resourceTrackers = context.app.resourceTrackers
	resourceTrackers[index].thresholds?.push(new PoolThreshold({}, { parent: resourceTrackers[index].parent }))

	if (context.app instanceof CharacterConfigSheet)
		context.app.actor.update({ "system.settings.resource_trackers": resourceTrackers })
	else game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`, resourceTrackers)
}

function removeResourceTrackerThreshold(context: DropDataContext): void {
	if (!(context.app instanceof CharacterConfigSheet || context.app instanceof ResourceTrackerSettings)) return
	if (!(context.element instanceof HTMLAnchorElement)) return

	const pindex = parseInt(context.element.dataset.pindex ?? "")
	if (isNaN(pindex)) return console.error("Invalid parent index")
	if (!(typeof pindex === "number")) return console.error("Invalid index")

	const index = parseInt(context.element.dataset.index ?? "")
	if (isNaN(index)) return console.error("Invalid index")

	const resourceTrackers = context.app.resourceTrackers
	resourceTrackers[pindex].thresholds?.splice(index, 1)

	if (context.app instanceof CharacterConfigSheet)
		context.app.actor.update({ "system.settings.resource_trackers": resourceTrackers })
	else game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`, resourceTrackers)
}

function addMoveType(context: DropDataContext): void {
	if (!(context.app instanceof CharacterConfigSheet || context.app instanceof MoveSettings)) return

	const moveTypes = context.app.moveTypes
	moveTypes.push(MoveTypeDef.createInstance(context.app.getReservedIds()))

	if (context.app instanceof CharacterConfigSheet)
		context.app.actor.update({ "system.settings.move_types": moveTypes })
	else game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`, moveTypes)
}

function removeMoveType(context: DropDataContext): void {
	if (!(context.app instanceof CharacterConfigSheet || context.app instanceof MoveSettings)) return
	if (!(context.element instanceof HTMLAnchorElement)) return

	const index = Number(context.element.dataset.index) ?? null
	if (!(typeof index === "number")) return console.error("Invalid index")

	const moveTypes = context.app.moveTypes
	moveTypes.splice(index, 1)

	if (context.app instanceof CharacterConfigSheet)
		context.app.actor.update({ "system.settings.move_types": moveTypes })
	else game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`, moveTypes)
}

function addMoveTypeOverride(context: DropDataContext): void {
	if (!(context.app instanceof CharacterConfigSheet || context.app instanceof MoveSettings)) return

	const index = parseInt(context.element.dataset.index ?? "")
	if (isNaN(index)) return console.error("Invalid index")

	const moveTypes = context.app.moveTypes
	moveTypes[index].overrides?.push(new MoveTypeOverride({}, { parent: moveTypes[index].parent }))

	if (context.app instanceof CharacterConfigSheet)
		context.app.actor.update({ "system.settings.move_types": moveTypes })
	else game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`, moveTypes)
}

function removeMoveTypeOverride(context: DropDataContext): void {
	if (!(context.app instanceof CharacterConfigSheet || context.app instanceof MoveSettings)) return

	const pindex = parseInt(context.element.dataset.pindex ?? "")
	if (isNaN(pindex)) return console.error("Invalid parent index")
	if (!(typeof pindex === "number")) return console.error("Invalid index")

	const index = parseInt(context.element.dataset.index ?? "")
	if (isNaN(index)) return console.error("Invalid index")

	const moveTypes = context.app.moveTypes
	moveTypes[pindex].overrides?.splice(index, 1)

	if (context.app instanceof CharacterConfigSheet)
		context.app.actor.update({ "system.settings.move_types": moveTypes })
	else game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`, moveTypes)
}

function addHitLocation(context: DropDataContext): void {
	if (!(context.app instanceof CharacterConfigSheet || context.app instanceof HitLocationSettings)) return

	const path = context.element?.dataset.path?.replace(/^array\./, "")
	if (!path) return console.error("Invalid path")

	const index = parseInt(context.element.dataset.index ?? "")
	if (isNaN(index)) return console.error("Invalid index")

	const table = fu.getProperty(context.app, `${path}.locations`)
	if (!Array.isArray(table)) return

	table.push(HitLocation.createInstance())

	if (context.app instanceof CharacterConfigSheet) {
		const formData = prepareFormData({ [`array.${path.replace(/^actor\./, "")}`]: table }, context.app.actor)
		context.app.actor.update(formData)
	} else {
		const formData = prepareFormData(
			{ [`array.${path.replace(/^actor\./, "")}`]: table },
			{ body_type: context.app.bodyType },
		)
		Object.keys(formData).forEach(key => {
			formData[key.replace(/^body_type\./, "")] = formData[key]
			delete formData[key]
		})
		game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`, formData["locations"])
	}
}

function removeHitLocation(context: DropDataContext): void {
	if (!(context.app instanceof CharacterConfigSheet || context.app instanceof HitLocationSettings)) return

	const path = (context.element.dataset.path ?? "").replace(/^array\./, "")
	if (!(typeof path === "string")) return
	const index = parseInt(context.element.dataset.index ?? "")
	if (isNaN(index)) return console.error("Invalid index")

	const table = fu.getProperty(context.app, `${path}.locations`)
	if (!Array.isArray(table)) return

	table.splice(index, 1)

	if (context.app instanceof CharacterConfigSheet) {
		const formData = prepareFormData({ [`array.${path.replace(/^actor\./, "")}`]: table }, context.app.actor)
		context.app.actor.update(formData)
	} else {
		const formData = prepareFormData(
			{ [`array.${path.replace(/^actor\./, "")}`]: table },
			{ body_type: context.app.bodyType },
		)
		Object.keys(formData).forEach(key => {
			formData[key.replace(/^body_type\./, "")] = formData[key]
			delete formData[key]
		})
		game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`, formData["locations"])
	}
}

function addSubTable(context: DropDataContext): void {
	if (!(context.app instanceof CharacterConfigSheet || context.app instanceof HitLocationSettings)) return

	const path = (context.element.dataset.path ?? "").replace(/^array\./, "")
	if (!(typeof path === "string")) return
	const index = parseInt(context.element.dataset.index ?? "")
	if (isNaN(index)) return console.error("Invalid index")

	const table = fu.getProperty(context.app, path)
	if (!Array.isArray(table)) return

	table[index].sub_table = BodyGURPS.createInstance()

	if (context.app instanceof CharacterConfigSheet) {
		const formData = prepareFormData({ [`array.${path.replace(/^actor\./, "")}`]: table }, context.app.actor)
		context.app.actor.update(formData)
	} else {
		const formData = prepareFormData(
			{ [`array.${path.replace(/^actor\./, "")}`]: table },
			{ body_type: context.app.bodyType },
		)
		Object.keys(formData).forEach(key => {
			formData[key.replace(/^body_type\./, "")] = formData[key]
			delete formData[key]
		})
		game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`, formData["locations"])
	}
}

function removeSubTable(context: DropDataContext): void {
	if (!(context.app instanceof CharacterConfigSheet || context.app instanceof HitLocationSettings)) return

	const path = (context.element.dataset.path ?? "").replace(/^array\./, "")
	if (!(typeof path === "string")) return
	const index = parseInt(context.element.dataset.index ?? "")
	if (isNaN(index)) return console.error("Invalid index")

	const table = fu.getProperty(context.app, path)
	if (!Array.isArray(table)) return

	delete table[index].sub_table

	if (context.app instanceof CharacterConfigSheet) {
		const formData = prepareFormData({ [`array.${path.replace(/^actor\./, "")}`]: table }, context.app.actor)
		context.app.actor.update(formData)
	} else {
		const formData = prepareFormData(
			{ [`array.${path.replace(/^actor\./, "")}`]: table },
			{ body_type: context.app.bodyType },
		)
		Object.keys(formData).forEach(key => {
			formData[key.replace(/^body_type\./, "")] = formData[key]
			delete formData[key]
		})
		game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`, formData["locations"])
	}
}

function onDropAttribute(data: DropDataAttribute, context: DropDataContext): void {
	if (!(context.app instanceof CharacterConfigSheet || context.app instanceof AttributeSettings)) return

	const attributes = context.app.attributes
	const attribute = attributes.splice(data.index, 1)[0]
	if (!attribute) return console.error(`Attribute at index ${data.index} does not exist.`)
	attributes.splice(context.targetIndex, 0, attribute)

	if (context.app instanceof CharacterConfigSheet)
		context.app.actor.update({ "system.settings.attributes": attributes })
	else game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`, attributes)

	context.app.render()
}

function onDropAttributeThreshold(data: DropDataAttributeThreshold, context: DropDataContext): void {
	if (!(context.app instanceof CharacterConfigSheet || context.app instanceof AttributeSettings)) return

	const attributes = context.app.attributes
	const threshold = attributes[data.parentIndex].thresholds?.splice(data.index, 1)[0]
	if (!threshold)
		return console.error(`Attribute threshold at index ${data.parentIndex},${data.index} does not exist.`)
	attributes[data.parentIndex].thresholds?.splice(context.targetIndex, 0, threshold)

	if (context.app instanceof CharacterConfigSheet)
		context.app.actor.update({ "system.settings.attributes": attributes })
	else game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`, attributes)

	context.app.render()
}

function onDropResourceTracker(data: DropDataResourceTracker, context: DropDataContext): void {
	if (!(context.app instanceof CharacterConfigSheet || context.app instanceof ResourceTrackerSettings)) return

	const resourceTrackers = context.app.resourceTrackers
	const resourceTracker = resourceTrackers.splice(data.index, 1)[0]
	if (!resourceTracker) return console.error(`Resource tracker at index ${data.index} does not exist.`)
	resourceTrackers.splice(context.targetIndex, 0, resourceTracker)

	if (context.app instanceof CharacterConfigSheet)
		context.app.actor.update({ "system.settings.resource_trackers": resourceTrackers })
	else game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`, resourceTrackers)

	context.app.render()
}

function onDropResourceTrackerThreshold(data: DropDataResourceTrackerThreshold, context: DropDataContext): void {
	if (!(context.app instanceof CharacterConfigSheet || context.app instanceof ResourceTrackerSettings)) return

	const resourceTrackers = context.app.resourceTrackers
	const threshold = resourceTrackers[data.parentIndex].thresholds?.splice(data.index, 1)[0]
	if (!threshold)
		return console.error(`Resource tracker threshold at index ${data.parentIndex},${data.index} does not exist.`)
	resourceTrackers[data.parentIndex].thresholds?.splice(context.targetIndex, 0, threshold)

	if (context.app instanceof CharacterConfigSheet)
		context.app.actor.update({ "system.settings.resource_trackers": resourceTrackers })
	else game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`, resourceTrackers)

	context.app.render()
}

function onDropMoveType(data: DropDataMoveType, context: DropDataContext): void {
	if (!(context.app instanceof CharacterConfigSheet || context.app instanceof MoveSettings)) return

	const moveTypes = context.app.moveTypes
	const moveType = moveTypes.splice(data.index, 1)[0]
	if (!moveType) return console.error(`Move type at index ${data.index} does not exist.`)
	moveTypes.splice(context.targetIndex, 0, moveType)

	if (context.app instanceof CharacterConfigSheet)
		context.app.actor.update({ "system.settings.move_types": moveTypes })
	else game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`, moveTypes)

	context.app.render()
}

function onDropMoveTypeOverride(data: DropDataMoveTypeOverride, context: DropDataContext): void {
	if (!(context.app instanceof CharacterConfigSheet || context.app instanceof MoveSettings)) return

	const moveTypes = context.app.moveTypes
	const override = moveTypes[data.parentIndex].overrides?.splice(data.index, 1)[0]
	if (!override) return console.error(`Move type override at index ${data.parentIndex},${data.index} does not exist.`)
	moveTypes[data.parentIndex].overrides?.splice(context.targetIndex, 0, override)

	if (context.app instanceof CharacterConfigSheet)
		context.app.actor.update({ "system.settings.move_types": moveTypes })
	else game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`, moveTypes)

	context.app.render()
}

function onDropHitLocation(data: DropDataHitLocation, context: DropDataContext): void {
	if (!(context.app instanceof CharacterConfigSheet || context.app instanceof HitLocationSettings)) return

	const path = context.element?.dataset.path?.replace(/^array\./, "")
	if (!path) return console.error("Drop target path is invalid")

	const table = fu.getProperty(context.app, path) as HitLocation[]
	const hitLocation = table.splice(data.index, 1)[0]
	if (!hitLocation) return console.error(`Hit location at index ${data.index} does not exist.`)
	table.splice(context.targetIndex, 0, hitLocation)

	if (context.app instanceof CharacterConfigSheet) {
		const formData = prepareFormData({ [`array.${path.replace(/^actor\./, "")}`]: table }, context.app.actor)
		context.app.actor.update(formData)
	} else {
		const formData = prepareFormData(
			{ [`array.${path.replace(/^actor\./, "")}`]: table },
			{ body_type: context.app.bodyType },
		)
		Object.keys(formData).forEach(key => {
			formData[key.replace(/^body_type\./, "")] = formData[key]
			delete formData[key]
		})
		game.settings.set(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`, formData["locations"])
	}

	context.app.render()
}

function validateId(context: DropDataContext): void {
	if (!(context.element instanceof HTMLInputElement)) return

	const value = context.element.value
	const name = context.element.name

	let invalid = value === ""

	if (name.includes("locations")) invalid = HitLocation.validateId(value)
	else {
		invalid ||= sanitizeId(value, false, RESERVED_IDS) !== value

		if (name.includes("attributes")) {
			if (!(context.app instanceof CharacterConfigSheet || context.app instanceof AttributeSettings)) return
			invalid ||= context.app.attributes.some(
				(e, index) => e.id === value && !name.endsWith(`attributes.${index}.id`),
			)
		} else if (name.includes("resource_trackers")) {
			if (!(context.app instanceof CharacterConfigSheet || context.app instanceof ResourceTrackerSettings)) return
			invalid ||= context.app.resourceTrackers.some(
				(e, index) => e.id === value && !name.endsWith(`resource_trackers.${index}.id`),
			)
		} else if (name.includes("move_types")) {
			if (!(context.app instanceof CharacterConfigSheet || context.app instanceof MoveSettings)) return
			invalid ||= context.app.moveTypes.some(
				(e, index) => e.id === value && !name.endsWith(`move_types.${index}.id`),
			)
		}
	}
	if (invalid) context.element.classList.add("invalid")
	else context.element.classList.remove("invalid")
}

export {
	addAttribute,
	addAttributeThreshold,
	addHitLocation,
	addMoveType,
	addMoveTypeOverride,
	addResourceTracker,
	addResourceTrackerThreshold,
	addSubTable,
	onDropAttribute,
	onDropAttributeThreshold,
	onDropHitLocation,
	onDropMoveType,
	onDropMoveTypeOverride,
	onDropResourceTracker,
	onDropResourceTrackerThreshold,
	removeAttribute,
	removeAttributeThreshold,
	removeHitLocation,
	removeMoveType,
	removeMoveTypeOverride,
	removeResourceTracker,
	removeResourceTrackerThreshold,
	removeSubTable,
	validateId,
}

export type { DropDataContext }
