import { ActorGURPS } from "@actor"
import * as R from "remeda"
import { AbstractContainerGURPS } from "@item"
import { EquipmentFlags, EquipmentSource, EquipmentSystemData } from "./data.ts"
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

class EquipmentGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractContainerGURPS<TParent> {
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

	get adjustedValue(): number {
		return Int.from(valueAdjustedForModifiers(this.system.value, this.deepModifiers))
	}

	get extendedValue(): number {
		if (this.system.quantity <= 0) return 0
		return this.adjustedValue
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
			new Collection(),
			forSkills,
			this.system.ignore_weight_for_skills && this.equipped,
		)
	}

	/** Can the provided item stack with this item? */
	isStackableWith(item: EquipmentGURPS): boolean {
		const preCheck = this !== item && this.type === item.type && this.name === item.name
		if (!preCheck) return false

		const thisData = this.toObject()
		const otherData = item.toObject()
		thisData.system.quantity = otherData.system.quantity
		thisData.system.equipped = otherData.system.equipped
		thisData.flags[SYSTEM_NAME]![ItemFlags.Container] = otherData.flags[SYSTEM_NAME]![ItemFlags.Container]
		thisData.system._migration = otherData.system._migration

		return R.isDeepEqual(thisData, otherData)
	}

	/** Combine this item with a target item if possible */
	async stackWith(targetItem: EquipmentGURPS): Promise<void> {
		if (this.isStackableWith(targetItem)) {
			const stackQuantity = this.system.quantity + targetItem.system.quantity
			if (await this.delete({ render: false })) {
				await targetItem.update({ "system.quantity": stackQuantity })
			}
		}
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

interface EquipmentGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
	extends AbstractContainerGURPS<TParent> {
	flags: EquipmentFlags
	readonly _source: EquipmentSource
	system: EquipmentSystemData
}

export { EquipmentGURPS }
