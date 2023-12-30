import { BaseWeaponGURPS } from "@item/weapon"
import { gid } from "@module/data"
import { TooltipGURPS } from "@module/tooltip"
import { MeleeWeaponSource } from "./data"
import { WeaponReach } from "@item/weapon/weapon_reach"
import { WeaponBlock } from "@item/weapon/weapon_block"
import { WeaponParry } from "@item/weapon/weapon_parry"

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

	protected _getCalcValues(): this["system"]["calc"] {
		return {
			...super._getCalcValues(),
			reach: this.reach.current ?? this.system.reach,
			parry: this.parry.current ?? this.system.parry,
			block: this.block.current ?? this.system.block,
		}
	}
}
