import { ActorGURPS } from "@actor"
import { ItemGURPS } from "@item"
import { EquipmentModifierSource, EquipmentModifierSystemData } from "./data.ts"
import { LocalizeGURPS, StringBuilder, Weight, WeightUnits, emcost, emweight } from "@util"
import { sheetSettingsFor } from "@module/data/sheet-settings.ts"

class EquipmentModifierGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGURPS<TParent> {
	get enabled(): boolean {
		return !this.system.disabled
	}

	get techLevel(): string {
		return this.system.tech_level
	}

	get costType(): emcost.Type {
		return this.system.cost_type
	}

	get weightType(): emweight.Type {
		return this.system.weight_type
	}

	get costAmount(): string {
		return this.system.cost
	}

	get weightAmount(): string {
		return this.system.weight
	}

	get weightUnits(): WeightUnits {
		return sheetSettingsFor(this.actor).default_weight_units
	}

	get costDescription(): string {
		if (this.costType === emcost.Type.Original && (this.costAmount === "" || this.costAmount === "+0")) return ""
		return `${parseFloat(this.costAmount).signedString()} ${
			LocalizeGURPS.translations.gurps.item.cost_type[this.costType]
		}`
	}

	get weightDescription(): string {
		if (
			this.weightType === emweight.Type.Original &&
			(this.weightAmount === "" || this.weightAmount.startsWith("+0"))
		)
			return ""
		return `${
			(Weight.fromString(this.weightUnits) >= 0 ? "+" : "") +
			Weight.format(Weight.fromString(this.weightAmount), this.weightUnits)
		} ${emweight.Type.toString(this.weightType)}`
	}

	get fullDescription(): string {
		const buffer = new StringBuilder()
		buffer.push(this.formattedName)
		if (this.localNotes !== "") {
			buffer.push(` (${this.localNotes})`)
		}
		if (sheetSettingsFor(this.actor).show_equipment_modifier_adj) {
			const costDesc = this.costDescription
			const weightDesc = this.weightDescription
			if (costDesc !== "" || weightDesc !== "") {
				buffer.push(" [")
				buffer.push(costDesc)
				if (weightDesc !== "") {
					if (costDesc !== "") buffer.push("; ")
					buffer.push(weightDesc)
				}
				buffer.push("]")
			}
		}
		return buffer.toString()
	}
}

interface EquipmentModifierGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGURPS<TParent> {
	readonly _source: EquipmentModifierSource
	system: EquipmentModifierSystemData
}

export { EquipmentModifierGURPS }
