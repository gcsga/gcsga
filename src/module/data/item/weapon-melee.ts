import { ItemDataModel } from "../abstract.ts"
import fields = foundry.data.fields
import { BasicInformationTemplate, BasicInformationTemplateSchema } from "./templates/basic-information.ts"
import { AbstractWeaponTemplate, AbstractWeaponTemplateSchema } from "./templates/abstract-weapon.ts"
import { Nameable } from "@module/util/nameable.ts"
import { SkillDefault } from "@system"
import { WeaponParry, WeaponParrySchema } from "./fields/weapon-parry.ts"
import { WeaponReach, WeaponReachSchema } from "./fields/weapon-reach.ts"
import { WeaponBlock, WeaponBlockSchema } from "./fields/weapon-block.ts"
import { WeaponStrength } from "./fields/weapon-strength.ts"
import { WeaponDamage } from "./fields/weapon-damage.ts"
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
		const parry = this.parry.resolveValue(this, buffer)
		let parryTooltip = addBuffer(parry.tooltip(this), buffer)

		buffer.clear()
		const block = this.block.resolveValue(this, buffer)
		let blockTooltip = addBuffer("", buffer)

		buffer.clear()
		const damage = this.damage.resolveValue(this, buffer)
		let damageTooltip = addBuffer("", buffer)

		buffer.clear()
		const reach = this.reach.resolveValue(this, buffer)
		let reachTooltip = addBuffer(reach.tooltip(this), buffer)

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

interface WeaponMeleeData
	extends Omit<
		ModelPropsFromSchema<WeaponMeleeSchema>,
		"defaults" | "damage" | "strength" | "reach" | "parry" | "block"
	> {
	defaults: SkillDefault[]
	strength: WeaponStrength
	damage: WeaponDamage
	reach: WeaponReach
	parry: WeaponParry
	block: WeaponBlock
}

type WeaponMeleeSchema = BasicInformationTemplateSchema &
	AbstractWeaponTemplateSchema & {
		reach: fields.SchemaField<WeaponReachSchema>
		parry: fields.SchemaField<WeaponParrySchema>
		block: fields.SchemaField<WeaponBlockSchema>
	}

export { WeaponMeleeData, type WeaponMeleeSchema }
