import { ActorGURPS } from "@actor"
import { AbstractContainerGURPS } from "@item"
import { EquipmentSource, EquipmentSystemData } from "./data.ts"

class EquipmentGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractContainerGURPS<TParent> {}

interface EquipmentGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
	extends AbstractContainerGURPS<TParent> {
	readonly _source: EquipmentSource
	system: EquipmentSystemData
}

export { EquipmentGURPS }
