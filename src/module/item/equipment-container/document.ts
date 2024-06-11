import { ActorGURPS } from "@actor"
import { AbstractContainerGURPS } from "@item"
import { EquipmentContainerSource, EquipmentContainerSystemData } from "./data.ts"

class EquipmentContainerGURPS<
	TParent extends ActorGURPS | null = ActorGURPS | null,
> extends AbstractContainerGURPS<TParent> {}

interface EquipmentContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
	extends AbstractContainerGURPS<TParent> {
	readonly _source: EquipmentContainerSource
	system: EquipmentContainerSystemData
}

export { EquipmentContainerGURPS }
