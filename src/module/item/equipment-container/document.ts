import { ActorGURPS } from "@actor"
import { AbstractContainerGURPS, EquipmentGURPS } from "@item"
import { EquipmentContainerSource, EquipmentContainerSystemData } from "./data.ts"
import { EquipmentFlags } from "@item/equipment/data.ts"
import { ItemFlags, ItemType, SYSTEM_NAME } from "@module/data/constants.ts"
import { ItemInstances } from "@item/types.ts"
import { Int, LocalizeGURPS, Weight, WeightString, WeightUnits } from "@util"
import {
	extendedWeightAdjustedForModifiers,
	valueAdjustedForModifiers,
	weightAdjustedForModifiers,
} from "@item/helpers.ts"
import { sheetSettingsFor } from "@module/data/sheet-settings.ts"
import { Feature, PrereqList } from "@system"

const fields = foundry.data.fields

class EquipmentContainerGURPS<
	TParent extends ActorGURPS | null = ActorGURPS | null,
> extends AbstractContainerGURPS<TParent> {
	static override defineSchema(): foundry.documents.ItemSchema<string, object> {
		return this.mergeSchema(super.defineSchema(), {
			system: new fields.SchemaField({
				type: new fields.StringField({ required: true, initial: ItemType.EquipmentContainer }),
				description: new fields.StringField({
					required: true,
					initial: LocalizeGURPS.translations.TYPES.Item[ItemType.EquipmentContainer],
				}),
				reference: new fields.StringField(),
				reference_highlight: new fields.StringField(),
				notes: new fields.StringField(),
				vtt_notes: new fields.StringField(),
				tech_level: new fields.StringField(),
				legality_class: new fields.StringField(),
				tags: new fields.ArrayField(new foundry.data.fields.StringField()),
				rated_strength: new fields.NumberField({ required: false, min: 0, initial: 0 }),
				quantity: new fields.NumberField({ min: 0, initial: 1 }),
				value: new fields.NumberField({ min: 0, initial: 0 }),
				weight: new fields.StringField<WeightString>({ initial: `0 ${WeightUnits.Pound}` }),
				max_uses: new fields.NumberField({ min: 0, initial: 0, integer: true }),
				uses: new fields.NumberField({ min: 0, initial: 0, integer: true }),
				prereqs: new fields.SchemaField(PrereqList.defineSchema()),
				features: new fields.ArrayField(new fields.ObjectField<Feature>()),
				equipped: new fields.BooleanField({ initial: true }),
				ignore_weight_for_skills: new fields.BooleanField({ initial: false }),
				open: new fields.BooleanField({ initial: false }),
			}),
		})
	}

	get other(): boolean {
		if (this.container?.isOfType(ItemType.EquipmentContainer)) return this.container.other
		return this.flags[SYSTEM_NAME][ItemFlags.Other]
	}

	// Gets weight in pounds
	get weight(): number {
		return Weight.fromString(this.system.weight, this.weightUnits)
	}

	get weightUnits(): WeightUnits {
		return sheetSettingsFor(this.actor).default_weight_units
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
}

interface EquipmentContainerGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
	extends AbstractContainerGURPS<TParent> {
	flags: EquipmentFlags
	readonly _source: EquipmentContainerSource
	system: EquipmentContainerSystemData
}

export { EquipmentContainerGURPS }
