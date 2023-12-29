import { BaseWeaponGURPS } from "@item/weapon"
import { RangedWeaponSource, WeaponAccuracy, WeaponBulk, WeaponROF, WeaponROFMode, WeaponRange, WeaponRecoil, WeaponShots } from "./data"
import { Int } from "@util/fxp"

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

	get accuracy(): Partial<WeaponAccuracy> {
		const wa: Partial<WeaponAccuracy> = {}
		let s = this.system.accuracy.trim()
		if (s.includes("jet")) {
			wa.jet = true
		} else {
			s = s.replace(/^\+/, "")
			const parts = s.split("+");
			[wa.base, parts[0]] = Int.extract(parts[0])
			if (parts.length > 1) wa.scope = Int.fromString(parts[1])
		}
		return wa

		// return this.system.accuracy
	}

	get range(): Partial<WeaponRange> {
		const wr: Partial<WeaponRange> = {}
		let s = this.system.range.trim()
		if (
			!s.includes("sight") &&
			!s.includes("spec") &&
			!s.includes("skill") &&
			!s.includes("point") &&
			!s.includes("pbaoe") &&
			!s.startsWith("b")
		) {
			s = s.replaceAll(",max", "/")
			s = s.replaceAll("max", "")
			s = s.replaceAll("1/2d", "")
			wr.musclePowered = s.includes("x")
			s = s.replaceAll("x", "")
			s = s.replaceAll("st", "")
			s = s.replaceAll("c/", "")
			wr.inMiles = s.includes("mi")
			s = s.replaceAll("mi.", "")
			s = s.replaceAll("mi", "")
			s = s.replaceAll(",", "")
			let parts = s.split("/")
			if (parts.length > 1) {
				wr.halfDamage = Int.fromString(parts[0])
				parts[0] = parts[1]
			}
			parts = parts[0].split("-")
			if (parts.length > 1) {
				wr.min = Int.fromString(parts[0])
				wr.max = Int.fromString(parts[1])
			} else {
				wr.max = Int.fromString(parts[0])
			}
		}

		return wr
		// return this.system.range
	}

	get rate_of_fire(): DeepPartial<WeaponROF> {
		const wr: DeepPartial<WeaponROF> = {}
		let s = this.system.rate_of_fire.trim()
		if (s.includes("jet")) wr.jet = true
		else {
			const parts = s.split("/")
			wr.mode1 = this._parseWeaponROFMode(parts[0])
			if (parts.length > 1)
				wr.mode2 = this._parseWeaponROFMode(parts[1])
		}

		return wr
		// return this.system.rate_of_fire
	}

	private _parseWeaponROFMode(s: string): Partial<WeaponROFMode> {
		const wr: Partial<WeaponROFMode> = {}
		s = s.trim().toLowerCase().replaceAll(".", "x")
		wr.fullAutoOnly = s.includes("!")
		s = s.replaceAll("!", "")
		wr.highCyclicControlledBursts = s.includes("#")
		s = s.replaceAll("#", "")
		s = s.replaceAll("×", "x")
		if (s.startsWith("x")) s = `1${s}`
		const parts = s.split("x")
		wr.shotsPerAttack = Int.fromString(s)
		if (parts.length > 1) wr.secondaryProjectiles = Int.fromString(parts[1])

		return wr
	}

	get shots(): Partial<WeaponShots> {
		const ws: Partial<WeaponShots> = {}
		let s = this.system.shots.trim().toLowerCase().replaceAll(",", "")
		if (
			!s.includes("fp") &&
			!s.includes("hrs") &&
			!s.includes("day")
		) {
			ws.thrown = s.includes("t")
			if (!s.includes("spec")) {
				[ws.count, s] = Int.extract(s)
				if (s.startsWith("+")) [ws.inChamber, s] = Int.extract(s)
				if (s.startsWith("x")) [ws.duration, s] = Int.extract(s.slice(1))
				if (s.startsWith("(")) {
					[ws.reloadTime, s] = Int.extract(s.slice(1))
					ws.reloadTimeIsPerShot = s.includes("i")
				}
			}
		}

		return ws
		// return this.system.shots
	}

	get bulk(): Partial<WeaponBulk> {
		const wb: Partial<WeaponBulk> = {}
		let s = this.system.bulk.trim().replaceAll(",", "")
		wb.retractingStock = s.includes("*")
		const parts = s.split("/");
		[wb.normal,] = Int.extract(parts[0])
		if (parts.length > 1) [wb.giant,] = Int.extract(parts[1])
		return wb
		// return this.system.bulk
	}

	get recoil(): Partial<WeaponRecoil> {
		let wr: Partial<WeaponRecoil> = {}
		let s = this.system.recoil.trim().replaceAll(",", "")
		const parts = s.split("/");
		[wr.shot,] = Int.extract(parts[0])
		if (parts.length > 1)
			[wr.slug,] = Int.extract(parts[1])

		return wr
		// return this.system.recoil
	}
}
