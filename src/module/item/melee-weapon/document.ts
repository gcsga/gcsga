import { ActorGURPS } from "@actor"
import { AbstractWeaponGURPS } from "@item"
import { MeleeWeaponSource, MeleeWeaponSystemData } from "./data.ts"
import { ActorType, ItemFlags, RollType, SETTINGS, SYSTEM_NAME } from "@module/data/constants.ts"
import { TooltipGURPS, includesFold } from "@util"
import { WeaponParry } from "@item/abstract-weapon/weapon-parry.ts"
import { WeaponBlock } from "@item/abstract-weapon/weapon-block.ts"
import { WeaponReach } from "@item/abstract-weapon/weapon-reach.ts"

class MeleeWeaponGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractWeaponGURPS<TParent> {
	get parry(): WeaponParry {
		const wp = WeaponParry.parse(this.system.parry)
		wp.current = wp.resolve(this, new TooltipGURPS()).toString()
		return wp
	}

	get block(): WeaponBlock {
		const wb = WeaponBlock.parse(this.system.block)
		wb.current = wb.resolve(this, new TooltipGURPS()).toString()
		return wb
	}

	get reach(): WeaponReach {
		const wr = WeaponReach.parse(this.system.reach)
		wr.current = wr.resolve(this, new TooltipGURPS()).toString()
		return wr
	}

	checkUnready(type: RollType): void {
		const check = game.settings.get(SYSTEM_NAME, SETTINGS.AUTOMATIC_UNREADY)
		if (!check) return
		if (!this.actor) return
		let unready = false
		if (this.parry.unbalanced) unready = true
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

interface MeleeWeaponGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractWeaponGURPS<TParent> {
	readonly _source: MeleeWeaponSource
	system: MeleeWeaponSystemData
}

export { MeleeWeaponGURPS }
