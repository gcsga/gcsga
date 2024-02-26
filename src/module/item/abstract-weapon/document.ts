import { ActorGURPS } from "@actor"
import { ItemGURPS } from "@item"
import { MeleeWeaponSource, MeleeWeaponSystemData } from "@item/melee-weapon/data.ts"
import { RangedWeaponSource, RangedWeaponSystemData } from "@item/ranged-weapon/data.ts"

abstract class AbstractWeaponGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGURPS<TParent> {}

interface AbstractWeaponGURPS<TParent extends ActorGURPS | null> extends ItemGURPS<TParent> {
	readonly _source: MeleeWeaponSource | RangedWeaponSource
	system: MeleeWeaponSystemData | RangedWeaponSystemData
}

export { AbstractWeaponGURPS }
