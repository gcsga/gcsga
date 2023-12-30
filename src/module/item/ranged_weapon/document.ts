import { BaseWeaponGURPS } from "@item/weapon"
import { RangedWeaponSource } from "./data"
import { WeaponAccuracy } from "@item/weapon/weapon_accuracy"
import { WeaponRange } from "@item/weapon/weapon_range"
import { WeaponBulk } from "@item/weapon/weapon_bulk"
import { WeaponROF } from "@item/weapon/weapon_rof"
import { WeaponShots } from "@item/weapon/weapon_shots"
import { WeaponRecoil } from "@item/weapon/weapon_recoil"
import { TooltipGURPS } from "@module/tooltip"

export class RangedWeaponGURPS extends BaseWeaponGURPS<RangedWeaponSource> {
	get resolvedRange(): string {
		const actor = this.actor
		if (!actor) return this.system.range
		const st = Math.trunc(actor.strengthOrZero + actor.throwing_st_bonus)
		let savedRange = ""
		let calcRange = this.system.range
		while (calcRange !== savedRange) {
			savedRange = calcRange
			calcRange = this.resolveRange(calcRange, st)
		}
		return calcRange
	}

	resolveRange(inRange: string, st: number): string {
		const where = inRange.indexOf("x")
		if (where === -1) return inRange
		let last = where + 1
		let max = inRange.length
		if (last < max && inRange[last] === " ") last++
		if (last >= max) return inRange
		let ch = inRange[last]
		let found = false
		let decimal = false
		let started = last
		while ((!decimal && ch === ".") || ch.match("[0-9]")) {
			found = true
			if (ch === ".") decimal = true
			last++
			if (last >= max) break
			ch = inRange[last]
		}
		if (!found) return inRange
		let value = parseFloat(inRange.substring(started, last))
		let buffer = ""
		if (where > 0) buffer += inRange.substring(0, where)
		buffer += Math.trunc(value * st).toString()
		if (last < max) buffer += inRange.substring(last)
		return buffer
	}

	get accuracy(): WeaponAccuracy {
		const wa = WeaponAccuracy.parse(this.system.accuracy)
		wa.current = wa.resolve(this, new TooltipGURPS()).toString()
		return wa
	}

	get range(): WeaponRange {
		const wr = WeaponRange.parse(this.system.range)
		wr.current = wr.resolve(this, new TooltipGURPS()).toString(true)
		return wr
	}

	get rate_of_fire(): WeaponROF {
		const wr = WeaponROF.parse(this.system.rate_of_fire)
		wr.current = wr.resolve(this, new TooltipGURPS()).toString()
		return wr
	}

	get shots(): WeaponShots {
		const ws = WeaponShots.parse(this.system.shots)
		ws.current = ws.resolve(this, new TooltipGURPS()).toString()
		return ws
	}

	get bulk(): WeaponBulk {
		const wb = WeaponBulk.parse(this.system.bulk)
		wb.current = wb.resolve(this, new TooltipGURPS()).toString()
		return wb
	}

	get recoil(): WeaponRecoil {
		const wr = WeaponRecoil.parse(this.system.recoil)
		wr.current = wr.resolve(this, new TooltipGURPS()).toString()
		return wr
	}

	protected _getCalcValues(): this["system"]["calc"] {
		return {
			...super._getCalcValues(),
			accuracy: this.accuracy.current ?? this.system.accuracy,
			range: this.range.current ?? this.system.range,
			rate_of_fire: this.rate_of_fire.current ?? this.system.rate_of_fire,
			shots: this.shots.current ?? this.system.shots,
			bulk: this.bulk.current ?? this.system.bulk,
			recoil: this.recoil.current ?? this.system.recoil,
		}
	}
}
