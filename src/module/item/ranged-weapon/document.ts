import { ActorGURPS } from "@actor"
import { AbstractWeaponGURPS } from "@item"
import { RangedWeaponSource, RangedWeaponSystemData } from "./data.ts"

class RangedWeaponGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractWeaponGURPS<TParent> {}

interface RangedWeaponGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
	extends AbstractWeaponGURPS<TParent> {
	readonly _source: RangedWeaponSource
	system: RangedWeaponSystemData
}

export { RangedWeaponGURPS }
