import { WeaponField } from "./weapon-field.ts"
import fields = foundry.data.fields
import { AbstractWeaponTemplate } from "../templates/abstract-weapon.ts"
import { Int, StringBuilder, TooltipGURPS, feature, wswitch } from "@util"
import { ToggleableBooleanField, ToggleableNumberField } from "@module/data/fields/index.ts"

class WeaponStrength extends WeaponField<AbstractWeaponTemplate, WeaponStrengthSchema> {
	static override defineSchema(): WeaponStrengthSchema {
		return {
			min: new ToggleableNumberField({
				required: true,
				nullable: false,
				min: 0,
				initial: 0,
			}),
			bipod: new ToggleableBooleanField({ required: true, nullable: false, initial: false }),
			mounted: new ToggleableBooleanField({ required: true, nullable: false, initial: false }),
			musketRest: new ToggleableBooleanField({ required: true, nullable: false, initial: false }),
			twoHanded: new ToggleableBooleanField({ required: true, nullable: false, initial: false }),
			twoHandedUnready: new ToggleableBooleanField({ required: true, nullable: false, initial: false }),
		}
	}

	static override fromString(s: string): WeaponStrength {
		const ws = new WeaponStrength().toObject()
		s = s.replaceAll(" ", "")
		if (s !== "") {
			s = s.toLowerCase()
			ws.bipod = s.includes("b")
			ws.mounted = s.includes("m")
			ws.musketRest = s.includes("r")
			ws.twoHanded = s.includes("†") || s.includes("*")
			ws.twoHandedUnready = s.includes("‡")
			;[ws.min] = Int.extract(s)
		}
		return new WeaponStrength(ws)
	}

	override toString(): string {
		const buffer = new StringBuilder()
		if (this.min > 0) buffer.push(this.min.toString())
		if (this.bipod) buffer.push("B")
		if (this.mounted) buffer.push("B")
		if (this.musketRest) buffer.push("B")
		if (this.twoHanded || this.twoHandedUnready) {
			if (this.twoHandedUnready) buffer.push("‡")
			else buffer.push("†")
		}
		return buffer.toString()
	}

	override tooltip(w: AbstractWeaponTemplate): string {
		const tooltip = new TooltipGURPS()
		if (w.parent.container !== null && !(w.parent.container instanceof Promise)) {
			const st = w.parent.container.system.ratedStrength
			if (st > 0) {
				tooltip.push(game.i18n.format("GURPS.Tooltip.StrengthRated", { st }))
			}
		}
		if (this.min > 0) {
			if (tooltip.length !== 0) tooltip.push("\n\n")
			tooltip.push(game.i18n.format("GURPS.Tooltip.StrengthMinimum", { min: this.min }))
		}

		if (this.bipod) {
			if (tooltip.length !== 0) tooltip.push("\n\n")
			const reducedST = Math.ceil((this.min * 2) / 3)
			if (reducedST > 0 && reducedST !== this.min) {
				tooltip.push(
					game.i18n.format(game.i18n.localize("GURPS.Tooltip.StrengthBipodReducedST"), {
						st: reducedST,
					}),
				)
			} else {
				tooltip.push(game.i18n.localize("GURPS.Tooltip.StrengthBipodNoReducedST"))
			}
		}

		if (this.mounted) {
			if (tooltip.length !== 0) tooltip.push("\n\n")
			tooltip.push(game.i18n.localize("GURPS.Tooltip.StrengthMounted"))
		}

		if (this.musketRest) {
			if (tooltip.length !== 0) tooltip.push("\n\n")
			tooltip.push(game.i18n.localize("GURPS.Tooltip.StrengthMusketRest"))
		}

		if (this.twoHanded || this.twoHandedUnready) {
			if (tooltip.length !== 0) tooltip.push("\n\n")
			if (this.twoHandedUnready)
				tooltip.push(
					game.i18n.format("GURPS.Tooltip.StrengthTwoHandedUnready", {
						st15: this.min * 1.5,
						st3: this.min * 3,
					}),
				)
			else
				tooltip.push(
					game.i18n.format("GURPS.Tooltip.StrengthTwoHanded", {
						st15: this.min * 1.5,
						st2: this.min * 2,
					}),
				)
		}
		return tooltip.toString()
	}

	override resolve(w: AbstractWeaponTemplate, tooltip: TooltipGURPS | null): WeaponStrength {
		const result = this.toObject()
		result.bipod = w.resolveBoolFlag(wswitch.Type.Bipod, result.bipod)
		result.mounted = w.resolveBoolFlag(wswitch.Type.Mounted, result.mounted)
		result.musketRest = w.resolveBoolFlag(wswitch.Type.MusketRest, result.musketRest)
		result.twoHanded = w.resolveBoolFlag(wswitch.Type.TwoHanded, result.twoHanded)
		result.twoHandedUnready = w.resolveBoolFlag(wswitch.Type.TwoHandedUnready, result.twoHandedUnready)
		let percentMin = 0
		for (const bonus of w.collectWeaponBonuses(1, tooltip, feature.Type.WeaponMinSTBonus)) {
			const amt = bonus.adjustedAmountForWeapon(w)
			if (bonus.percent) percentMin += amt
			else result.min += amt
		}
		if (percentMin !== 0) {
			result.min += Int.from((result.min * percentMin) / 100)
		}
		return new WeaponStrength(result)
	}

	static override cleanData(
		source?: object | undefined,
		options?: Record<string, unknown> | undefined,
	): SourceFromSchema<fields.DataSchema> {
		let { min, twoHanded, twoHandedUnready }: Partial<SourceFromSchema<WeaponStrengthSchema>> = {
			min: 0,
			twoHanded: false,
			twoHandedUnready: false,
			...source,
		}

		min = Math.max(min, 0)
		if (twoHandedUnready && twoHandedUnready) twoHanded = false
		return super.cleanData({ ...source, min, twoHanded, twoHandedUnready }, options)
	}
}

interface WeaponStrength
	extends WeaponField<AbstractWeaponTemplate, WeaponStrengthSchema>,
		ModelPropsFromSchema<WeaponStrengthSchema> {}

type WeaponStrengthSchema = {
	min: ToggleableNumberField<number, number, true, false, true>
	bipod: ToggleableBooleanField<boolean, boolean, true, false, true>
	mounted: ToggleableBooleanField<boolean, boolean, true, false, true>
	musketRest: ToggleableBooleanField<boolean, boolean, true, false, true>
	twoHanded: ToggleableBooleanField<boolean, boolean, true, false, true>
	twoHandedUnready: ToggleableBooleanField<boolean, boolean, true, false, true>
}

export { WeaponStrength, type WeaponStrengthSchema }
