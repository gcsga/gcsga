import { ActorGURPS } from "@actor"
import { AbstractContainerGURPS } from "@item"
import { EquipmentModifierContainerSource, EquipmentModifierContainerSystemData } from "./data.ts"

class EquipmentModifierContainerGURPS<
	TParent extends ActorGURPS | null = ActorGURPS | null,
> extends AbstractContainerGURPS<TParent> {}

interface EquipmentModifierContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
	extends AbstractContainerGURPS<TParent> {
	readonly _source: EquipmentModifierContainerSource
	system: EquipmentModifierContainerSystemData
}

export { EquipmentModifierContainerGURPS }
