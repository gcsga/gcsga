import { ItemDataModel } from "../abstract.ts"
import fields = foundry.data.fields
import {
	AbstractWeaponTemplate,
	AbstractWeaponTemplateSchema,
	BasicInformationTemplate,
	BasicInformationTemplateSchema,
} from "./templates/index.ts"
import { WeaponRange } from "./fields/weapon-range.ts"
import { WeaponAccuracy } from "./fields/weapon-accuracy.ts"
import { WeaponROF } from "./fields/weapon-rof.ts"
import { WeaponShots } from "./fields/weapon-shots.ts"
import { WeaponBulk } from "./fields/weapon-bulk.ts"
import { WeaponRecoil } from "./fields/weapon-recoil.ts"
import { LocalizeGURPS, TooltipGURPS } from "@util"
import { CellData } from "./components/cell-data.ts"
import { Nameable } from "@module/util/index.ts"

class WeaponRangedData extends ItemDataModel.mixin(BasicInformationTemplate, AbstractWeaponTemplate) {
	override async getSheetData(context: Record<string, unknown>): Promise<void> {
		context.detailsParts = ["gurps.details-weapon-ranged", "gurps.details-defaults"]
	}
	static override defineSchema(): WeaponRangedSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			accuracy: new fields.EmbeddedDataField(WeaponAccuracy),
			range: new fields.EmbeddedDataField(WeaponRange),
			rate_of_fire: new fields.EmbeddedDataField(WeaponROF),
			shots: new fields.EmbeddedDataField(WeaponShots),
			bulk: new fields.EmbeddedDataField(WeaponBulk),
			recoil: new fields.EmbeddedDataField(WeaponRecoil),
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

		const buffer = new TooltipGURPS()
		const level = this.skillLevel(buffer).toString()
		const levelTooltip = addBuffer("", buffer)

		buffer.clear()
		const damage = this.damage.resolve(this, buffer)
		const damageTooltip = addBuffer("", buffer)

		buffer.clear()
		const accuracy = this.accuracy.resolve(this, buffer)
		const accuracyTooltip = addBuffer(accuracy.tooltip(this), buffer)

		buffer.clear()
		const range = this.range.resolve(this, buffer)
		const rangeTooltip = addBuffer(range.tooltip(this), buffer)

		buffer.clear()
		const rateOfFire = this.rate_of_fire.resolve(this, buffer)
		const rateOfFireTooltip = addBuffer(rateOfFire.tooltip(this), buffer)

		buffer.clear()
		const shots = this.shots.resolve(this, buffer)
		const shotsTooltip = addBuffer(shots.tooltip(this), buffer)

		buffer.clear()
		const bulk = this.bulk.resolve(this, buffer)
		const bulkTooltip = addBuffer(bulk.tooltip(this), buffer)

		buffer.clear()
		const recoil = this.recoil.resolve(this, buffer)
		const recoilTooltip = addBuffer(recoil.tooltip(this), buffer)

		buffer.clear()
		const strength = this.strength.resolve(this, buffer)
		const strengthTooltip = addBuffer(strength.tooltip(this), buffer)

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

interface WeaponRangedData extends ModelPropsFromSchema<WeaponRangedSchema> {}

type WeaponRangedSchema = BasicInformationTemplateSchema &
	AbstractWeaponTemplateSchema & {
		accuracy: fields.EmbeddedDataField<WeaponAccuracy>
		range: fields.EmbeddedDataField<WeaponRange>
		rate_of_fire: fields.EmbeddedDataField<WeaponROF>
		shots: fields.EmbeddedDataField<WeaponShots>
		bulk: fields.EmbeddedDataField<WeaponBulk>
		recoil: fields.EmbeddedDataField<WeaponRecoil>
	}

export { WeaponRangedData, type WeaponRangedSchema }
