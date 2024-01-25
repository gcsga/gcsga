import { ActorGURPS, CharacterGURPS } from "@actor/document.ts"
import { RangedWeaponSystemData } from "./data.ts"
import { BaseWeaponGURPS } from "@item/index.ts"
import { WeaponAccuracy } from "@item/weapon/weapon_accuracy.ts"
import { WeaponRange } from "@item/weapon/weapon_range.ts"
import { TooltipGURPS } from "@sytem/tooltip/index.ts"
import { WeaponROF } from "@item/weapon/weapon_rof.ts"
import { WeaponShots } from "@item/weapon/weapon_shots.ts"
import { WeaponBulk } from "@item/weapon/weapon_bulk.ts"
import { RollType, SETTINGS, SYSTEM_NAME } from "@module/data/misc.ts"
import { WeaponRecoil } from "@item/weapon/weapon_recoil.ts"
import { includesFold } from "@util/string_criteria.ts"
import { ItemFlags } from "@item/data.ts"

export interface RangedWeaponGURPS<TParent extends ActorGURPS> extends BaseWeaponGURPS<TParent> {
	system: RangedWeaponSystemData
}

export class RangedWeaponGURPS<TParent extends ActorGURPS = ActorGURPS> extends BaseWeaponGURPS<TParent> {
	get resolvedRange(): string {
		const actor = this.actor
		if (!(actor instanceof CharacterGURPS)) return this.system.range
		const st = Math.trunc(actor.throwingST)
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
		const max = inRange.length
		if (last < max && inRange[last] === " ") last++
		if (last >= max) return inRange
		let ch = inRange[last]
		let found = false
		let decimal = false
		const started = last
		while ((!decimal && ch === ".") || ch.match("[0-9]")) {
			found = true
			if (ch === ".") decimal = true
			last++
			if (last >= max) break
			ch = inRange[last]
		}
		if (!found) return inRange
		const value = parseFloat(inRange.substring(started, last))
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
