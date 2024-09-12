import { ItemDataModel } from "../abstract.ts"
import fields = foundry.data.fields
import { Nameable } from "@module/util/nameable.ts"
import { SkillDefault } from "@system"
import {
	AbstractWeaponTemplate,
	AbstractWeaponTemplateSchema,
	BasicInformationTemplate,
	BasicInformationTemplateSchema,
} from "./templates/index.ts"
import { WeaponDamage } from "./fields/weapon-damage.ts"
import { WeaponStrength } from "./fields/weapon-strength.ts"
import { WeaponRange, WeaponRangeSchema } from "./fields/weapon-range.ts"
import { WeaponAccuracy, WeaponAccuracySchema } from "./fields/weapon-accuracy.ts"
import { WeaponROF, WeaponROFSchema } from "./fields/weapon-rof.ts"
import { WeaponShots, WeaponShotsSchema } from "./fields/weapon-shots.ts"
import { WeaponBulk, WeaponBulkSchema } from "./fields/weapon-bulk.ts"
import { WeaponRecoil, WeaponRecoilSchema } from "./fields/weapon-recoil.ts"
import { LocalizeGURPS, TooltipGURPS } from "@util"
import { CellData } from "./fields/cell-data.ts"

class WeaponRangedData extends ItemDataModel.mixin(BasicInformationTemplate, AbstractWeaponTemplate) {
	static override defineSchema(): WeaponRangedSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			accuracy: new fields.SchemaField(WeaponAccuracy.defineSchema()),
			range: new fields.SchemaField(WeaponRange.defineSchema()),
			rate_of_fire: new fields.SchemaField(WeaponROF.defineSchema()),
			shots: new fields.SchemaField(WeaponShots.defineSchema()),
			bulk: new fields.SchemaField(WeaponBulk.defineSchema()),
			recoil: new fields.SchemaField(WeaponRecoil.defineSchema()),
		}) as WeaponRangedSchema
	}

	override get cellData(): Record<string, CellData> {
		function addBuffer(tooltip: string, buffer: TooltipGURPS): string {
			if (tooltip.length !== 0) {
				tooltip += "\n\n"
			}
			tooltip += LocalizeGURPS.translations.GURPS.Tooltip.IncludesModifiersFrom + ":"
			tooltip += buffer.toString()
			return tooltip
		}

		let buffer = new TooltipGURPS()
		const level = this.skillLevel(buffer).toString()
		let levelTooltip = addBuffer("", buffer)

		buffer.clear()
		const damage = this.damage.resolveValue(this, buffer)
		let damageTooltip = addBuffer("", buffer)

		buffer.clear()
		const accuracy = this.accuracy.resolveValue(this, buffer)
		let accuracyTooltip = addBuffer(accuracy.tooltip(this), buffer)

		buffer.clear()
		const range = this.range.resolveValue(this, buffer)
		let rangeTooltip = addBuffer(range.tooltip(this), buffer)

		buffer.clear()
		const rateOfFire = this.rate_of_fire.resolveValue(this, buffer)
		let rateOfFireTooltip = addBuffer(rateOfFire.tooltip(this), buffer)

		buffer.clear()
		const shots = this.shots.resolveValue(this, buffer)
		let shotsTooltip = addBuffer(shots.tooltip(this), buffer)

		buffer.clear()
		const bulk = this.bulk.resolveValue(this, buffer)
		let bulkTooltip = addBuffer(bulk.tooltip(this), buffer)

		buffer.clear()
		const recoil = this.recoil.resolveValue(this, buffer)
		let recoilTooltip = addBuffer(recoil.tooltip(this), buffer)

		buffer.clear()
		const strength = this.strength.resolveValue(this, buffer)
		let strengthTooltip = addBuffer(strength.tooltip(this), buffer)

		const data: Record<string, CellData> = {
			name: new CellData({
				primary: this.processedName,
				secondary: this.processedNotes,
			}),
			usage: new CellData({
				primary: this.usageWithReplacements,
			}),
			level: new CellData({ primary: level, tooltip: levelTooltip }),
			damage: new CellData({ primary: damage, tooltip: damageTooltip }),
			accuracy: new CellData({ primary: accuracy, tooltip: accuracyTooltip }),
			range: new CellData({ primary: range, tooltip: rangeTooltip }),
			rateOfFire: new CellData({ primary: rateOfFire, tooltip: rateOfFireTooltip }),
			shots: new CellData({ primary: shots, tooltip: shotsTooltip }),
			bulk: new CellData({ primary: bulk, tooltip: bulkTooltip }),
			recoil: new CellData({ primary: recoil, tooltip: recoilTooltip }),
			strength: new CellData({ primary: strength, tooltip: strengthTooltip }),
		}

		return data
	}

	fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void {
		Nameable.extract(this.name, m, existing)
		Nameable.extract(this.notes, m, existing)
	}
}

interface WeaponRangedData
	extends Omit<
		ModelPropsFromSchema<WeaponRangedSchema>,
		"defaults" | "strength" | "damage" | "accuracy" | "range" | "rate_of_fire" | "shots" | "bulk" | "recoil"
	> {
	defaults: SkillDefault[]
	strength: WeaponStrength
	damage: WeaponDamage
	accuracy: WeaponAccuracy
	range: WeaponRange
	rate_of_fire: WeaponROF
	shots: WeaponShots
	bulk: WeaponBulk
	recoil: WeaponRecoil
}

type WeaponRangedSchema = BasicInformationTemplateSchema &
	AbstractWeaponTemplateSchema & {
		accuracy: fields.SchemaField<WeaponAccuracySchema>
		range: fields.SchemaField<WeaponRangeSchema>
		rate_of_fire: fields.SchemaField<WeaponROFSchema>
		shots: fields.SchemaField<WeaponShotsSchema>
		bulk: fields.SchemaField<WeaponBulkSchema>
		recoil: fields.SchemaField<WeaponRecoilSchema>
	}

export { WeaponRangedData, type WeaponRangedSchema }
