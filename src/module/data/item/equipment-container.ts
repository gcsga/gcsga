import { ItemType } from "../constants.ts"
import { FeatureSet } from "../feature/types.ts"
import { ItemGURPS2 } from "@module/document/item.ts"
import { EquipmentFieldsTemplate } from "./templates/equipment-fields.ts"
import { ItemTemplateType } from "./types.ts"
import { MaybePromise } from "../types.ts"
import { ItemInst } from "./helpers.ts"

class EquipmentContainerData extends EquipmentFieldsTemplate {
	static override childTypes = new Set([ItemType.Equipment, ItemType.EquipmentContainer])
	static override modifierTypes = new Set([ItemType.EquipmentModifier, ItemType.EquipmentModifierContainer])
	static override weaponTypes = new Set([ItemType.WeaponMelee, ItemType.WeaponRanged])

	override async getSheetData(context: Record<string, unknown>): Promise<void> {
		context.detailsParts = ["gurps.details-equipment", "gurps.details-prereqs", "gurps.details-features"]
		context.embedsParts = [
			"gurps.embeds-equipment-children",
			"gurps.embeds-equipment-modifiers",
			"gurps.embeds-weapons-melee",
			"gurps.embeds-weapons-ranged",
		]
	}

	override async extendedValue(): Promise<number> {
		if (this.quantity <= 0) return 0
		let value = await this.adjustedValue()
		const children = this.children as Collection<ItemGURPS2>
		for (const child of children) {
			if (child.hasTemplate(ItemTemplateType.EquipmentFields)) value += await child.system.extendedValue()
		}
		return value * this.quantity
	}

	/** Features */
	override addFeaturesToSet(featureSet: FeatureSet): void {
		if (!this.equipped) return

		for (const f of this.features) {
			this._addFeatureToSet(f, featureSet, 0)
		}
	}

	/** Nameables */
	protected override async _fillWithNameableKeysFromEmbeds(
		m: Map<string, string>,
		existing: Map<string, string>,
	): Promise<void> {
		const modifiers = await this.allModifiers
		const weapons = await this.weapons

		for (const modifier of modifiers) {
			modifier.system.fillWithNameableKeys(m, modifier.system.nameableReplacements)
		}
		for (const weapon of weapons) {
			weapon.system.fillWithNameableKeys(m, existing)
		}
	}
}

interface EquipmentContainerData {
	get children(): MaybePromise<Collection<ItemInst<ItemType.Equipment | ItemType.EquipmentContainer>>>
}

export { EquipmentContainerData }
