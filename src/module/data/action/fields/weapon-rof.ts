import fields = foundry.data.fields
import { WeaponField } from "./weapon-field.ts"
import { TooltipGURPS, wswitch } from "@util"
import { WeaponROFMode } from "./weapon-rof-mode.ts"
import { ToggleableBooleanField } from "@module/data/fields/toggleable-boolean-field.ts"
import { BaseAttack } from "../base-attack.ts"

class WeaponROF extends WeaponField<BaseAttack, WeaponROFSchema> {
	static override defineSchema(): WeaponROFSchema {
		const fields = foundry.data.fields
		return {
			mode1: new fields.EmbeddedDataField(WeaponROFMode),
			mode2: new fields.EmbeddedDataField(WeaponROFMode),
			jet: new ToggleableBooleanField({ required: true, nullable: false, initial: false }),
		}
	}

	static override fromString(s: string): WeaponROF {
		const wr = new WeaponROF().toObject()
		s = s.replaceAll(" ", "").toLowerCase()
		if (s.includes("")) {
			wr.jet = true
		} else {
			const parts = s.split("/")
			wr.mode1 = WeaponROFMode.fromString(parts[0])
			if (parts.length > 1) {
				wr.mode2 = WeaponROFMode.fromString(parts[0])
			}
		}
		return new WeaponROF(wr)
	}

	override toString(): string {
		if (this.jet) return "Jet"
		const s1 = this.mode1.toString()
		const s2 = this.mode2.toString()
		if (s1 === "") return s2
		if (s2 !== "") {
			return s1 + "/" + s2
		}
		return s1
	}

	override tooltip(w: BaseAttack): string {
		if (this.jet) return ""
		const buffer = new TooltipGURPS()
		const t1 = this.mode1.tooltip(w)
		const t2 = this.mode2.tooltip(w)
		if (t1 !== "") {
			if (t2 !== "") buffer.push(game.i18n.localize("GURPS.Tooltip.ROFMode1"), "\n")
			buffer.push(t1)
		}
		if (t2 !== "") {
			if (t1 !== "") buffer.push(game.i18n.localize("GURPS.Tooltip.ROFMode2"), "\n")
			buffer.push(t2)
		}
		return buffer.toString()
	}

	override resolve(w: BaseAttack, tooltip: TooltipGURPS | null): WeaponROF {
		const result = this.clone()
		result.jet = w.resolveBoolFlag(wswitch.Type.Jet, result.jet)
		if (!result.jet) {
			const buf1 = new TooltipGURPS()
			const buf2 = new TooltipGURPS()
			result.mode1 = result.mode1.resolve(w, buf1, true)
			result.mode2 = result.mode2.resolve(w, buf2, false)
			if (tooltip !== null) {
				if (buf1.length !== 0) {
					if (buf2.length !== 0) {
						tooltip.push(game.i18n.localize("GURPS.Tooltip.ROFMode1"), "\n")
					}
					tooltip.push(buf1.toString())
				}
				if (buf2.length !== 0) {
					if (buf1.length !== 0) {
						tooltip.push("\n\n", game.i18n.localize("GURPS.Tooltip.ROFMode2"), "\n")
					}
					tooltip.push(buf2.toString())
				}
			}
		}
		return result
	}
}

interface WeaponROF extends WeaponField<BaseAttack, WeaponROFSchema>, ModelPropsFromSchema<WeaponROFSchema> {}

type WeaponROFSchema = {
	mode1: fields.EmbeddedDataField<WeaponROFMode>
	mode2: fields.EmbeddedDataField<WeaponROFMode>
	jet: ToggleableBooleanField<boolean, boolean, true, false, true>
}

export { WeaponROF, type WeaponROFSchema }
