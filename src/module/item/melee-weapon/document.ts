import { ActorGURPS } from "@actor"
import { AbstractWeaponGURPS } from "@item"
import { MeleeWeaponSource, MeleeWeaponSystemData } from "./data.ts"

class MeleeWeaponGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractWeaponGURPS<TParent> {}

interface MeleeWeaponGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractWeaponGURPS<TParent> {
	readonly _source: MeleeWeaponSource
	system: MeleeWeaponSystemData
}

export { MeleeWeaponGURPS }
