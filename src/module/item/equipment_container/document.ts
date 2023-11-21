import { EquipmentGURPS, extendedWeightAdjustedForModifiers } from "@item/equipment"
import { EquipmentModifierGURPS, valueAdjustedForModifiers, weightAdjustedForModifiers } from "@item/equipment_modifier"
import { EquipmentModifierContainerGURPS } from "@item/equipment_modifier_container"
import { ItemGCS } from "@item/gcs"
import { SETTINGS, SYSTEM_NAME } from "@module/data"
import {
	fxp,
	Weight,
	WeightUnits,
} from "@util"
import { EquipmentContainerData } from "./data"

export class EquipmentContainerGURPS extends ItemGCS {
	readonly system!: EquipmentContainerData

	unsatisfied_reason = ""

	// Getters
	get ratedStrength(): number {
		return this.system.rated_strength ?? 0
	}

	get other(): boolean {
		if (this.container instanceof Item) return (this.container as EquipmentContainerGURPS).other
		return this.system.other
	}

	// Gets weight in pounds
	get weight(): number {
		return Weight.fromString(this.system.weight, this.weightUnits)
	}

	get weightUnits(): WeightUnits {
		if (this.actor) return this.actor.weightUnits
		const default_settings = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.settings`) as any
		return default_settings.default_weight_units
	}

	get weightString(): string {
		return Weight.format(this.weight, this.weightUnits)
	}

	get enabled(): boolean {
		return this.equipped
	}

	get equipped(): boolean {
		return this.system.equipped && !this.other
	}

	set equipped(equipped: boolean) {
		this.system.equipped = equipped
	}

	// Embedded Items
	get children(): Collection<EquipmentGURPS | EquipmentContainerGURPS> {
		return super.children as Collection<EquipmentGURPS | EquipmentContainerGURPS>
	}

	get modifiers(): Collection<EquipmentModifierGURPS | EquipmentModifierContainerGURPS> {
		const modifiers: Collection<EquipmentModifierGURPS> = new Collection()
		for (const item of this.items) {
			if (item instanceof EquipmentModifierGURPS) modifiers.set(item.id!, item)
		}
		return modifiers
	}

	get deepModifiers(): Collection<EquipmentModifierGURPS> {
		const deepModifiers: Array<EquipmentModifierGURPS> = []
		for (const mod of this.modifiers) {
			if (mod instanceof EquipmentModifierGURPS) deepModifiers.push(mod)
			else
				for (const e of mod.deepItems) {
					if (e instanceof EquipmentModifierGURPS) deepModifiers.push(e)
				}
		}
		return new Collection(
			deepModifiers.map(item => {
				return [item.id!, item]
			})
		)
	}

	get adjustedValue(): number {
		return valueAdjustedForModifiers(this.system.value, this.deepModifiers)
	}

	get extendedValue(): number {
		if (this.system.quantity <= 0) return 0
		let value = this.adjustedValue
		for (const ch of this.children) {
			value += ch.extendedValue
		}
		return fxp.Int.from(value * this.system.quantity, 4)
	}

	adjustedWeight(forSkills: boolean, defUnits: WeightUnits): number {
		if (forSkills && this.system.ignore_weight_for_skills) return 0
		return weightAdjustedForModifiers(Weight.fromString(this.system.weight, defUnits), this.deepModifiers, defUnits)
	}

	get adjustedWeightFast(): string {
		return Weight.format(this.adjustedWeight(false, this.weightUnits), this.weightUnits)
	}

	extendedWeight(forSkills: boolean, defUnits: WeightUnits): number {
		return extendedWeightAdjustedForModifiers(
			defUnits,
			this.system.quantity,
			this.weight,
			this.deepModifiers,
			this.features,
			this.children,
			forSkills,
			this.system.ignore_weight_for_skills && this.equipped
		)
	}

	get extendedWeightFast(): string {
		return Weight.format(this.extendedWeight(false, this.weightUnits), this.weightUnits)
	}

	prepareBaseData(): void {
		this.system.weight = this.weightString
		super.prepareBaseData()
	}

	override exportSystemData(keepOther: boolean): any {
		const system: any = super.exportSystemData(keepOther)
		system.description = this.name
		delete system.name
		system.calc = {
			extended_value: this.extendedValue,
			extended_weight: Weight.format(this.extendedWeight(false, this.weightUnits), this.weightUnits),
		}
		return system
	}

	toggleState(): void {
		this.equipped = !this.equipped
	}
}
