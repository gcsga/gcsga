import { ItemDataModel } from "../abstract.ts"
import fields = foundry.data.fields
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { AbstractWeaponTemplate, AbstractWeaponTemplateSchema } from "./templates/abstract-weapon.ts"
import { WeaponParry } from "./fields/weapon-parry.ts"
import { WeaponReach } from "./fields/weapon-reach.ts"
import { WeaponBlock } from "./fields/weapon-block.ts"
import { CellData } from "./components/cell-data.ts"
import { LocalizeGURPS, TooltipGURPS } from "@util"
import { Nameable } from "@module/util/index.ts"

class WeaponMeleeData extends ItemDataModel.mixin(BasicInformationTemplate, AbstractWeaponTemplate) {
	static override defineSchema(): WeaponMeleeSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			reach: new fields.EmbeddedDataField(WeaponReach),
			parry: new fields.EmbeddedDataField(WeaponParry),
			block: new fields.EmbeddedDataField(WeaponBlock),
		}) as WeaponMeleeSchema
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
		const parry = this.parry.resolve(this, buffer)
		const parryTooltip = addBuffer(parry.tooltip(this), buffer)

		buffer.clear()
		const block = this.block.resolve(this, buffer)
		const blockTooltip = addBuffer("", buffer)

		buffer.clear()
		const damage = this.damage.resolve(this, buffer)
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
			}),
			usage: new CellData({
				primary: this.usageWithReplacements,
			}),
			level: new CellData({ primary: level, tooltip: levelTooltip }),
			damage: new CellData({ primary: damage, tooltip: damageTooltip }),
			parry: new CellData({ primary: parry, tooltip: parryTooltip }),
			block: new CellData({ primary: block, tooltip: blockTooltip }),
			reach: new CellData({ primary: reach, tooltip: reachTooltip }),
			strength: new CellData({ primary: strength, tooltip: strengthTooltip }),
		}

		return data
	}

	fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void {
		Nameable.extract(this.name, m, existing)
		Nameable.extract(this.notes, m, existing)
	}
}

interface WeaponMeleeData extends ModelPropsFromSchema<WeaponMeleeSchema> {}

type WeaponMeleeSchema = BasicInformationTemplateSchema &
	AbstractWeaponTemplateSchema & {
		reach: fields.EmbeddedDataField<WeaponReach>
		parry: fields.EmbeddedDataField<WeaponParry>
		block: fields.EmbeddedDataField<WeaponBlock>
	}

export { WeaponMeleeData, type WeaponMeleeSchema }
