import { LocalizeGURPS } from "@util/localize.ts"
import { TooltipGURPS, feature } from "@util"
import { gid } from "@module/data/constants.ts"
import { DRBonusSchema } from "./data.ts"
import { BaseFeature } from "./base.ts"
import { equalFold } from "@module/util/index.ts"

class DRBonus extends BaseFeature<DRBonusSchema> {
	static override defineSchema(): DRBonusSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			// ...LeveledAmount.defineSchema(),
			type: new fields.StringField({
				required: true,
				nullable: false,
				blank: false,
				initial: feature.Type.DRBonus,
			}),
			locations: new fields.ArrayField(new fields.StringField(), { initial: [gid.Torso] }),
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
					// level: this.leveledAmount.format(false),
					level: this.format(false),
					type: this.specialization ?? gid.All,
				}),
			)
		}
	}

	private _normalize(): void {
		for (const [index, location] of this.locations.entries()) {
			const newLocation = location.trim()
			if (equalFold(newLocation, gid.All)) {
				this.locations = [gid.All]
				break
			}
			this.locations[index] = location
		}
		let s = this.specialization?.trim() ?? ""
		if (s === "" || equalFold(s, gid.All)) s = gid.All
		this.specialization = s
	}

	fillWithNameableKeys(_m: Map<string, string>, _existing: Map<string, string>): void {}
}

interface DRBonus extends BaseFeature<DRBonusSchema>, ModelPropsFromSchema<DRBonusSchema> {}

export { DRBonus }
