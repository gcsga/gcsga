import fields = foundry.data.fields
import { Int, StringBuilder, TooltipGURPS, feature, wswitch } from "@util"
import { type WeaponRangedData } from "../weapon-ranged.ts"
import { WeaponField } from "./weapon-field.ts"

class WeaponROFMode extends WeaponField<WeaponRangedData, WeaponROFModeSchema> {
	static override defineSchema(): WeaponROFModeSchema {
		const fields = foundry.data.fields
		return {
			shotsPerAttack: new fields.NumberField<number, number, true, false, true>({
				required: true,
				nullable: false,
				initial: 0,
			}),
			secondaryProjectiles: new fields.NumberField<number, number, true, false, true>({
				required: true,
				nullable: false,
				initial: 0,
			}),
			fullAutoOnly: new fields.BooleanField<boolean>({ required: true, nullable: false, initial: false }),
			highCyclicControlledBursts: new fields.BooleanField<boolean>({
				required: true,
				nullable: false,
				initial: false,
			}),
		}
	}

	static override fromString(s: string): WeaponROFMode {
		const wr = new WeaponROFMode({})
		s = s.replaceAll(" ", "").toLowerCase().replaceAll(".", "x")
		wr.fullAutoOnly = s.includes("!")
		s = s.replaceAll("!", "")
		wr.highCyclicControlledBursts = s.includes("#")
		s = s.replaceAll("#", "").replaceAll("×", "x")
		if (s.startsWith("x")) {
			s = "1" + s
		}
		const parts = s.split("x")
		;[wr.shotsPerAttack] = Int.extract(s)
		if (parts.length > 1) {
			;[wr.secondaryProjectiles] = Int.extract(parts[1])
		}
		wr.clean()
		return wr
	}

	override toString(): string {
		if (this.shotsPerAttack <= 0) return ""
		const buffer = new StringBuilder()
		buffer.push(this.shotsPerAttack.toString())
		if (this.secondaryProjectiles > 0) {
			buffer.push("x", this.secondaryProjectiles.toString())
		}
		if (this.fullAutoOnly) buffer.push("!")
		if (this.highCyclicControlledBursts) buffer.push("#")
		return buffer.toString()
	}

	override resolveValue(w: WeaponRangedData, tooltip: TooltipGURPS, firstMode: boolean): WeaponROFMode {
		const result = this.clone()
		let [shotsFeature, secondaryFeature] = firstMode
			? [feature.Type.WeaponRofMode1ShotsBonus, feature.Type.WeaponRofMode1SecondaryBonus]
			: [feature.Type.WeaponRofMode2ShotsBonus, feature.Type.WeaponRofMode2SecondaryBonus]

		if (firstMode) {
			this.fullAutoOnly = w.resolveBoolFlag(wswitch.Type.FullAuto1, this.fullAutoOnly)
			this.highCyclicControlledBursts = w.resolveBoolFlag(
				wswitch.Type.ControlledBursts1,
				this.highCyclicControlledBursts,
			)
		} else {
			this.fullAutoOnly = w.resolveBoolFlag(wswitch.Type.FullAuto2, this.fullAutoOnly)
			this.highCyclicControlledBursts = w.resolveBoolFlag(
				wswitch.Type.ControlledBursts2,
				this.highCyclicControlledBursts,
			)
		}
		let [percentSPA, percentSP] = [0, 0]
		for (const bonus of w.collectWeaponBonuses(1, tooltip, shotsFeature, secondaryFeature)) {
			const amt = bonus.adjustedAmountForWeapon(w)
			switch (bonus.type) {
				case shotsFeature:
					if (bonus.percent) percentSPA += amt
					else result.shotsPerAttack += amt
					break
				case secondaryFeature:
					if (bonus.percent) percentSP += amt
					else result.secondaryProjectiles += amt
			}
		}

		if (percentSPA !== 0) result.shotsPerAttack += Math.trunc((result.shotsPerAttack * percentSPA) / 100)
		if (percentSP !== 0) result.secondaryProjectiles += Math.trunc((result.secondaryProjectiles * percentSP) / 100)
		result.clean()
		return result
	}

	override clean(): void {
		this.shotsPerAttack = Math.max(Math.ceil(this.shotsPerAttack), 0)
		if (this.shotsPerAttack === 0) {
			this.secondaryProjectiles = 0
			this.fullAutoOnly = false
			this.highCyclicControlledBursts = false
			return
		}
		this.secondaryProjectiles = Math.max(Math.ceil(this.secondaryProjectiles), 0)
	}
}

interface WeaponROFMode
	extends WeaponField<WeaponRangedData, WeaponROFModeSchema>,
		ModelPropsFromSchema<WeaponROFModeSchema> {}

type WeaponROFModeSchema = {
	shotsPerAttack: fields.NumberField<number, number, true, false, true>
	secondaryProjectiles: fields.NumberField<number, number, true, false, true>
	fullAutoOnly: fields.BooleanField<boolean, boolean, true, false, true>
	highCyclicControlledBursts: fields.BooleanField<boolean, boolean, true, false, true>
}

export { WeaponROFMode, type WeaponROFModeSchema }
