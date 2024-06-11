import { ActorGURPS } from "@actor"
import { ItemGURPS } from "@item"
import { EquipmentModifierSource, EquipmentModifierSystemData } from "./data.ts"

class EquipmentModifierGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGURPS<TParent> {}

interface EquipmentModifierGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGURPS<TParent> {
	readonly _source: EquipmentModifierSource
	system: EquipmentModifierSystemData
}

export { EquipmentModifierGURPS }
