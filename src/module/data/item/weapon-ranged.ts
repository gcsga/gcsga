import { ItemDataModel } from "./abstract.ts"
import fields = foundry.data.fields
import {
	AbstractWeaponTemplate,
	AbstractWeaponTemplateSchema,
	BasicInformationTemplate,
	BasicInformationTemplateSchema,
	SkillDefaultTemplate,
	SkillDefaultTemplateSchema,
} from "./templates/index.ts"
import { WeaponRange } from "./fields/weapon-range.ts"
import { WeaponAccuracy } from "./fields/weapon-accuracy.ts"
import { WeaponROF } from "./fields/weapon-rof.ts"
import { WeaponShots } from "./fields/weapon-shots.ts"
import { WeaponBulk } from "./fields/weapon-bulk.ts"
import { WeaponRecoil } from "./fields/weapon-recoil.ts"
import { LocalizeGURPS, TooltipGURPS } from "@util"
import { CellData, CellDataOptions } from "./components/cell-data.ts"
import { Nameable } from "@module/util/nameable.ts"

class WeaponRangedData extends ItemDataModel.mixin(
	BasicInformationTemplate,
	AbstractWeaponTemplate,
	SkillDefaultTemplate,
) {
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

	override cellData(_options: { hash: CellDataOptions } = { hash: {} }): Record<string, CellData> {
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
		const damage = this.damage.resolvedValue(buffer)
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
				classList: ["item-name"],
			}),
			usage: new CellData({
				primary: this.usageWithReplacements,
				classList: ["item-usage"],
			}),
			level: new CellData({ primary: level, tooltip: levelTooltip, classList: ["item-skill-level"] }),
			damage: new CellData({ primary: damage.toString(), tooltip: damageTooltip, classList: ["item-damage"] }),
			accuracy: new CellData({
				primary: accuracy.toString(),
				tooltip: accuracyTooltip,
				classList: ["item-accuracy"],
			}),
			// TODO: revise
			range: new CellData({ primary: range.toString(true), tooltip: rangeTooltip, classList: ["item-range"] }),
			rateOfFire: new CellData({
				primary: rateOfFire.toString(),
				tooltip: rateOfFireTooltip,
				classList: ["item-rof"],
			}),
			shots: new CellData({ primary: shots.toString(), tooltip: shotsTooltip, classList: ["item-shots"] }),
			bulk: new CellData({
				primary: bulk.toString(),
				tooltip: bulkTooltip,
				classList: ["item-bulk"],
			}),
			recoil: new CellData({
				primary: recoil.toString(),
				tooltip: recoilTooltip,
				classList: ["item-recoil"],
			}),
			strength: new CellData({
				primary: strength.toString(),
				tooltip: strengthTooltip,
				classList: ["item-strength"],
			}),
		}

		return data
	}

	/** Nameables */
	fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void {
		Nameable.extract(this.parent.name, m, existing)
		Nameable.extract(this.notes, m, existing)

		this._fillWithNameableKeysFromDefaults(m, existing)
	}
}

interface WeaponRangedData extends ModelPropsFromSchema<WeaponRangedSchema> {}

type WeaponRangedSchema = BasicInformationTemplateSchema &
	AbstractWeaponTemplateSchema &
	SkillDefaultTemplateSchema & {
		accuracy: fields.EmbeddedDataField<WeaponAccuracy>
		range: fields.EmbeddedDataField<WeaponRange>
		rate_of_fire: fields.EmbeddedDataField<WeaponROF>
		shots: fields.EmbeddedDataField<WeaponShots>
		bulk: fields.EmbeddedDataField<WeaponBulk>
		recoil: fields.EmbeddedDataField<WeaponRecoil>
	}

export { WeaponRangedData, type WeaponRangedSchema }
