import { ItemDataModel } from "../abstract.ts"
import fields = foundry.data.fields
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { AbstractWeaponTemplate, AbstractWeaponTemplateSchema } from "./templates/abstract-weapon.ts"
import { Nameable } from "@module/util/nameable.ts"
import { WeaponParry, WeaponParrySchema } from "./fields/weapon-parry.ts"
import { WeaponReach, WeaponReachSchema } from "./fields/weapon-reach.ts"
import { WeaponBlock, WeaponBlockSchema } from "./fields/weapon-block.ts"
import { CellData } from "./fields/cell-data.ts"
import { LocalizeGURPS, TooltipGURPS } from "@util"

class WeaponMeleeData extends ItemDataModel.mixin(BasicInformationTemplate, AbstractWeaponTemplate) {
	static override defineSchema(): WeaponMeleeSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			reach: new fields.SchemaField(WeaponReach.defineSchema()),
			parry: new fields.SchemaField(WeaponParry.defineSchema()),
			block: new fields.SchemaField(WeaponBlock.defineSchema()),
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

		let buffer = new TooltipGURPS()
		const level = this.skillLevel(buffer).toString()
		let levelTooltip = addBuffer("", buffer)

		buffer.clear()
		const parry = this.parry.resolve(this, buffer)
		let parryTooltip = addBuffer(parry.tooltip(this), buffer)

		buffer.clear()
		const block = this.block.resolve(this, buffer)
		let blockTooltip = addBuffer("", buffer)

		buffer.clear()
		const damage = this.damage.resolve(this, buffer)
		let damageTooltip = addBuffer("", buffer)

		buffer.clear()
		const reach = this.reach.resolve(this, buffer)
		let reachTooltip = addBuffer(reach.tooltip(this), buffer)

		buffer.clear()
		const strength = this.strength.resolve(this, buffer)
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
		reach: fields.SchemaField<WeaponReachSchema, SourceFromSchema<WeaponReachSchema>, WeaponReach>
		parry: fields.SchemaField<WeaponParrySchema, SourceFromSchema<WeaponParrySchema>, WeaponParry>
		block: fields.SchemaField<WeaponBlockSchema, SourceFromSchema<WeaponBlockSchema>, WeaponBlock>
	}

export { WeaponMeleeData, type WeaponMeleeSchema }
