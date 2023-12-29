import { BaseWeaponGURPS } from "@item/weapon"
import { gid } from "@module/data"
import { TooltipGURPS } from "@module/tooltip"
import { MeleeWeaponSource, WeaponBlock, WeaponParry, WeaponReach } from "./data"
import { Int } from "@util/fxp"

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

	get parry(): Partial<WeaponParry> {
		const s = this.system.parry
		if (s.includes("no")) return {
			no: true,
			fencing: false,
			unbalanced: false,
			modifier: 0
		}
		return {
			no: false,
			fencing: s.includes("f"),
			unbalanced: s.includes("u"),
			modifier: Int.fromString(s)
		}
		// return parseInt(this.resolvedParry()) ?? 0
	}

	get block(): Partial<WeaponBlock> {
		const s = this.system.block
		if (s.includes("no")) return {
			no: true,
			modifier: 0
		}
		return {
			no: false,
			modifier: Int.fromString(s)
		}
		// return parseInt(this.resolvedBlock()) ?? 0
	}

	get reach(): Partial<WeaponReach> {
		const wr: Partial<WeaponReach> = {
			min: 0,
			max: 0,
			closeComabt: false,
			changeRequiresReady: false
		}
		let s = this.system.reach.trim()
		if (s === "") return wr
		if (!s.includes("spec")) {
			s = s.replaceAll("-", ",")
			wr.closeComabt = s.includes("c")
			wr.changeRequiresReady = s.includes("*")
			s = s.replaceAll("*", "")
			const parts = s.split(",")
			wr.min = Int.fromString(parts[0])
			if (parts.length > 1)
				wr.max = Math.max(...parts.slice(1).map(e => Int.fromString(e)))
		}

		return wr
		// return this.system.reach
	}
}
