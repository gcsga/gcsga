import { BaseWeaponGURPS } from "@item/weapon"
import { gid } from "@module/data"
import { TooltipGURPS } from "@module/tooltip"
import { MeleeWeaponSource } from "./data"

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

	get parry(): number {
		return parseInt(this.resolvedParry()) ?? 0
	}

	get block(): number {
		return parseInt(this.resolvedBlock()) ?? 0
	}

	get reach(): string {
		return this.system.reach
	}
}
