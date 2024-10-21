import { ItemDataModel } from "./abstract.ts"
import fields = foundry.data.fields
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { AbstractWeaponTemplate, AbstractWeaponTemplateSchema } from "./templates/abstract-weapon.ts"
import { WeaponParry } from "./fields/weapon-parry.ts"
import { WeaponReach } from "./fields/weapon-reach.ts"
import { WeaponBlock } from "./fields/weapon-block.ts"
import { CellData, CellDataOptions } from "./components/cell-data.ts"
import { LocalizeGURPS, TooltipGURPS } from "@util"
import { SkillDefaultTemplate, SkillDefaultTemplateSchema } from "./templates/defaults.ts"
import { Nameable } from "@module/util/nameable.ts"

class WeaponMeleeData extends ItemDataModel.mixin(
	BasicInformationTemplate,
	AbstractWeaponTemplate,
	SkillDefaultTemplate,
) {
	override async getSheetData(context: Record<string, unknown>): Promise<void> {
		context.detailsParts = ["gurps.details-weapon-melee", "gurps.details-defaults"]
	}

	static override defineSchema(): WeaponMeleeSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			reach: new fields.EmbeddedDataField(WeaponReach),
			parry: new fields.EmbeddedDataField(WeaponParry),
			block: new fields.EmbeddedDataField(WeaponBlock),
		}) as WeaponMeleeSchema
	}

	override cellData(_options: CellDataOptions = {}): Record<string, CellData> {
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
		const parry = this.parry.resolve(this, buffer)
		const parryTooltip = addBuffer(parry.tooltip(this), buffer)

		buffer.clear()
		const block = this.block.resolve(this, buffer)
		const blockTooltip = addBuffer("", buffer)

		buffer.clear()
		const damage = this.damage.resolvedValue(buffer)
		const damageTooltip = addBuffer("", buffer)

		buffer.clear()
		const reach = this.reach.resolve(this, buffer)
		const reachTooltip = addBuffer(reach.tooltip(this), buffer)

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
			damage: new CellData({
				primary: damage.toString(),
				tooltip: damageTooltip,

				classList: ["item-damage"],
			}),
			parry: new CellData({
				primary: parry.toString(),
				tooltip: parryTooltip,

				classList: ["item-parry"],
			}),
			block: new CellData({ primary: block.toString(), tooltip: blockTooltip, classList: ["item-block"] }),
			reach: new CellData({
				primary: reach.toString(),
				tooltip: reachTooltip,

				classList: ["item-reach"],
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

interface WeaponMeleeData extends ModelPropsFromSchema<WeaponMeleeSchema> {}

type WeaponMeleeSchema = BasicInformationTemplateSchema &
	AbstractWeaponTemplateSchema &
	SkillDefaultTemplateSchema & {
		reach: fields.EmbeddedDataField<WeaponReach>
		parry: fields.EmbeddedDataField<WeaponParry>
		block: fields.EmbeddedDataField<WeaponBlock>
	}

export { WeaponMeleeData, type WeaponMeleeSchema }
