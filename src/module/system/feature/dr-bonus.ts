import { LocalizeGURPS } from "@util/localize.ts"
import { TooltipGURPS } from "@util"
import { gid } from "@module/data/constants.ts"
import { DRBonusSchema } from "./data.ts"
import { BaseFeature, LeveledAmount } from "./base.ts"
import { equalFold } from "@module/util/index.ts"

class DRBonus extends BaseFeature<DRBonusSchema> {
	static override defineSchema(): DRBonusSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			...LeveledAmount.defineSchema(),
			location: new fields.StringField({ initial: gid.Torso }),
			specialization: new fields.StringField({ initial: gid.All }),
		}
	}

	override addToTooltip(tooltip: TooltipGURPS | null): void {
		if (tooltip !== null) {
			this._normalize()
			tooltip.push("\n")
			tooltip.push(this.parentName)
			tooltip.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.feature.dr_bonus, {
					level: this.leveledAmount.format(false),
					type: this.specialization ?? gid.All,
				}),
			)
		}
	}

	private _normalize(): void {
		let s = this.location.trim()
		if (equalFold(s, gid.All)) s = gid.All
		this.location = s
		s = this.specialization?.trim() ?? ""
		if (s === "" || equalFold(s, gid.All)) s = gid.All
		this.specialization = s
	}
}

interface DRBonus extends BaseFeature<DRBonusSchema>, ModelPropsFromSchema<DRBonusSchema> {}

export { DRBonus }
