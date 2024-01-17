import { BaseWeaponGURPS } from "@item/weapon"
import { RollType, SETTINGS, SYSTEM_NAME, gid } from "@module/data"
import { TooltipGURPS } from "@module/tooltip"
import { MeleeWeaponSource } from "./data"
import { WeaponReach } from "@item/weapon/weapon_reach"
import { WeaponBlock } from "@item/weapon/weapon_block"
import { WeaponParry } from "@item/weapon/weapon_parry"
import { includesFold } from "@util"
import { ItemFlags } from "@item/data"

export class MeleeWeaponGURPS extends BaseWeaponGURPS<MeleeWeaponSource> {
	get fastResolvedParry(): string {
		return this.resolvedParry()
	}

	resolvedParry(tooltip?: TooltipGURPS): string {
		return this.resolvedValue(this.system.parry, gid.Parry, tooltip)
	}

	get fastResolvedBlock(): string {
		return this.resolvedBlock()
	}

	resolvedBlock(tooltip?: TooltipGURPS): string {
		return this.resolvedValue(this.system.block, gid.Block, tooltip)
	}

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
		const check = game.settings.get(SYSTEM_NAME, SETTINGS.AUTOMATIC_UNREADY) as boolean
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
			) twoHanded = true
			const st = this.strength.min ?? 0
			const actorST = this.actor.strengthOrZero
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
