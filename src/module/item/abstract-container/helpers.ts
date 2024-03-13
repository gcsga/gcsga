import { ActorGURPS } from "@actor"
import { AbstractContainerGURPS, ItemGURPS } from "@item"

/**
 * Detect if adding an item to a container would produce a cycle
 * @param item The item being added to a container
 * @param container The container to which the item is being added
 */
function isContainerCycle(item: ItemGURPS, container: AbstractContainerGURPS<ActorGURPS>): boolean {
	if (item === container) return true
	if (container.container) return isContainerCycle(item, container.container)
	return false
}

export { isContainerCycle }
