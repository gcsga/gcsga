import { ActorGURPS } from "@actor"
import { AbstractWeaponGURPS } from "@item"
import { RangedWeaponSource, RangedWeaponSystemData } from "./data.ts"
import { ActorType, ItemFlags, RollType, SETTINGS, SYSTEM_NAME } from "@module/data/constants.ts"
import { includesFold } from "@util"

class RangedWeaponGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractWeaponGURPS<TParent> {
	checkUnready(type: RollType): void {
		const check = game.settings.get(SYSTEM_NAME, SETTINGS.AUTOMATIC_UNREADY)
		if (!check) return
		if (!this.actor) return
		let unready = false
		if (type === RollType.Attack) {
			let twoHanded = false
			if (
				includesFold(this.usage, "two-handed") ||
				includesFold(this.usage, "two handed") ||
				includesFold(this.usage, "2-handed") ||
				includesFold(this.system.usage_notes, "two-handed") ||
				includesFold(this.system.usage_notes, "two handed") ||
				includesFold(this.system.usage_notes, "2-handed")
			)
				twoHanded = true
			const st = this.strength.min ?? 0
			const actorST = this.actor.isOfType(ActorType.Character) ? this.actor.strengthOrZero : 0
			if (twoHanded) {
				if (this.strength.twoHandedUnready && actorST < st * 1.5) unready = true
			} else {
				if (this.strength.twoHandedUnready && actorST < st * 3) unready = true
				if (this.strength.twoHanded && actorST < st * 2) unready = true
			}
		}
		this.setFlag(SYSTEM_NAME, ItemFlags.Unready, unready)
	}
}

interface RangedWeaponGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
	extends AbstractWeaponGURPS<TParent> {
	readonly _source: RangedWeaponSource
	system: RangedWeaponSystemData
}

export { RangedWeaponGURPS }
