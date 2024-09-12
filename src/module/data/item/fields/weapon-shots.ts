import fields = foundry.data.fields
import { WeaponField } from "./weapon-field.ts"
import { Int, StringBuilder, TooltipGURPS, feature, wswitch } from "@util"
import { WeaponRangedData } from "../weapon-ranged.ts"

class WeaponShots extends WeaponField<WeaponRangedData, WeaponShotsSchema> {
	static override defineSchema(): WeaponShotsSchema {
		const fields = foundry.data.fields
		return {
			count: new fields.NumberField<number, number, true, false, true>({
				required: true,
				nullable: false,
				initial: 0,
			}),
			inChamber: new fields.NumberField<number, number, true, false, true>({
				required: true,
				nullable: false,
				initial: 0,
			}),
			duration: new fields.NumberField<number, number, true, false, true>({
				required: true,
				nullable: false,
				initial: 0,
			}),
			reloadTime: new fields.NumberField<number, number, true, false, true>({
				required: true,
				nullable: false,
				initial: 0,
			}),
			reloadTimeIsPerShot: new fields.BooleanField<boolean>({ required: true, nullable: false, initial: false }),
			thrown: new fields.BooleanField<boolean>({ required: true, nullable: false, initial: false }),
		}
	}

	static override fromString(s: string): WeaponShots {
		const ws = new WeaponShots({})
		s = s.toLowerCase().replaceAll(" ", "").replaceAll(",", "")
		if (!s.includes("fp") && !s.includes("hrs") && !s.includes("day")) {
			ws.thrown = s.includes("t")
			if (!s.includes("spec")) {
				;[ws.count, s] = Int.extract(s)
				if (s.startsWith("+")) [ws.inChamber, s] = Int.extract(s)
				if (s.startsWith("x")) [ws.duration, s] = Int.extract(s.substring(1))
				if (s.startsWith("(")) {
					;[ws.reloadTime] = Int.extract(s.substring(1))
					ws.reloadTimeIsPerShot = s.includes("i")
				}
			}
		}
		ws.clean()
		return ws
	}

	override toString(): string {
		const buffer = new StringBuilder()
		if (this.thrown) {
			buffer.push("T")
		} else {
			if (this.count <= 0) return ""
			buffer.push(this.count.toString())
			if (this.inChamber > 0) buffer.push("+", this.inChamber.toString())
			if (this.duration > 0) buffer.push("x", this.duration.toString(), "s")
		}
		if (this.reloadTime > 0) {
			buffer.push("(", this.reloadTime.toString())
			if (this.reloadTimeIsPerShot) buffer.push("i")
			buffer.push(")")
		}
		return buffer.toString()
	}

	override resolveValue(w: WeaponRangedData, tooltip: TooltipGURPS): WeaponShots {
		const result = this.clone()
		result.reloadTimeIsPerShot = w.resolveBoolFlag(wswitch.Type.ReloadTimeIsPerShot, result.reloadTimeIsPerShot)
		result.thrown = w.resolveBoolFlag(wswitch.Type.Thrown, result.thrown)
		let [percentCount, percentInChamber, percentDuration, percentReloadTime] = [0, 0, 0, 0]
		for (const bonus of w.collectWeaponBonuses(
			1,
			tooltip,
			feature.Type.WeaponNonChamberShotsBonus,
			feature.Type.WeaponChamberShotsBonus,
			feature.Type.WeaponShotDurationBonus,
			feature.Type.WeaponReloadTimeBonus,
		)) {
			const amt = bonus.adjustedAmountForWeapon(w)
			switch (bonus.type) {
				case feature.Type.WeaponNonChamberShotsBonus:
					if (bonus.percent) percentCount += amt
					else result.count += amt
					break
				case feature.Type.WeaponChamberShotsBonus:
					if (bonus.percent) percentInChamber += amt
					else result.inChamber += amt
					break
				case feature.Type.WeaponShotDurationBonus:
					if (bonus.percent) percentDuration += amt
					else result.duration += amt
					break
				case feature.Type.WeaponReloadTimeBonus:
					if (bonus.percent) percentReloadTime += amt
					else result.reloadTime += amt
			}
		}

		if (percentCount !== 0) result.count += Math.trunc((result.count * percentCount) / 100)
		if (percentInChamber !== 0) result.inChamber += Math.trunc((result.inChamber * percentInChamber) / 100)
		if (percentDuration !== 0) result.duration += Math.trunc((result.duration * percentDuration) / 100)
		if (percentReloadTime !== 0) result.reloadTime += Math.trunc((result.reloadTime * percentReloadTime) / 100)
		result.clean()
		return result
	}

	override clean(): void {
		this.reloadTime = Math.max(this.reloadTime, 0)
		if (this.thrown) {
			this.count = 0
			this.inChamber = 0
			this.duration = 0
			return
		}
		this.count = Math.max(this.count, 0)
		if (this.count === 0) {
			this.inChamber = 0
			this.duration = 0
			this.reloadTime = 0
			return
		}
		this.inChamber = Math.max(this.inChamber, 0)
		this.duration = Math.max(this.duration, 0)
	}
}

interface WeaponShots
	extends WeaponField<WeaponRangedData, WeaponShotsSchema>,
		ModelPropsFromSchema<WeaponShotsSchema> {}

type WeaponShotsSchema = {
	count: fields.NumberField<number, number, true, false, true>
	inChamber: fields.NumberField<number, number, true, false, true>
	duration: fields.NumberField<number, number, true, false, true>
	reloadTime: fields.NumberField<number, number, true, false, true>
	reloadTimeIsPerShot: fields.BooleanField<boolean, boolean, true, false, true>
	thrown: fields.BooleanField<boolean, boolean, true, false, true>
}

export { WeaponShots, type WeaponShotsSchema }
