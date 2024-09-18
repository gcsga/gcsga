import fields = foundry.data.fields
import { Int, LocalizeGURPS, StringBuilder, TooltipGURPS, feature, wswitch } from "@util"
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
		const wr = new WeaponROFMode().toObject()
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
		return new WeaponROFMode(wr)
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

	// Tooltip returns a tooltip for the data, if any. Call .resolve() prior to calling this method if you want the tooltip
	// to be based on the resolved values.
	override tooltip(_w: WeaponRangedData): string {
		if (
			this.shotsPerAttack <= 0 ||
			(this.secondaryProjectiles <= 0 && !this.fullAutoOnly && !this.highCyclicControlledBursts)
		)
			return ""
		const tooltip = new TooltipGURPS()
		if (this.secondaryProjectiles > 0) {
			const shotsText =
				this.shotsPerAttack === 1
					? LocalizeGURPS.translations.GURPS.Weapon.ShotsSingular
					: LocalizeGURPS.translations.GURPS.Weapon.ShotsPlural

			const projectilesText =
				this.secondaryProjectiles === 1
					? LocalizeGURPS.translations.GURPS.Weapon.ProjectilesSingular
					: LocalizeGURPS.translations.GURPS.Weapon.ProjectilesPlural

			tooltip.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Tooltip.ROFModeSecondaryProjectiles, {
					shotsCount: this.shotsPerAttack,
					shotsText,
					projectilesCount: this.secondaryProjectiles,
					projectilesText,
				}),
			)
		}

		if (this.fullAutoOnly)
			tooltip.appendToNewLine(
				LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Tooltip.ROFModeFullAutoOnly, {
					min: Math.ceil(this.shotsPerAttack / 4),
				}),
			)

		if (this.highCyclicControlledBursts)
			tooltip.appendToNewLine(LocalizeGURPS.translations.GURPS.Tooltip.ROFModeHighCyclicControlledBursts)

		return tooltip.toString()
	}

	override resolve(w: WeaponRangedData, tooltip: TooltipGURPS, firstMode: boolean): WeaponROFMode {
		const result = this.toObject()
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
		return new WeaponROFMode(result)
	}

	static override cleanData(
		source?: object | undefined,
		options?: Record<string, unknown> | undefined,
	): SourceFromSchema<fields.DataSchema> {
		let {
			shotsPerAttack,
			secondaryProjectiles,
			fullAutoOnly,
			highCyclicControlledBursts,
		}: Partial<SourceFromSchema<WeaponROFModeSchema>> = {
			shotsPerAttack: 0,
			secondaryProjectiles: 0,
			fullAutoOnly: false,
			highCyclicControlledBursts: false,
			...source,
		}

		shotsPerAttack = Math.max(Math.ceil(shotsPerAttack), 0)
		if (shotsPerAttack === 0) {
			secondaryProjectiles = 0
			fullAutoOnly = false
			highCyclicControlledBursts = false
			return super.cleanData(
				{ ...source, shotsPerAttack, secondaryProjectiles, fullAutoOnly, highCyclicControlledBursts },
				options,
			)
		}
		secondaryProjectiles = Math.max(Math.ceil(secondaryProjectiles), 0)

		return super.cleanData(
			{ ...source, shotsPerAttack, secondaryProjectiles, fullAutoOnly, highCyclicControlledBursts },
			options,
		)
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
