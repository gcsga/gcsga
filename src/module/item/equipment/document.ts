import { ActorGURPS } from "@actor"
import * as R from "remeda"
import { AbstractContainerGURPS } from "@item"
import { EquipmentFlags, EquipmentSource, EquipmentSystemData } from "./data.ts"
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

class EquipmentGURPS<TParent extends ActorGURPS | null = ActorGURPS | null> extends AbstractContainerGURPS<TParent> {
	static override defineSchema(): foundry.documents.ItemSchema<string, object> {
		return this.mergeSchema(super.defineSchema(), {
			system: new fields.SchemaField({
				type: new fields.StringField({ required: true, initial: ItemType.Equipment }),
				description: new fields.StringField({
					required: true,
					initial: LocalizeGURPS.translations.TYPES.Item[ItemType.Equipment],
				}),
				reference: new fields.StringField(),
				reference_highlight: new fields.StringField(),
				notes: new fields.StringField(),
				vtt_notes: new fields.StringField(),
				tech_level: new fields.StringField(),
				legality_class: new fields.StringField(),
				tags: new fields.ArrayField(new foundry.data.fields.StringField()),
				rated_strength: new fields.NumberField({ nullable: true, min: 0, initial: null }),
				quantity: new fields.NumberField({ min: 0, initial: 1 }),
				value: new fields.NumberField({ min: 0, initial: 0 }),
				weight: new fields.StringField<WeightString>({ initial: `0 ${WeightUnits.Pound}` }),
				max_uses: new fields.NumberField({ min: 0, initial: 0, integer: true }),
				uses: new fields.NumberField({ min: 0, initial: 0, integer: true }),
				prereqs: new fields.SchemaField(PrereqList.defineSchema()),
				features: new fields.ArrayField(new fields.ObjectField<Feature>()),
				equipped: new fields.BooleanField({ initial: true }),
				ignore_weight_for_skills: new fields.BooleanField({ initial: false }),
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

		return R.equals(thisData, otherData)
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
}

interface EquipmentGURPS<TParent extends ActorGURPS | null = ActorGURPS | null>
	extends AbstractContainerGURPS<TParent> {
	flags: EquipmentFlags
	readonly _source: EquipmentSource
	system: EquipmentSystemData
}

export { EquipmentGURPS }
