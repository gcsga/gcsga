import { gid, ItemType } from "@module/data"
import { TooltipGURPS } from "@module/tooltip"
import { LocalizeGURPS } from "@util"
import { LeveledAmount } from "@util/leveled_amount"
import { BaseFeature } from "./base"
import { FeatureType } from "./data"

export class DRBonus extends BaseFeature {
	location!: string

	specialization?: string

	static get defaults(): Record<string, any> {
		return mergeObject(super.defaults, {
			type: FeatureType.DRBonus,
			location: gid.Torso,
			specialization: gid.All,
		})
	}

	addToTooltip(buffer: TooltipGURPS | null): void {
		if (buffer !== null) {
			let item: any | null | undefined = this.item
			if (item?.actor)
				while (
					[
						ItemType.TraitModifier,
						ItemType.TraitModifierContainer,
						ItemType.EquipmentModifier,
						ItemType.EquipmentModifierContainer,
					].includes(item?.type as any)
				) {
					if (item?.container instanceof Item) item = item?.container
				}
			if (this.per_level)
				buffer.push(
					LocalizeGURPS.format(LocalizeGURPS.translations.gurps.tooltip.dr_bonus_leveled, {
						item: item?.name || "",
						bonus: new LeveledAmount({
							level: this.levels,
							amount: this.amount,
							per_level: this.per_level,
						}).adjustedAmount.signedString(),
						per_level: this.amount.signedString(),
						type: this.specialization || "",
					})
				)
			else
				buffer.push(
					LocalizeGURPS.format(LocalizeGURPS.translations.gurps.tooltip.dr_bonus, {
						item: item?.name || "",
						bonus: this.amount.signedString(),
						type: this.specialization || "",
					})
				)
			buffer.push("<br>")
		}
	}
}
