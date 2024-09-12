import fields = foundry.data.fields
import { WeaponField } from "./weapon-field.ts"
import { LocalizeGURPS, TooltipGURPS, wswitch } from "@util"
import { WeaponRangedData } from "../weapon-ranged.ts"
import { WeaponROFMode, type WeaponROFModeSchema } from "./weapon-rof-mode.ts"

class WeaponROF extends WeaponField<WeaponRangedData, WeaponROFSchema> {
	static override defineSchema(): WeaponROFSchema {
		const fields = foundry.data.fields
		return {
			mode1: new fields.SchemaField(WeaponROFMode.defineSchema()),
			mode2: new fields.SchemaField(WeaponROFMode.defineSchema()),
			jet: new fields.BooleanField<boolean>({ required: true, nullable: false, initial: false }),
		}
	}

	static override fromString(s: string): WeaponROF {
		const wr = new WeaponROF({})
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
		wr.clean()
		return wr
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

	override resolveValue(w: WeaponRangedData, tooltip: TooltipGURPS | null): WeaponROF {
		const result = this.clone()
		result.jet = w.resolveBoolFlag(wswitch.Type.Jet, result.jet)
		if (!result.jet) {
			const buf1 = new TooltipGURPS()
			const buf2 = new TooltipGURPS()
			result.mode1 = result.mode1.resolveValue(w, buf1, true)
			result.mode2 = result.mode2.resolveValue(w, buf2, false)
			if (tooltip !== null) {
				if (buf1.length !== 0) {
					if (buf2.length !== 0) {
						tooltip.push(LocalizeGURPS.translations.GURPS.Tooltip.ROFMode1, "\n")
					}
					tooltip.push(buf1.toString())
				}
				if (buf2.length !== 0) {
					if (buf1.length !== 0) {
						tooltip.push("\n\n", LocalizeGURPS.translations.GURPS.Tooltip.ROFMode2, "\n")
					}
					tooltip.push(buf2.toString())
				}
			}
		}
		result.clean()
		return result
	}

	override clean(): void {
		if (this.jet) {
			this.mode1 = new WeaponROFMode()
			this.mode2 = new WeaponROFMode()
			return
		}
		this.mode1.clean()
		this.mode2.clean()
	}
}

interface WeaponROF
	extends WeaponField<WeaponRangedData, WeaponROFSchema>,
		Omit<ModelPropsFromSchema<WeaponROFSchema>, "mode1" | "mode2"> {
	mode1: WeaponROFMode
	mode2: WeaponROFMode
}

type WeaponROFSchema = {
	mode1: fields.SchemaField<WeaponROFModeSchema>
	mode2: fields.SchemaField<WeaponROFModeSchema>
	jet: fields.BooleanField<boolean, boolean, true, false, true>
}

export { WeaponROF, type WeaponROFSchema }
