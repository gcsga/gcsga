import { ActorGURPS } from "@actor/base.ts"
import { ItemGCS } from "@item/gcs/document.ts"
import { EquipmentContainerSystemSource } from "./data.ts"
import { display } from "@util/enum/display.ts"
import { StringBuilder } from "@util/string_builder.ts"
import { sheetSettingsFor } from "@module/data/sheet_settings.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { SETTINGS, SYSTEM_NAME } from "@module/data/misc.ts"
import { Weight, WeightUnits } from "@util/weight.ts"
import { EquipmentGURPS, extendedWeightAdjustedForModifiers } from "@item/equipment/document.ts"
import {
	EquipmentModifierGURPS,
	valueAdjustedForModifiers,
	weightAdjustedForModifiers,
} from "@item/equipment_modifier/document.ts"
import { EquipmentModifierContainerGURPS } from "@item/equipment_modifier_container/document.ts"
import { Int } from "@util/fxp.ts"
import { ItemType } from "@item/types.ts"
import { CharacterResolver } from "@util"
import { ItemFlags } from "@item/base/data/system.ts"
import { CharacterGURPS } from "@actor"

export interface EquipmentContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
	extends ItemGCS<TParent> {
	system: EquipmentContainerSystemSource
	type: ItemType.EquipmentContainer
}

export class EquipmentContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends ItemGCS<TParent> {
	// unsatisfied_reason = ""

	// Getters
	override get ratedStrength(): number {
		return this.system.rated_strength ?? 0
	}

	get quantity(): number {
		return this.system.quantity
	}

	override secondaryText(optionChecker: (option: display.Option) => boolean): string {
		const buffer = new StringBuilder()
		const settings = sheetSettingsFor(this.actor as unknown as CharacterResolver)
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
		if (this.actor instanceof CharacterGURPS) return this.actor.weightUnits
		const default_settings = game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.settings`)
		return default_settings.default_weight_units
	}

	get weightString(): string {
		return Weight.format(this.weight, this.weightUnits)
	}

	get isGreyedOut(): boolean {
		return !(
			this.system.quantity > 0 &&
			!(this.container instanceof CompendiumCollection) &&
			(this.container instanceof EquipmentContainerGURPS ? !this.container.isGreyedOut : true)
		)
	}

	override get enabled(): boolean {
		return this.equipped
	}

	get equipped(): boolean {
		return this.system.equipped && !this.other
	}

	set equipped(equipped: boolean) {
		this.system.equipped = equipped
	}

	// Embedded Items
	override get children(): Collection<EquipmentGURPS | EquipmentContainerGURPS> {
		return super.children as Collection<EquipmentGURPS | EquipmentContainerGURPS>
	}

	override get modifiers(): Collection<EquipmentModifierGURPS | EquipmentModifierContainerGURPS> {
		const modifiers: Collection<EquipmentModifierGURPS> = new Collection()
		for (const item of this.items) {
			if (item instanceof EquipmentModifierGURPS) modifiers.set(item.id!, item)
		}
		return modifiers
	}

	get deepModifiers(): Collection<EquipmentModifierGURPS> {
		const deepModifiers: EquipmentModifierGURPS[] = []
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
			}),
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
		return Int.from(value * this.system.quantity, 4)
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
			this.system.ignore_weight_for_skills && this.equipped,
		)
	}

	get extendedWeightFast(): string {
		return Weight.format(this.extendedWeight(false, this.weightUnits), this.weightUnits)
	}

	override prepareBaseData(): void {
		this.system.weight = this.weightString
		super.prepareBaseData()
	}

	override exportSystemData(keepOther: boolean): Record<string, unknown> {
		const system = super.exportSystemData(keepOther)
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
