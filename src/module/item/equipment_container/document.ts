import { EquipmentGURPS, extendedWeightAdjustedForModifiers } from "@item/equipment"
import { EquipmentModifierGURPS, valueAdjustedForModifiers, weightAdjustedForModifiers } from "@item/equipment_modifier"
import { EquipmentModifierContainerGURPS } from "@item/equipment_modifier_container"
import { ItemGCS } from "@item/gcs"
import { ItemType, SETTINGS, SYSTEM_NAME, sheetSettingsFor } from "@module/data"
import { fxp, LocalizeGURPS, Weight, WeightUnits } from "@util"
import { EquipmentContainerSource } from "./data"
import { ItemFlags } from "@item/base"
import { display } from "@util/enum"
import { StringBuilder } from "@util/string_builder"

export class EquipmentContainerGURPS extends ItemGCS<EquipmentContainerSource> {
	unsatisfied_reason = ""

	// Getters
	get ratedStrength(): number {
		return this.system.rated_strength ?? 0
	}

	get quantity(): number {
		return this.system.quantity
	}

	secondaryText(optionChecker: (option: display.Option) => boolean): string {
		const buffer = new StringBuilder()
		const settings = sheetSettingsFor(this.actor)
		if (optionChecker(settings.modifiers_display)) {
			buffer.appendToNewLine(this.modifierNotes)
		}
		if (optionChecker(settings.notes_display)) {
			const localBuffer = new StringBuilder()
			if (this.ratedStrength !== 0) {
				localBuffer.push(LocalizeGURPS.translations.gurps.item.rated_strength)
				localBuffer.push(" ")
				localBuffer.push(this.ratedStrength.toString())
			}
			if (this.localNotes !== "") {
				if (localBuffer.length !== 0) localBuffer.push("; ")
				localBuffer.push(this.localNotes)
			}
			buffer.appendToNewLine(localBuffer.toString())
		}
		return buffer.toString()
	}

	get modifierNotes(): string {
		const buffer = new StringBuilder()
		for (const mod of this.deepModifiers.filter(e => e.enabled)) {
			if (buffer.length !== 0) buffer.push("; ")
			buffer.push(mod.fullDescription)
		}
		return buffer.toString()
	}

	get other(): boolean {
		if (this.container instanceof Item) return (this.container as EquipmentContainerGURPS).other
		return this.getFlag(SYSTEM_NAME, ItemFlags.Other) as boolean
	}

	// Gets weight in pounds
	get weight(): number {
		return Weight.fromString(this.system.weight, this.weightUnits)
	}

	get weightUnits(): WeightUnits {
		if (this.actor) return this.actor.weightUnits
		const default_settings = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.settings`)
		return default_settings.default_weight_units
	}

	get weightString(): string {
		return Weight.format(this.weight, this.weightUnits)
	}

	get isGreyedOut(): boolean {
		return !(
			this.system.quantity > 0 &&
			(this.container?.type === ItemType.EquipmentContainer ? !(this.container as any).isGreyedOut : true)
		)
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
