import { ActorGURPS } from "@actor"
import { AbstractContainerGURPS, EquipmentGURPS } from "@item"
import { EquipmentContainerSource, EquipmentContainerSystemData } from "./data.ts"
import { EquipmentFlags } from "@item/equipment/data.ts"
import { ItemFlags, ItemType, SYSTEM_NAME } from "@module/data/constants.ts"
import { ItemInstances } from "@item/types.ts"
import { Int, Weight, WeightUnits } from "@util"
import {
	extendedWeightAdjustedForModifiers,
	valueAdjustedForModifiers,
	weightAdjustedForModifiers,
} from "@item/helpers.ts"
import { SheetSettings } from "@system"
import { Nameable } from "@module/util/nameable.ts"

class EquipmentContainerGURPS<
	TParent extends ActorGURPS | null = ActorGURPS | null,
> extends AbstractContainerGURPS<TParent> {
	get other(): boolean {
		if (this.container?.isOfType(ItemType.EquipmentContainer)) return this.container.other
		return this.flags[SYSTEM_NAME][ItemFlags.Other]
	}

	// Gets weight in pounds
	get weight(): number {
		return Weight.fromString(this.system.weight, this.weightUnits)
	}

	get weightUnits(): WeightUnits {
		return SheetSettings.for(this.actor).default_weight_units
	}

	get weightString(): string {
		return Weight.format(this.weight, this.weightUnits)
	}

	get equipped(): boolean {
		return this.system.equipped && !this.other
	}

	get modifiers(): Collection<
		ItemInstances<TParent>[ItemType.EquipmentModifier] | ItemInstances<TParent>[ItemType.EquipmentModifierContainer]
	> {
		return new Collection(
			this.contents
				.filter(item => item.isOfType(ItemType.EquipmentModifier, ItemType.EquipmentModifierContainer))
				.map(item => [
					item.id,
					item as
						| ItemInstances<TParent>[ItemType.EquipmentModifier]
						| ItemInstances<TParent>[ItemType.EquipmentModifierContainer],
				]),
		)
	}

	get deepModifiers(): Collection<ItemInstances<TParent>[ItemType.EquipmentModifier]> {
		return new Collection(
			this.deepContents
				.filter(item => item.isOfType(ItemType.EquipmentModifier))
				.map(item => [item.id, item as ItemInstances<TParent>[ItemType.EquipmentModifier]]),
		)
	}

	get children(): Collection<
		ItemInstances<TParent>[ItemType.Equipment] | ItemInstances<TParent>[ItemType.EquipmentContainer]
	> {
		return new Collection(
			this.contents
				.filter(item => item.isOfType(ItemType.Equipment, ItemType.EquipmentContainer))
				.map(item => [
					item.id,
					item as
						| ItemInstances<TParent>[ItemType.Equipment]
						| ItemInstances<TParent>[ItemType.EquipmentContainer],
				]),
		)
	}

	get adjustedValue(): number {
		return Int.from(valueAdjustedForModifiers(this.system.value, this.deepModifiers))
	}

	get extendedValue(): number {
		if (this.system.quantity <= 0) return 0
		let value = this.adjustedValue
		for (const ch of this.children) {
			value += ch.extendedValue
		}
		return Int.from(value * this.system.quantity)
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

	/** Can the provided item stack with this item? */
	isStackableWith(_item: EquipmentGURPS): false {
		return false
	}

	/**  Replacements */
	get nameWithReplacements(): string {
		return Nameable.apply(this.system.description, this.nameableReplacements)
	}

	get notesWithReplacements(): string {
		return Nameable.apply(this.system.notes, this.nameableReplacements)
	}

	/** Nameables */
	fillWithNameableKeys(m: Map<string, string>, existing?: Map<string, string>): void {
		this.fillWithLocalNameableKeys(m, existing)
		this.deepModifiers.forEach(mod => {
			mod.fillWithNameableKeys(m, mod.nameableReplacements)
		})
	}

	protected fillWithLocalNameableKeys(m: Map<string, string>, existing?: Map<string, string>): void {
		if (!existing) existing = this.nameableReplacements

		Nameable.extract(this.system.description, m, existing)
		Nameable.extract(this.system.notes, m, existing)
		if (this.prereqs) {
			this.prereqs.fillWithNameableKeys(m, existing)
		}
		for (const feature of this.features) {
			feature.fillWithNameableKeys(m, existing)
		}
		for (const weapon of this.itemCollections.weapons) {
			weapon.fillWithNameableKeys(m, existing)
		}
	}
}

interface EquipmentContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
	extends AbstractContainerGURPS<TParent> {
	flags: EquipmentFlags
	readonly _source: EquipmentContainerSource
	system: EquipmentContainerSystemData
}

export { EquipmentContainerGURPS }
