import { ContainedWeightReduction } from "@feature/contained_weight_reduction"
import { EquipmentContainerGURPS } from "@item/equipment_container"
import { EquipmentModifierGURPS, valueAdjustedForModifiers, weightAdjustedForModifiers } from "@item/equipment_modifier"
import { EquipmentModifierContainerGURPS } from "@item/equipment_modifier_container"
import { ItemGCS } from "@item/gcs"
import { DisplayMode, SETTINGS, SYSTEM_NAME } from "@module/data"
import {
	Weight,
	WeightUnits,
	fxp,
} from "@util"
import { HandlebarsHelpersGURPS } from "@util/handlebars_helpers"
import { EquipmentData } from "./data"
import { Feature } from "@module/config"

export class EquipmentGURPS extends ItemGCS {
	readonly system!: EquipmentData

	unsatisfied_reason = ""

	// Getters
	get ratedStrength(): number {
		return this.system.rated_strength
	}

	get secondaryText(): string {
		let outString = '<div class="item-notes">'
		let display_mode = (game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.settings`) as any)
			.modifiers_display as DisplayMode
		if (this.actor) display_mode = this.actor.settings.modifiers_display
		if ([DisplayMode.Inline, DisplayMode.InlineAndTooltip].includes(display_mode)) {
			this.modifiers
				.filter(e => e.enabled)
				.forEach((mod, i) => {
					if (i !== 0) outString += "; "
					outString += mod.name + (mod.system.notes ? ` (${mod.system.notes})` : "")
				})
		}
		if (this.modifiers.some(e => e.enabled)) outString += "<br>"
		if (this.system.notes) outString += HandlebarsHelpersGURPS.format(this.system.notes)
		if (this.unsatisfied_reason) outString += HandlebarsHelpersGURPS.unsatisfied(this.unsatisfied_reason)
		outString += "</div>"
		return outString
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

	// get weightString(): string {
	// 	return Weight.format(this.weight, this.weightUnits)
	// }

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

	// Value Calculator
	get extendedValue(): number {
		if (this.system.quantity <= 0) return 0
		let value = this.adjustedValue
		for (const ch of this.children) {
			value += ch.extendedValue
		}
		return fxp.Int.from(value * this.system.quantity)
	}

	adjustedWeight(forSkills: boolean, defUnits: WeightUnits): number {
		if (forSkills && this.system.ignore_weight_for_skills) return 0
		return weightAdjustedForModifiers(Weight.fromString(this.system.weight, defUnits), this.deepModifiers, defUnits)
	}

	get adjustedWeightFast(): string {
		return Weight.format(this.adjustedWeight(false, this.weightUnits), this.weightUnits)
	}

	extendedWeight(forSkills: boolean, defUnits: WeightUnits): number {
		return extendedWeightAdjustedForModifiers(defUnits, this.system.quantity, this.weight, this.deepModifiers, this.features, this.children, forSkills, this.system.ignore_weight_for_skills && this.equipped)
	}

	get extendedWeightFast(): string {
		return Weight.format(this.extendedWeight(false, this.weightUnits), this.weightUnits)
	}

	prepareBaseData(): void {
		this.system.weight = Weight.format(this.weight, this.weightUnits)
		super.prepareBaseData()
	}

	override exportSystemData(keepOther: boolean): any {
		const system: any = super.exportSystemData(keepOther)
		system.type = "equipment"
		system.description = this.name
		delete system.name
		system.calc = {
			extended_value: this.extendedValue,
			extended_weight: this.extendedWeightFast,
		}
		return system
	}

	toggleState(): void {
		this.equipped = !this.equipped
	}

}

export function extendedWeightAdjustedForModifiers(
	defUnits: WeightUnits,
	quantity: number,
	baseWeight: number,
	modifiers: Collection<EquipmentModifierGURPS>,
	features: Feature[],
	children: Collection<EquipmentGURPS | EquipmentContainerGURPS>,
	forSkills: boolean,
	weightIgnoredForSkills: boolean
): number {
	if (quantity <= 0) return 0
	let base = 0
	if (!forSkills || !weightIgnoredForSkills)
		base = fxp.Int.from(weightAdjustedForModifiers(baseWeight, modifiers, defUnits))
	if (children.size) {
		let contained = 0
		children.forEach(child => {
			contained += fxp.Int.from(child.extendedWeight(forSkills, defUnits))
		})
		let [percentage, reduction] = [0, 0]
		features.forEach(feature => {
			if (feature instanceof ContainedWeightReduction) {
				if (feature.isPercentageReduction) percentage += feature.percentageReduction
				else reduction += fxp.Int.from(feature.fixedReduction(defUnits))
			}
		})
		if (percentage >= 100) contained = 0
		else if (percentage > 0) contained -= contained * percentage / 100
		base += Math.max(0, contained - reduction)
	}
	return fxp.Int.from(base * quantity)
}
